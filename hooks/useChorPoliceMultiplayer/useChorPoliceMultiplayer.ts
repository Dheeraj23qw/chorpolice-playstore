import { useState, useEffect, useCallback, useRef } from "react";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppDispatch, RootState } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import {
  setPlayerNames as setReduxPlayerNames,
  updatePlayerScores as updateReduxScores,
} from "@/redux/reducers/playerReducer";
import {
  clearSession,
  setGamePhase as setReduxGamePhase,
  setMyRole as setReduxMyRole,
  setRoundState as setReduxRoundState,
  resetGameState,
  type GamePhase,
} from "@/redux/reducers/sessionSlice";
import {
  selectGamePhase,
  selectIsHost,
  selectLocalPlayerId,
  selectMyRole,
  selectPoliceIndex,
  selectKingIndex,
  selectRoles,
  selectCurrentRound,
  selectTotalRounds,
  selectStake,
} from "@/redux/selectors/sessionSelectors";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import useRandomMessage from "../useRandomMessage";

import {
  broadcastPacket,
  handleIncomingPacket,
  sendPacketToHost,
  stopSession,
  subscribeToPackets,
} from "@/service/lanGameService";
import { MODES, NETWORK } from "@/constants/Networking";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";
import { flipCard } from "./helpers/flipCardUtil";
import { updateCoins } from "@/features/wallet/walletSlice";
import { recordCPGame } from "@/features/gameStats/gameStatsActions";
import { revealAllCards } from "./helpers/revealAllCardsUtils";
/**
 * --- CHOR POLICE MULTIPLAYER HOOK ---
 *
 * ARCHITECTURE (Option B — Pragmatic Refactor):
 * - All STATE reads come from Redux selectors (sessionSlice)
 * - All STATE writes go through Redux dispatch
 * - The packet listener is kept for SIDE EFFECTS only (animations, audio, popups)
 * - ChorPoliceEngine.state is a write-through cache; Redux is authoritative
 *
 * CRITICAL: The useEffect that listens to packets runs ONCE on mount.
 * All mutable values are accessed via REFS to prevent re-subscription
 * which would kill pending animation timers.
 */

type Role = "King" | "Police" | "Thief" | "Advisor";
type ScoreQuizParticipant = {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
};

const D = "🎭 [CPHook]";

const HOST_TIMEOUT_MS = 10000;

export const useChorPoliceMultiplayer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams<{
    playerId?: string;
    isHost?: string;
  }>();

  // ═══════════════════════════════════════════════════════
  // RULE 10: ALL state reads come from Redux selectors
  // ═══════════════════════════════════════════════════════
  const reduxGamePhase = useSelector(selectGamePhase);
  const reduxIsHost = useSelector(selectIsHost);
  const reduxLocalPlayerId = useSelector(selectLocalPlayerId);
  const reduxMyRole = useSelector(selectMyRole);
  const reduxPoliceIndex = useSelector(selectPoliceIndex);
  const reduxKingIndex = useSelector(selectKingIndex);
  // FIX BUG-1: these were illegally called inside the return object — moved here
  const reduxAdvisorIndex = useSelector((state: RootState) => state.session.advisorIndex);
  const reduxThiefIndex = useSelector((state: RootState) => state.session.thiefIndex);
  const reduxRoles = useSelector(selectRoles);
  const reduxCurrentRound = useSelector(selectCurrentRound);
  const reduxTotalRounds = useSelector(selectTotalRounds);
  const reduxStake = useSelector(selectStake);

  // Params override for initial identity (from navigation)
  const localPlayerId =
    typeof params.playerId === "string"
      ? params.playerId
      : reduxLocalPlayerId || "host_id";
  const isHost =
    typeof params.isHost === "string"
      ? params.isHost === "true"
      : reduxIsHost;

  // ── UI-only local state (animations, popups — not game logic) ──
  const [nextPhase, setNextPhase] = useState<GamePhase>("score_quiz");
  const playTransition = useCallback((afterPhase: GamePhase) => {
    setNextPhase(afterPhase);
    dispatch(setReduxGamePhase("video_transition"));
  }, [dispatch]);

  // ─── Card / Flip state (purely UI animation — NOT game logic) ───
  const [flipAnims, setFlipAnims] = useState<Animated.Value[]>(() =>
    Array(4)
      .fill(null)
      .map(() => new Animated.Value(0)),
  );
  // FIX BUG-7: stable ref so handleCardClick useCallback doesn't get new ref every round
  const flipAnimsRef = useRef(flipAnims);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [clickedCards, setClickedCards] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  // Player names derived from engine for display (populated on PUBLIC_REVEAL)
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const players = ChorPoliceEngine.state.players;
    if (players.length === 4) {
      return players.map((player) => player.name);
    }
    return ["", "", "", ""];
  });
  const [scoreQuizPlayers, setScoreQuizPlayers] = useState<
    ScoreQuizParticipant[]
  >(() =>
    ChorPoliceEngine.state.players.map((player) => ({
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      isBot: player.isBot,
    })),
  );
  const [isPlayButtonDisabled, setIsPlayButtonDisabled] = useState(false);

  // ─── Score display state (UI-only — engine is authoritative) ───
  const [playerScores, setPlayerScores] = useState<
    Array<{ playerId: string; playerName: string; scores: (number | string)[] }>
  >(() =>
    ChorPoliceEngine.state.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      scores: [],
    })),
  );
  const [showTableButton, setShowTableButton] = useState(false);

  // ─── Popups (pure UI) ───
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | null>(
    null,
  );
  const [playerData, setPlayerData] = useState<any>({
    image: null,
    message: null,
    imageType: null,
    name: null,
  });
  
  // 🔥 Store dramatic reveal data
  const [revealData, setRevealData] = useState<{role: string; isCorrect: boolean; index: number} | null>(null);

  const [areCardsClickable, setAreCardsClickable] = useState(false);
  const [firstCardClicked, setFirstCardClicked] = useState(false);

  // ─── Score Quiz state (UI-only) ───
  const [quizPlayerIndex, setQuizPlayerIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizOptionDisabled, setQuizOptionDisabled] = useState(false);
  const quizOptionDisabledRef = useRef(false); // ref to avoid stale closure in bot timeouts
  const [quizDone, setQuizDone] = useState(false);
  const [message, setMessage] = useState("");

  // ─── Exit modal ───
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  // ─── Bounce anims ───
  const [bounceAnims] = useState(() =>
    Array(4)
      .fill(null)
      .map(() => new Animated.Value(1)),
  );

  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  const hasGuessedRef = useRef(false);
  const isQuittingRef = useRef(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundStartPendingRef = useRef(false);
  const scoreQuizStartedRef = useRef(false);
  const currentQuizPlayerIdRef = useRef<string | null>(null);
  const stakeDeductedRef = useRef(false);
  const lastHostSignalAtRef = useRef(Date.now());
  const hostDisconnectHandledRef = useRef(false);
  // FIX BUG-4,5: stable refs for values used inside the ONE-TIME packet listener
  const isHostRef = useRef(isHost);
  const localPlayerIdRef = useRef(localPlayerId);

  // ═══════════════════════════════════════════════════════
  // REFS for values accessed inside the packet listener.
  // These mirror Redux state so the ONE-TIME-MOUNT listener
  // can access current values without re-subscribing.
  // ═══════════════════════════════════════════════════════
  const gamePhaseRef = useRef<GamePhase>(reduxGamePhase);
  const myRoleRef = useRef<string | null>(reduxMyRole);
  const policeIndexRef = useRef(reduxPoliceIndex);
  const playerNamesRef = useRef(playerNames);
  const playerImagesRef = useRef(playerImages);
  const selectedImagesRef = useRef(selectedImages);
  const flippedStatesRef = useRef(flippedStates);
  const clickedCardsRef = useRef(clickedCards);

  // Keep refs in sync with Redux selectors and local state
  gamePhaseRef.current = reduxGamePhase;
  myRoleRef.current = reduxMyRole;
  policeIndexRef.current = reduxPoliceIndex;
  playerNamesRef.current = playerNames;
  playerImagesRef.current = playerImages;
  selectedImagesRef.current = selectedImages;
  flippedStatesRef.current = flippedStates;
  clickedCardsRef.current = clickedCards;
  flipAnimsRef.current = flipAnims;
  isHostRef.current = isHost;
  localPlayerIdRef.current = localPlayerId;

  // Derived values from Redux
  const canSeeBoard = reduxMyRole === "Police" || reduxMyRole === null;
  const canInteract = reduxMyRole === "Police";

  // Random messages
  const pName =
    reduxPoliceIndex !== null && reduxPoliceIndex >= 0
      ? playerNames[reduxPoliceIndex] || ""
      : "";
  const randomMessageWin = useRandomMessage("win", pName);
  const randomMessageLose = useRandomMessage("lose", pName);
  const randomMessageWinRef = useRef(randomMessageWin);
  const randomMessageLoseRef = useRef(randomMessageLose);
  randomMessageWinRef.current = randomMessageWin;
  randomMessageLoseRef.current = randomMessageLose;
  const stakeRef = useRef(reduxStake);
  stakeRef.current = reduxStake;

  // ─── Score table ───
  const [popupTable, setPopupTable] = useState(false);
  const toggleModal = useCallback(() => setPopupTable((p) => !p), []);
  const getActiveStake = useCallback(() => {
    return stakeRef.current > 0 ? stakeRef.current : ChorPoliceEngine.state.stake;
  }, []);
  const scoreQuizPlayersRef = useRef(scoreQuizPlayers);
  const playerScoresRef = useRef(playerScores);
  playerScoresRef.current = playerScores;

  const setScoreQuizPlayersSnapshot = useCallback(
    (players: ScoreQuizParticipant[]) => {
      scoreQuizPlayersRef.current = players;
      setScoreQuizPlayers(players);
      return players;
    },
    [],
  );

  const resolveScoreQuizPlayers = useCallback((): ScoreQuizParticipant[] => {
    const enginePlayers = ChorPoliceEngine.state.players.map((player) => ({
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      isBot: player.isBot,
    }));

    if (enginePlayers.length > 0) {
      return setScoreQuizPlayersSnapshot(enginePlayers);
    }

    if (scoreQuizPlayersRef.current.length > 0) {
      return scoreQuizPlayersRef.current;
    }

    const fallbackPlayers = playerScoresRef.current
      .filter((player) => typeof player.playerId === "string")
      .map((player, index) => ({
        id: player.playerId,
        name: player.playerName,
        avatarId: selectedImagesRef.current[index] || 1,
        isBot: false,
      }));

    if (fallbackPlayers.length > 0) {
      return setScoreQuizPlayersSnapshot(fallbackPlayers);
    }

    return [];
  }, [setScoreQuizPlayersSnapshot]);

  const buildQuizOptions = useCallback((baseScore: number) => {
    const variations = [500, 800];
    const randomOptions = new Set<number>([baseScore]);

    while (randomOptions.size < 3) {
      const variation =
        variations[Math.floor(Math.random() * variations.length)];
      const nextScore = Math.max(
        0,
        baseScore + (Math.random() < 0.5 ? -variation : variation),
      );

      randomOptions.add(nextScore);
    }

    return Array.from(randomOptions).sort(() => Math.random() - 0.5);
  }, []);

  // FIX BUG-3: was a plain function — caused the scoreQuiz useEffect to re-fire every render
  const queueScoreQuizTurn = useCallback((playerIndex: number) => {
    if (!isHostRef.current) {
      return;
    }

    const CP = MODES.CHOR_POLICE;
    const players = resolveScoreQuizPlayers();

    if (playerIndex >= players.length) {
      setQuizDone(true);
      setQuizOptionDisabled(true);
      quizOptionDisabledRef.current = true;
      currentQuizPlayerIdRef.current = null;

      const endTimer = setTimeout(() => {
        ChorPoliceEngine.endGame();
      }, 1200);
      timerRefs.current.push(endTimer);
      return;
    }

    const player = players[playerIndex];
    const correctScore =
      ChorPoliceEngine.state.scores[player.id]?.totalScore ?? 0;
    const options = buildQuizOptions(correctScore);

    broadcastPacket({
      type: CP.SCORE_QUIZ_TURN,
      playerId: player.id,
      playerIndex,
      options,
    });
  }, [buildQuizOptions]);

  useEffect(() => {
    if (reduxGamePhase !== "score_quiz" || !isHost || scoreQuizStartedRef.current) {
      return;
    }

    scoreQuizStartedRef.current = true;

    const startTimer = setTimeout(() => {
      queueScoreQuizTurn(0);
    }, 300);
    timerRefs.current.push(startTimer);
  }, [reduxGamePhase, isHost, queueScoreQuizTurn]);

  useEffect(() => {
    if (stakeDeductedRef.current) {
      return;
    }

    const stake = getActiveStake();
    if (stake <= 0) {
      return;
    }

    stakeDeductedRef.current = true;
    dispatch(updateCoins(-stake));
    toast.info("Coins Deducted", `You paid ${stake} coins to join the game.`);
  }, [dispatch, getActiveStake, reduxStake]);

  useEffect(() => {
    const players = ChorPoliceEngine.state.players;
    if (!players.length) {
      return;
    }

    setPlayerNames((prev) =>
      prev.some(Boolean) ? prev : players.map((player) => player.name),
    );
    setPlayerScores((prev) =>
      prev.length > 0
        ? prev
        : players.map((player) => ({
            playerId: player.id,
            playerName: player.name,
            scores: [],
          })),
    );
    setScoreQuizPlayersSnapshot(
      players.map((player) => ({
        id: player.id,
        name: player.name,
        avatarId: player.avatarId,
        isBot: player.isBot,
      })),
    );
  }, [setScoreQuizPlayersSnapshot]);

  /* ═══════════════════════════════════════════════════════
     PACKET LISTENER — runs ONCE on mount. Never re-subscribes.
     RULE 6: All packets arrive via central handler (handleIncomingPacket →
     PacketRouter → ChorPoliceEngine), which dispatches to Redux.
     This listener is for SIDE EFFECTS ONLY: animations, audio, popups.
  ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    const CP = MODES.CHOR_POLICE;
    console.log(`${D} 📡 Subscribing to CP_* packets (ONE TIME — side effects only)`);

    const unsubscribe = subscribeToPackets((packet) => {
      if (!packet?.type) {
        return;
      }

      // FIX BUG-4,5: use refs, not closures, so stale values are never read
      const _isHost = isHostRef.current;
      const _localPlayerId = localPlayerIdRef.current;

      if (
        !_isHost &&
        (packet.type === NETWORK.PING || packet.type.startsWith("CP_"))
      ) {
        lastHostSignalAtRef.current = Date.now();
      }

      /* ── 1. ROLE ASSIGNMENT (side effect: log only — Redux dispatch handled by engine) ── */
      if (packet.type === CP.ROLE_ASSIGN && packet.playerId === _localPlayerId) {
        console.log(`${D} ═══════════════════════════════════`);
        console.log(
          `${D} 🎴 MY ROLE: ${packet.role} (idx: ${packet.playerIndex})`,
        );
        console.log(`${D} ═══════════════════════════════════`);
        // No setState — engine dispatches setMyRole to Redux
      }

      /* ── 2. PUBLIC REVEAL → ALL players see the SAME board animation ── */
      if (packet.type === CP.PUBLIC_REVEAL) {
        const names = packet.players.map((p: any) => p.name);
        const engineRoles = [...ChorPoliceEngine.state.roles];
        const publicRoles = packet.players.map((_: any, index: number) => {
          if (index === packet.kingIndex) return "King";
          if (index === packet.policeIndex) return "Police";
          return "Hidden";
        });
        const kIdx = packet.kingIndex as number;
        const pIdx = packet.policeIndex as number;

        console.log(`${D} ─────────────────────────────────`);
        console.log(`${D} 📢 PUBLIC REVEAL — Round ${packet.round}`);
        console.log(`${D}    Roles: [${engineRoles.join(", ")}]`);
        console.log(`${D}    Names: [${names.join(", ")}]`);
        console.log(`${D}    King idx: ${kIdx}, Police idx: ${pIdx}`);
        console.log(`${D} ─────────────────────────────────`);

        // UI-only: set player names for display
        roundStartPendingRef.current = false;
        setPlayerNames(names);
        setScoreQuizPlayersSnapshot(
          ChorPoliceEngine.state.players.map((player) => ({
            id: player.id,
            name: player.name,
            avatarId: player.avatarId,
            isBot: player.isBot,
          })),
        );

        // Dispatch names to Redux so OverlayPopUp can read them
        dispatch(
          setReduxPlayerNames(
            packet.players.map((player: any) => ({
              id: player.id,
              name: player.name,
              avatarId: player.avatarId,
            })),
          ),
        );

        // Redux: round state + game phase already dispatched by engine
        // Set roles for UI display (host sees real roles, client sees public)
        // Note: The engine dispatches setRoundState with full roles; the UI
        // component uses reduxRoles for game logic, but we store display roles
        // locally for the card rendering (host vs client view).

        if (packet.round === 1) {
          setPlayerScores(
            packet.players.map((player: any) => ({
              playerId: player.id,
              playerName: player.name,
              scores: [],
            })),
          );
        }

        setIsPlayButtonDisabled(true);

        const hostRole =
          packet.policeId === _localPlayerId
            ? "Police"
            : packet.kingId === _localPlayerId
              ? "King"
              : myRoleRef.current;
        console.log(
          `${D} 🎬 Host role: ${hostRole} — ALL see same board during dealing`,
        );

        // ── ALL PLAYERS see the SAME animation ──
        AudioEngine.play("level", "gameplay");

        // Step A: Flip King + Police (4000ms simultaneous) — use ref, not state
        const _flipAnims = flipAnimsRef.current;
        console.log(`${D} 🃏 Flipping King (${kIdx}) + Police (${pIdx}) — 4s`);
        flipCard(
          kIdx,
          1,
          4000,
          _flipAnims,
          setFlippedStates,
          [false, false, false, false],
          engineRoles,
          [false, false, false, false],
          () => {},
          () => {},
          dispatch,
        );
        flipCard(
          pIdx,
          1,
          4000,
          _flipAnims,
          setFlippedStates,
          [false, false, false, false],
          engineRoles,
          [false, false, false, false],
          () => {},
          () => {},
          dispatch,
        );

        // Step B: Police popup (4.5s)
        const t1 = setTimeout(() => {
          console.log(`${D} 🚔 Police popup`);
          setPopupIndex(2);
          AudioEngine.play("police", "gameplay");
        }, 4500);
        timerRefs.current.push(t1);

        // Step C: King popup (8.5s)
        const t2 = setTimeout(() => {
          console.log(`${D} 👑 King popup`);
          setPopupIndex(1);
          AudioEngine.play("king", "gameplay");
        }, 8500);
        timerRefs.current.push(t2);

        // Step D: ROLE SPLIT (11.5s) — NOW views diverge
        const t3 = setTimeout(() => {
          // re-read role from ref in case Redux updated after closure was created
          const resolvedRole = myRoleRef.current || hostRole;
          console.log(`${D} ═══════════════════════════════════`);
          console.log(`${D} 🔀 ROLE SPLIT — ${resolvedRole} view activating`);
          console.log(`${D} ═══════════════════════════════════`);

          setPopupIndex(null);
          dispatch(setReduxGamePhase("police_turn"));

          if (resolvedRole === "Police") {
            console.log(`${D} ✅ Police: Cards NOW CLICKABLE`);
            setAreCardsClickable(true);
            setShowTableButton(true);
          } else {
            console.log(
              `${D} 🔒 ${resolvedRole}: Switching to PRIVATE role card view`,
            );
          }
        }, 11500);
        timerRefs.current.push(t3);
      }

      /* ── 3. ROUND RESULT (side effects: animations, audio, popups) ── */
      if (packet.type === CP.ROUND_RESULT) {
        console.log(`${D} ═══════════════════════════════════`);
        console.log(`${D} 📊 ROUND RESULT — correct: ${packet.correct}`);
        console.log(`${D} ═══════════════════════════════════`);

        roundStartPendingRef.current = false;
        // gamePhase → "result" dispatched by engine
        setAreCardsClickable(false);

        // Update UI-only score display
        setPlayerScores((prev) => {
          const updated = prev.map((p) => ({ ...p, scores: [...p.scores] }));
          packet.allRoles?.forEach((info: any) => {
            const entry = updated.find((p) => p.playerId === info.playerId);
            if (entry) {
              const pts: Record<string, number> = packet.correct
                ? { King: 1000, Advisor: 800, Police: 500, Thief: 0 }
                : { King: 1000, Advisor: 800, Police: 0, Thief: 500 };
              entry.scores.push(pts[info.role] || 0);
            }
          });
          return updated;
        });

        // 🔥 STEP 1: Immediately trigger the dramatic 3D Spin Modal (Index 5)
        const pickedRole = packet.correct ? "Thief" : "Advisor";
        const targetIdx = packet.guessedIndex ?? (packet.correct ? reduxRoles.indexOf("Thief") : reduxRoles.indexOf("Advisor"));
        
        setPopupIndex(5);
        setRevealData({ role: pickedRole, isCorrect: packet.correct, index: targetIdx });
        AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");

        // 🔥 STEP 2: Delay the normal board flip by 4.5 seconds (duration of spin modal)
        const tReveal = setTimeout(() => {
          const currentFlipped = flippedStatesRef.current;
          const currentClicked = clickedCardsRef.current;
          const engineRoles = packet.allRoles?.map((info: any) => info.role) ?? [
            ...ChorPoliceEngine.state.roles,
          ];

          const revealTimer = revealAllCards(
            engineRoles,
            currentFlipped,
            flipAnimsRef.current,
            setFlippedStates,
            currentClicked,
            () => {},
            () => {},
            dispatch,
          );
          timerRefs.current.push(revealTimer);
        }, 4500);
        timerRefs.current.push(tReveal);

        // 🔥 STEP 3: Win/Lose Overlay (Classic)
        const t5 = setTimeout(() => {
          console.log(`${D} 🎬 Triggering Win/Lose Overlay`);
          const winIndex = packet.correct ? 4 : 3;
          setPopupIndex(winIndex);

          const curPI = policeIndexRef.current;
          const curPN = playerNamesRef.current;
          console.log(
            `${D} Winner is: ${curPI !== null ? curPN[curPI] : "Unknown"}`,
          );
        }, 8500);
        timerRefs.current.push(t5);

        // 🔥 STEP 4: Next Round / Quiz
        const t6 = setTimeout(() => {
          setIsDynamicPopUp(false);
          setShowTableButton(true);

          if (packet.isLastRound) {
            console.log(`${D} 🏁 LAST ROUND — transitioning to score quiz`);
            scoreQuizStartedRef.current = false;
            setQuizPlayerIndex(0);
            setQuizDone(false);
            setQuizOptionDisabled(false);
            quizOptionDisabledRef.current = false;
            resolveScoreQuizPlayers();
            playTransition("score_quiz");
          } else {
            console.log(`${D} ▶️ Ready for next round — playing round video`);
            setFlipAnims(
              Array(4)
                .fill(null)
                .map(() => new Animated.Value(0)),
            );
            setFlippedStates([false, false, false, false]);
            setClickedCards([false, false, false, false]);
            setAreCardsClickable(false);
            setFirstCardClicked(false);
            setPopupIndex(null);
            setMessage("");
            dispatch(setReduxMyRole(null));
            setShowTableButton(false);
            hasGuessedRef.current = false;
            dispatch(setReduxGamePhase("round_video"));
          }
        }, 12500);
        timerRefs.current.push(t6);
      }

      if (packet.type === CP.SCORE_QUIZ_TURN) {
        const players = resolveScoreQuizPlayers();
        let resolvedPlayerIndex =
          typeof packet.playerIndex === "number" ? packet.playerIndex : -1;
        let quizPlayer =
          resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;

        if ((!quizPlayer || quizPlayer.id !== packet.playerId) && packet.playerId) {
          resolvedPlayerIndex = players.findIndex(
            (player) => player.id === packet.playerId,
          );
          quizPlayer =
            resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;
        }

        if (!quizPlayer || resolvedPlayerIndex < 0) {
          console.warn(
            `${D} Ignoring malformed SCORE_QUIZ_TURN packet`,
            packet,
          );
          return;
        }

        scoreQuizStartedRef.current = true;
        currentQuizPlayerIdRef.current = packet.playerId;
        dispatch(setReduxGamePhase("score_quiz"));
        setQuizDone(false);
        setQuizPlayerIndex(resolvedPlayerIndex);
        setQuizOptions(Array.isArray(packet.options) ? packet.options : []);
        setQuizOptionDisabled(false);
        quizOptionDisabledRef.current = false;
        setIsDynamicPopUp(false);
        setMediaId(null);
        setMediaType(null);
        setPlayerData({
          image: null,
          message: null,
          imageType: null,
          name: null,
        });

        if (_isHost && quizPlayer.isBot) {
          const botDelay = 1500 + Math.floor(Math.random() * 2000);
          const expectedPlayerId = packet.playerId;
          const options = Array.isArray(packet.options) ? packet.options : [];
          const correctScore =
            ChorPoliceEngine.state.scores[expectedPlayerId]?.totalScore ?? 0;

          const botTimer = setTimeout(() => {
            if (currentQuizPlayerIdRef.current !== expectedPlayerId) {
              return;
            }

            const guessedScore =
              Math.random() < 0.4
                ? correctScore
                : (options.find((score: number) => score !== correctScore) ??
                  correctScore);

            handleIncomingPacket({
              type: CP.SCORE_GUESS,
              playerId: expectedPlayerId,
              guessedScore,
            });
          }, botDelay);
          timerRefs.current.push(botTimer);
        }
      }

      if (packet.type === CP.SCORE_GUESS && _isHost) {
        const expectedPlayerId = currentQuizPlayerIdRef.current;

        if (!expectedPlayerId || packet.playerId !== expectedPlayerId) {
          console.warn(`${D} Ignoring stale SCORE_GUESS packet`, packet);
          return;
        }

        const players = resolveScoreQuizPlayers();
        const playerIndex = players.findIndex((p) => p.id === packet.playerId);
        const player = players[playerIndex];
        const guessedScore = Number(packet.guessedScore);

        if (!player || !Number.isFinite(guessedScore)) {
          console.warn(`${D} Ignoring malformed SCORE_GUESS packet`, packet);
          return;
        }

        const correctScore =
          ChorPoliceEngine.state.scores[player.id]?.totalScore ?? 0;
        const isCorrect = guessedScore === correctScore;
        const bonus = isCorrect ? 2000 : -2000;

        ChorPoliceEngine.applyQuizBonus(player.id, bonus);

        broadcastPacket({
          type: CP.SCORE_GUESS_RESULT,
          playerId: player.id,
          playerIndex,
          guessedScore,
          correctScore,
          isCorrect,
          bonus,
          leaderboard: ChorPoliceEngine.getLeaderboard(),
        });

        const nextTurnTimer = setTimeout(() => {
          queueScoreQuizTurn(playerIndex + 1);
        }, 4000);
        timerRefs.current.push(nextTurnTimer);
      }

      if (packet.type === CP.SCORE_GUESS_RESULT) {
        if (currentQuizPlayerIdRef.current !== packet.playerId) {
          console.warn(
            `${D} Ignoring duplicate SCORE_GUESS_RESULT packet`,
            packet,
          );
          return;
        }

        currentQuizPlayerIdRef.current = null;
        quizOptionDisabledRef.current = true;
        setQuizOptionDisabled(true);
        const players = resolveScoreQuizPlayers();
        const resolvedPlayerIndex = players.findIndex(
          (player) => player.id === packet.playerId,
        );
        const safePlayerIndex =
          resolvedPlayerIndex >= 0 ? resolvedPlayerIndex : packet.playerIndex;
        setQuizPlayerIndex(safePlayerIndex);
        ChorPoliceEngine.syncScores(packet.leaderboard ?? []);

        setPlayerScores((prev) =>
          prev.map((entry) =>
            entry.playerId === packet.playerId
              ? {
                  ...entry,
                  scores: [...entry.scores, packet.bonus],
                }
              : entry,
          ),
        );

        const player =
          safePlayerIndex >= 0 ? players[safePlayerIndex] : undefined;
        const avatarId = player?.avatarId ?? 1;
        const playerImage = playerImagesRef.current[avatarId];

        AudioEngine.play(packet.isCorrect ? "win" : "lose", "gameplay");
        setMediaId(packet.isCorrect ? 2 : 1);
        setMediaType("gif");
        setPlayerData({
          image: playerImage?.src ?? null,
          message: packet.isCorrect
            ? "guessed correctly! +2000"
            : "guessed wrong! -2000",
          name: player?.name ?? "",
          imageType: playerImage?.type ?? null,
        });
        setIsDynamicPopUp(true);

        const popupTimer = setTimeout(() => {
          setIsDynamicPopUp(false);
        }, 3500);
        timerRefs.current.push(popupTimer);
      }

      /* ── 4. GAME END (completed) ── */
      if (packet.type === CP.GAME_END && packet.reason === "completed") {
        console.log(`${D} 🏁 GAME END — completed`);
        scoreQuizStartedRef.current = false;
        roundStartPendingRef.current = false;
        currentQuizPlayerIdRef.current = null;
        setQuizDone(true);
        dispatch(
          updateReduxScores(
            (packet.leaderboard ?? []).map((entry: any) => ({
              playerId: entry.id,
              playerName: entry.name,
              totalScore: entry.totalScore,
            })),
          ),
        );
        playTransition("final_result");

        // 🔥 WINNER REWARD LOGIC (Multi-winner support)
        const leaderboard = packet.leaderboard ?? [];
        if (leaderboard.length > 0) {
          const maxScore = leaderboard[0].totalScore;
          const winners = leaderboard.filter((p: any) => p.totalScore === maxScore);
          const isLocalWinner = winners.some((p: any) => p.id === _localPlayerId);
          
          if (isLocalWinner) {
            const totalPot = packet.totalPot ?? 0;
            const splitPot = Math.floor(totalPot / winners.length);
            
            if (splitPot > 0) {
              dispatch(updateCoins(splitPot));
              const winMsg = winners.length > 1 
                ? `You tied for 1st! Shared pot: ${splitPot} coins.`
                : `You won the full pot of ${splitPot} coins!`;
              toast.success("CHAMPION! 🏆", winMsg);
            }
          }
        }

        recordCPGame(dispatch, leaderboard[0]?.id === _localPlayerId, "completed");
      }

      /* ── 5. HOST QUIT ── */
      if (
        packet.type === CP.GAME_END &&
        packet.reason === "host_quit" &&
        !_isHost
      ) {
        const refund = packet.stake || 0;
        void (async () => {
          if (refund > 0) {
            dispatch(updateCoins(refund));
            toast.success("Refunded (Fairness)", `Host left. To ensure no injustice, your ${refund} coins were returned.`, 5000);
          } else {
            toast.error("Match Ended", "The host left the game.", 4000);
          }
          await stopSession();
          dispatch(clearSession());
          dispatch(resetGameState());
          dispatch(resetDifficulty());
          router.dismissAll();
          router.replace("/mode-select" as any);
        })();
        return;
      }

      if (packet.type === CP.GAME_END && packet.reason === "player_left") {
        const refund = packet.stake || 0;
        const leaverId = packet.leaverId as string | undefined;

        if (localPlayerId !== leaverId && refund > 0) {
          dispatch(updateCoins(refund));
          const msg = packet.networkIssue 
            ? "A player disconnected (Network Issue). " 
            : "A player left the match. ";
          toast.success("Refunded (Fairness)", `${msg}To ensure no injustice, your ${refund} coins were returned.`, 5000);
        } else if (localPlayerId !== leaverId) {
          const msg = packet.networkIssue 
            ? "A player disconnected due to network issues." 
            : "A player left, so the match was closed for fairness.";
          toast.error("Match Ended", msg, 4000);
        }

        void (async () => {
          timerRefs.current.forEach(clearTimeout);
          timerRefs.current = [];
          ChorPoliceBotBehavior.reset();
          ChorPoliceEngine.reset();
          await stopSession();
          dispatch(clearSession());
          dispatch(resetGameState());
          dispatch(resetDifficulty());
          router.dismissAll();
          router.replace("/mode-select" as any);
        })();
        return;
      }

      if (
        packet.type === NETWORK.PLAYER_LEAVE &&
        packet.playerId !== _localPlayerId &&
        gamePhaseRef.current !== "final_result"
      ) {
        if (_isHost) {
          broadcastPacket({
            type: CP.GAME_END,
            reason: "player_left",
            leaverId: packet.playerId,
            stake: ChorPoliceEngine.state.stake,
            networkIssue: packet.reason === "heartbeat_timeout",
          });
        }
        return;
      }
    });

    return () => {
      console.log(
        `${D} 🧹 Unsubscribing + clearing ${timerRefs.current.length} timers`,
      );
      unsubscribe();
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
    };
    // ═══ EMPTY DEPS — runs ONCE on mount, never re-subscribes ═══
    // All mutable values accessed via refs to avoid stale closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router]);

  useEffect(() => {
    if (isHost) {
      return;
    }

    const interval = setInterval(() => {
      if (hostDisconnectHandledRef.current) {
        return;
      }

      if (Date.now() - lastHostSignalAtRef.current < HOST_TIMEOUT_MS) {
        return;
      }

      hostDisconnectHandledRef.current = true;
      const refund = getActiveStake();
      if (refund > 0) {
        dispatch(updateCoins(refund));
      }
      toast.error(
        "Host Disconnected",
        refund > 0
          ? `${refund} coins returned because the host disconnected.`
          : "The host connection was lost. Returning to the lobby.",
        4000,
      );
      void (async () => {
        await stopSession();
        dispatch(clearSession());
        dispatch(resetGameState());
        dispatch(resetDifficulty());
        requestAnimationFrame(() => {
          router.dismissAll();
          router.replace("/mode-select" as any);
        });
      })();
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch, getActiveStake, isHost, router]);

  /* ═══════════════════════════════════════════════════════
     handlePlay — User clicks "Press me to play!"
  ═══════════════════════════════════════════════════════ */
  const handlePlay = useCallback(() => {
    if (!isHost) return;
    if (gamePhaseRef.current !== "waiting") return;
    if (roundStartPendingRef.current || ChorPoliceEngine.state.isRoundActive) {
      return;
    }
    if (ChorPoliceEngine.state.players.length !== 4) {
      toast.warning(
        "Need 4 players",
        "Start the round only when all 4 seats are ready.",
      );
      return;
    }

    console.log(
      `${D} ▶️ PLAY CLICKED — sending CP_ROUND_START (round ${ChorPoliceEngine.state.currentRound})`,
    );
    roundStartPendingRef.current = true;
    setIsPlayButtonDisabled(true);
    setMessage("Shuffling cards...");

    const t = setTimeout(() => {
      handleIncomingPacket({
        type: MODES.CHOR_POLICE.ROUND_START,
        round: ChorPoliceEngine.state.currentRound,
      });
    }, 500);
    timerRefs.current.push(t);
  }, [isHost]);

  /* ═══════════════════════════════════════════════════════
     handleCardClick — ONLY Police during police_turn
  ═══════════════════════════════════════════════════════ */
  const handleCardClick = useCallback(
    (index: number) => {
      if (reduxMyRole !== "Police") {
        console.log(`${D} 🛡️ BLOCKED — role "${reduxMyRole}"`);
        return;
      }
      if (reduxGamePhase !== "police_turn") {
        console.log(`${D} 🛡️ BLOCKED — phase "${reduxGamePhase}"`);
        return;
      }
      if (!areCardsClickable) {
        console.log(`${D} 🛡️ BLOCKED — not clickable yet`);
        return;
      }
      if (flippedStates[index]) {
        console.log(`${D} 🛡️ BLOCKED — already flipped`);
        return;
      }
      if (firstCardClicked || hasGuessedRef.current) {
        console.log(`${D} 🛡️ BLOCKED — already guessed`);
        return;
      }

      console.log(`${D} ═══════════════════════════════════`);
      console.log(
        `${D} 🎯 POLICE GUESS: index ${index} (role: ${reduxRoles[index]})`,
      );
      console.log(`${D} ═══════════════════════════════════`);

      setFirstCardClicked(true);
      hasGuessedRef.current = true;
      setAreCardsClickable(false);

      AudioEngine.play("select", "ui");

      const guessPacket = {
        type: MODES.CHOR_POLICE.POLICE_GUESS,
        targetIndex: index,
        playerId: localPlayerId,
      };

      if (isHost) {
        // FIX BUG-7: use ref so flipAnims is not in deps (new array ref each round)
        flipCard(
          index,
          1,
          1500,
          flipAnimsRef.current,
          setFlippedStates,
          flippedStates,
          reduxRoles,
          clickedCards,
          () => {},
          () => {},
          dispatch,
          true, // 🔇 silent after first two cards
        );
        setClickedCards((prev) => {
          const n = [...prev];
          n[index] = true;
          return n;
        });
        handleIncomingPacket(guessPacket);
        return;
      }

      setMessage("Sending your guess...");
      sendPacketToHost(guessPacket);
    },
    [
      isHost,
      localPlayerId,
      reduxMyRole,
      reduxGamePhase,
      reduxRoles,
      areCardsClickable,
      flippedStates,
      firstCardClicked,
      // FIX BUG-7: flipAnims removed — accessed via stable flipAnimsRef instead
      clickedCards,
      dispatch,
    ],
  );

  const handleCardClickWithBounce = useCallback(
    (index: number) => {
      if (reduxMyRole !== "Police" || !areCardsClickable) return;
      const { bounceAnimation } = require("@/Animations/animation");
      bounceAnims[index] && bounceAnimation(bounceAnims[index]).start();
    },
    [bounceAnims, reduxMyRole, areCardsClickable],
  );

  const getCardStyle = useCallback(
    (index: number) => {
      const { flipAndBounceStyle } = require("@/Animations/animation");
      return flipAndBounceStyle(flipAnims[index], bounceAnims[index]);
    },
    [flipAnims, bounceAnims],
  );

  /* ─── VIDEO END (between rounds) ─── */
  const handleVideoEnd = useCallback(() => {
    console.log(`${D} 🎬 Round video ended — transitioning to waiting`);
    setIsPlayButtonDisabled(false);
    dispatch(setReduxGamePhase("waiting"));
  }, [dispatch]);

  /* ═══════════════════════════════════════════════════════
     SCORE QUIZ — After all rounds, each player guesses their total score
     Correct = +2000, Wrong = -2000
     Uses DynamicOverlayPopUp (user's existing popup) for win/lose feedback.
     Refs used to avoid stale-closure bugs with bot timeouts.
  ═══════════════════════════════════════════════════════ */

  // PROD-3: processQuizAnswer was dead code that directly mutated ChorPoliceEngine.state
  // bypassing Redux (Rule 7 violation). The SCORE_GUESS → SCORE_GUESS_RESULT packet flow
  // handles all scoring correctly for both humans and bots. Removed.

  // FIX BUG-2: Removed dead useEffect that had `return;` as its first line,
  // making the entire body (80+ lines) unreachable. The SCORE_QUIZ_TURN
  // packet path (handled above in the packet listener) is the correct flow.

  // Human player quiz handler
  const handleQuizOption = useCallback(
    (selectedScore: number) => {
      if (
        quizOptionDisabledRef.current ||
        gamePhaseRef.current !== "score_quiz"
      ) {
        return;
      }
      if (currentQuizPlayerIdRef.current !== localPlayerId) {
        return;
      }

      quizOptionDisabledRef.current = true;
      setQuizOptionDisabled(true);

      const guessPacket = {
        type: MODES.CHOR_POLICE.SCORE_GUESS,
        playerId: localPlayerId,
        guessedScore: selectedScore,
      };

      if (isHost) {
        handleIncomingPacket(guessPacket);
        return;
      }

      sendPacketToHost(guessPacket);
    },
    [isHost, localPlayerId],
  );

  /* ─── FINAL RESULT EXIT ─── */
  const handleFinalExit = useCallback(
    async (target?: string) => {
      if (isQuittingRef.current) return;
      isQuittingRef.current = true;

      currentQuizPlayerIdRef.current = null;
      scoreQuizStartedRef.current = false;
      roundStartPendingRef.current = false;

      // 🔥 RESET FIRST
      ChorPoliceEngine.reset();
      ChorPoliceBotBehavior.reset();

      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];

      await stopSession();
      dispatch(clearSession());
      dispatch(resetGameState());
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();

        switch (target) {
          case "stats":
            router.replace("/stats" as any);
            break;
          case "report-bug":
            router.replace("/report-bug" as any);
            break;
          case "earn":
            router.replace("/earn" as any);
            break;
          default:
            router.replace("/mode-select" as any);
        }

        setTimeout(() => {
          isQuittingRef.current = false;
        }, 500);
      });
    },
    [dispatch, router],
  );

  /* ─── EXIT ─── */
  const handleQuitInMiddle = useCallback(() => setIsExitModalVisible(true), []);
  const handleCancelExit = useCallback(() => setIsExitModalVisible(false), []);

  const handleConfirmExit = useCallback(async () => {
    if (isQuittingRef.current) return;
    isQuittingRef.current = true;
    try {
      setIsExitModalVisible(false);
      const currentPhase = gamePhaseRef.current;
      const isGameOver =
        currentPhase === "final_result" || currentPhase === "finished";
      let shouldFlushNetwork = false;

      if (isGameOver) {
        // Game is already finished — just clean up and navigate, NO penalty
        console.log(`${D} 🏁 Exit from finished game — no penalty`);
      } else if (isHost) {
        // Game is still in progress — host quit penalty applies
        const stake = getActiveStake();
        if (stake > 0)
          toast.error("Stake Lost!", `Your ${stake} coins are lost.`, 4000);
        broadcastPacket({
          type: MODES.CHOR_POLICE.GAME_END,
          reason: "host_quit",
          stake,
        });
        shouldFlushNetwork = true;
      } else {
        const stake = getActiveStake();
        if (stake > 0) {
          toast.warning("Stake Lost", `Your ${stake} coins are lost because you left the game.`, 4000);
        }
        sendPacketToHost({
          type: NETWORK.PLAYER_LEAVE,
          playerId: localPlayerId,
          reason: "user_exit",
        });
        shouldFlushNetwork = true;
      }

      if (shouldFlushNetwork) {
        await new Promise<void>((resolve) => {
          const flushTimer = setTimeout(() => resolve(), 150);
          timerRefs.current.push(flushTimer);
        });
      }

      currentQuizPlayerIdRef.current = null;
      scoreQuizStartedRef.current = false;
      roundStartPendingRef.current = false;
      ChorPoliceBotBehavior.reset();
      ChorPoliceEngine.reset();
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
      await stopSession();
      dispatch(clearSession());
      dispatch(resetDifficulty());
      // PROD-6 FIX: dispatch resetGameState AFTER navigation so UI never reads
      // from an empty Redux store during the transition frame.
      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace("/mode-select" as any);
        setTimeout(() => dispatch(resetGameState()), 100);
      });
    } catch (e) {
      console.error(`${D} ❌ Exit error:`, e);
    } finally {
      isQuittingRef.current = false;
    }
  }, [dispatch, getActiveStake, isHost, localPlayerId, router]);

  /**
   * Phase-aware back button handler.
   * - final_result / finished → clean exit (no penalty, same as quiz result screen)
   * - video_transition → block back press (video playing)
   * - everything else → show exit confirmation modal
   */
  const handleBackPress = useCallback(() => {
    const phase = gamePhaseRef.current;
    if (phase === "final_result" || phase === "finished") {
      // Game over — just go home cleanly (same as quiz result back behavior)
      handleFinalExit();
    } else if (phase === "video_transition") {
      // Block back during video transitions — don't do anything
      console.log(`${D} 🛡️ Back blocked during video transition`);
    } else {
      // Mid-game — show exit modal
      handleQuitInMiddle();
    }
  }, [handleFinalExit, handleQuitInMiddle]);

  return {
    flipAnims,
    flippedStates,
    clickedCards,
    // RULE 10: Expose Redux-sourced roles instead of local state
    roles: reduxRoles.length > 0 ? reduxRoles : ["King", "Advisor", "Thief", "Police"],
    playerNames,
    isPlayButtonDisabled,
    // RULE 10: All role indices from Redux (FIX BUG-1: were illegally called here before)
    policeIndex: reduxPoliceIndex,
    kingIndex: reduxKingIndex,
    advisorIndex: reduxAdvisorIndex,
    thiefIndex: reduxThiefIndex,
    playerScores,
    scoreQuizPlayers,
    // RULE 10: Round info from Redux
    round: reduxCurrentRound,
    totalRounds: reduxTotalRounds,
    message,
    showTableButton,
    popupIndex,
    isDynamicPopUp,
    mediaId,
    mediaType,
    playerData,
    areCardsClickable,
    revealData,
    // RULE 10: Game phase from Redux
    gamePhase: reduxGamePhase,
    // RULE 10: My role from Redux
    myRole: reduxMyRole as Role | null,
    popupTable,
    canSeeBoard,
    canInteract,
    handlePlay,
    handleCardClick,
    handleCardClickWithBounce,
    getCardStyle,
    toggleModal,
    setPopupTable,
    isExitModalVisible,
    handleQuitInMiddle,
    handleCancelExit,
    handleConfirmExit,
    handleVideoEnd,
    quizPlayerIndex,
    quizOptions,
    quizOptionDisabled,
    quizDone,
    handleQuizOption,
    handleFinalExit,
    handleBackPress,
    isHost,
    localPlayerId,
    nextPhase,
    playTransition,
    // RULE 7: setGamePhase now dispatches to Redux
    setGamePhase: (phase: GamePhase) => dispatch(setReduxGamePhase(phase)),
  };
};
