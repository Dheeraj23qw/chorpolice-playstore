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
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import useRandomMessage from "../useRandomMessage";

import {
  broadcastPacket,
  getSessionContext,
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
 * CRITICAL: The useEffect that listens to packets runs ONCE on mount.
 * All mutable values are accessed via REFS to prevent re-subscription
 * which would kill pending animation timers.
 */

type GamePhase =
  | "video_transition"
  | "waiting"
  | "dealing"
  | "police_turn"
  | "result"
  | "finished"
  | "round_video"
  | "score_quiz"
  | "final_result";
type Role = "King" | "Police" | "Thief" | "Advisor";

const D = "🎭 [CPHook]";

const HOST_TIMEOUT_MS = 10000;

export const useChorPoliceMultiplayer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams<{
    playerId?: string;
    isHost?: string;
  }>();
  const session = getSessionContext();

  const localPlayerId =
    typeof params.playerId === "string"
      ? params.playerId
      : session.localPlayerId || "host_id";
  const isHost =
    typeof params.isHost === "string"
      ? params.isHost === "true"
      : session.isHost;
  const [nextPhase, setNextPhase] = useState<GamePhase>("score_quiz");
  const playTransition = useCallback((afterPhase: GamePhase) => {
    setNextPhase(afterPhase);
    setGamePhase("video_transition");
  }, []);
  // ─── Card / Flip state ───
  const [flipAnims, setFlipAnims] = useState<Animated.Value[]>(() =>
    Array(4)
      .fill(null)
      .map(() => new Animated.Value(0)),
  );
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
  const [roles, setRoles] = useState<string[]>([
    "King",
    "Advisor",
    "Thief",
    "Police",
  ]);
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const players = ChorPoliceEngine.state.players;
    if (players.length === 4) {
      return players.map((player) => player.name);
    }
    return ["", "", "", ""];
  });
  const [isPlayButtonDisabled, setIsPlayButtonDisabled] = useState(false);

  // ─── Role indices ───
  const [policeIndex, setPoliceIndex] = useState<number | null>(null);
  const [kingIndex, setKingIndex] = useState<number | null>(null);
  const [advisorIndex, setAdvisorIndex] = useState<number | null>(null);
  const [thiefIndex, setThiefIndex] = useState<number | null>(null);

  // ─── Score / Round ───
  const [playerScores, setPlayerScores] = useState<
    Array<{ playerId: string; playerName: string; scores: (number | string)[] }>
  >(() =>
    ChorPoliceEngine.state.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      scores: [],
    })),
  );
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(
    ChorPoliceEngine.state.totalRounds || 5,
  );
  const [showTableButton, setShowTableButton] = useState(false);

  // ─── Popups ───
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
  const [areCardsClickable, setAreCardsClickable] = useState(false);
  const [firstCardClicked, setFirstCardClicked] = useState(false);

  // ─── Score Quiz state ───
  const [quizPlayerIndex, setQuizPlayerIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizOptionDisabled, setQuizOptionDisabled] = useState(false);
  const quizOptionDisabledRef = useRef(false); // ref to avoid stale closure in bot timeouts
  const [quizDone, setQuizDone] = useState(false);
  const [message, setMessage] = useState("");

  // ─── Phase + Role ───
  const [gamePhase, setGamePhase] = useState<GamePhase>("waiting");
  const gamePhaseRef = useRef<GamePhase>(gamePhase);
  // Keep gamePhaseRef always in sync
  gamePhaseRef.current = gamePhase;
  const [myRole, setMyRole] = useState<Role | null>(null);

  const canSeeBoard = myRole === "Police" || myRole === null;
  const canInteract = myRole === "Police";

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
  const myRoleRef = useRef<Role | null>(null);
  const roundStartPendingRef = useRef(false);
  const scoreQuizStartedRef = useRef(false);
  const currentQuizPlayerIdRef = useRef<string | null>(null);
  const stakeDeductedRef = useRef(false);
  const lastHostSignalAtRef = useRef(Date.now());
  const hostDisconnectHandledRef = useRef(false);
  myRoleRef.current = myRole;

  // ═══════════════════════════════════════════════════════
  // REFS for values accessed inside the packet listener.
  // This prevents useEffect from re-running when state changes.
  // ═══════════════════════════════════════════════════════
  const policeIndexRef = useRef(policeIndex);
  const playerNamesRef = useRef(playerNames);
  const playerImagesRef = useRef(playerImages);
  const selectedImagesRef = useRef(selectedImages);
  const flippedStatesRef = useRef(flippedStates);
  const clickedCardsRef = useRef(clickedCards);

  // Keep refs in sync with state
  policeIndexRef.current = policeIndex;
  playerNamesRef.current = playerNames;
  playerImagesRef.current = playerImages;
  selectedImagesRef.current = selectedImages;
  flippedStatesRef.current = flippedStates;
  clickedCardsRef.current = clickedCards;

  // Random messages
  const pName =
    policeIndex !== null && policeIndex >= 0
      ? playerNames[policeIndex] || ""
      : "";
  const randomMessageWin = useRandomMessage("win", pName);
  const randomMessageLose = useRandomMessage("lose", pName);
  const randomMessageWinRef = useRef(randomMessageWin);
  const randomMessageLoseRef = useRef(randomMessageLose);
  randomMessageWinRef.current = randomMessageWin;
  randomMessageLoseRef.current = randomMessageLose;

  // ─── Score table ───
  const [popupTable, setPopupTable] = useState(false);
  const toggleModal = useCallback(() => setPopupTable((p) => !p), []);

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

  useEffect(() => {
    if (gamePhase !== "score_quiz" || !isHost || scoreQuizStartedRef.current) {
      return;
    }

    scoreQuizStartedRef.current = true;

    const startTimer = setTimeout(() => {
      queueScoreQuizTurn(0);
    }, 300);
    timerRefs.current.push(startTimer);
  }, [gamePhase, isHost, queueScoreQuizTurn]);

  useEffect(() => {
    if (stakeDeductedRef.current) {
      return;
    }

    const stake = ChorPoliceEngine.state.stake;
    if (stake <= 0) {
      return;
    }

    stakeDeductedRef.current = true;
    dispatch(updateCoins(-stake));
  }, [dispatch]);

  useEffect(() => {
    const players = ChorPoliceEngine.state.players;
    if (!players.length) {
      return;
    }

    setRound(ChorPoliceEngine.state.currentRound || 1);
    setTotalRounds(ChorPoliceEngine.state.totalRounds || 5);
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
  }, []);

  function queueScoreQuizTurn(playerIndex: number) {
    if (!isHost) {
      return;
    }

    const CP = MODES.CHOR_POLICE;
    const players = ChorPoliceEngine.state.players;

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
  }

  /* ═══════════════════════════════════════════════════════
     PACKET LISTENER — runs ONCE on mount. Never re-subscribes.
     All mutable values accessed via refs.
  ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    const CP = MODES.CHOR_POLICE;
    console.log(`${D} 📡 Subscribing to CP_* packets (ONE TIME)`);

    const unsubscribe = subscribeToPackets((packet) => {
      if (!packet?.type) {
        return;
      }

      if (
        !isHost &&
        (packet.type === NETWORK.PING || packet.type.startsWith("CP_"))
      ) {
        lastHostSignalAtRef.current = Date.now();
      }

      /* ── 1. ROLE ASSIGNMENT ── */
      if (packet.type === CP.ROLE_ASSIGN && packet.playerId === localPlayerId) {
        console.log(`${D} ═══════════════════════════════════`);
        console.log(
          `${D} 🎴 MY ROLE: ${packet.role} (idx: ${packet.playerIndex})`,
        );
        console.log(`${D} ═══════════════════════════════════`);
        setMyRole(packet.role as Role);
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

        // Set state
        roundStartPendingRef.current = false;
        setPlayerNames(names);
        // ✅ FIX: Dispatch names to Redux so OverlayPopUp can read them
        dispatch(
          setReduxPlayerNames(
            packet.players.map((player: any) => ({
              id: player.id,
              name: player.name,
              avatarId: player.avatarId,
            })),
          ),
        );
        setRoles(isHost ? engineRoles : publicRoles);
        setPoliceIndex(pIdx);
        setKingIndex(kIdx);
        setAdvisorIndex(isHost ? ChorPoliceEngine.state.advisorIndex : null);
        setThiefIndex(isHost ? ChorPoliceEngine.state.thiefIndex : null);
        setTotalRounds(ChorPoliceEngine.state.totalRounds);
        setRound(packet.round);

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
        setGamePhase("dealing");

        const hostRole =
          packet.policeId === localPlayerId
            ? "Police"
            : packet.kingId === localPlayerId
              ? "King"
              : myRoleRef.current;
        console.log(
          `${D} 🎬 Host role: ${hostRole} — ALL see same board during dealing`,
        );

        // ── ALL PLAYERS see the SAME animation ──
        AudioEngine.play("level", "gameplay");

        // Step A: Flip King + Police (4000ms simultaneous)
        setFlipAnims((currentAnims) => {
          console.log(
            `${D} 🃏 Flipping King (${kIdx}) + Police (${pIdx}) — 4s`,
          );
          flipCard(
            kIdx,
            1,
            4000,
            currentAnims,
            setFlippedStates,
            [false, false, false, false],
            engineRoles,
            [false, false, false, false],
            setRound,
            () => {},
            dispatch,
          );
          flipCard(
            pIdx,
            1,
            4000,
            currentAnims,
            setFlippedStates,
            [false, false, false, false],
            engineRoles,
            [false, false, false, false],
            setRound,
            () => {},
            dispatch,
          );
          return currentAnims;
        });

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
          console.log(`${D} ═══════════════════════════════════`);
          console.log(`${D} 🔀 ROLE SPLIT — ${hostRole} view activating`);
          console.log(`${D} ═══════════════════════════════════`);

          setPopupIndex(null);
          setGamePhase("police_turn");

          if (hostRole === "Police") {
            console.log(`${D} ✅ Police: Cards NOW CLICKABLE`);
            setAreCardsClickable(true);
            setShowTableButton(true);
          } else {
            console.log(
              `${D} 🔒 ${hostRole}: Switching to PRIVATE role card view`,
            );
          }
        }, 11500);
        timerRefs.current.push(t3);
      }

      /* ── 3. ROUND RESULT ── */
      if (packet.type === CP.ROUND_RESULT) {
        console.log(`${D} ═══════════════════════════════════`);
        console.log(`${D} 📊 ROUND RESULT — correct: ${packet.correct}`);
        console.log(`${D} ═══════════════════════════════════`);

        roundStartPendingRef.current = false;
        setGamePhase("result");
        setAreCardsClickable(false);
        setRoles(packet.allRoles?.map((info: any) => info.role) ?? roles);
        setPoliceIndex(
          packet.allRoles?.findIndex((info: any) => info.role === "Police") ??
            null,
        );
        setKingIndex(
          packet.allRoles?.findIndex((info: any) => info.role === "King") ??
            null,
        );
        setAdvisorIndex(
          packet.allRoles?.findIndex((info: any) => info.role === "Advisor") ??
            null,
        );
        setThiefIndex(
          packet.allRoles?.findIndex((info: any) => info.role === "Thief") ??
            null,
        );

        // Update scores
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

        // Reveal all cards — use refs for current state
        const currentFlipped = flippedStatesRef.current;
        const currentClicked = clickedCardsRef.current;
        const engineRoles = packet.allRoles?.map((info: any) => info.role) ?? [
          ...ChorPoliceEngine.state.roles,
        ];

        setFlipAnims((currentAnims) => {
          revealAllCards(
            engineRoles,
            currentFlipped,
            currentAnims,
            setFlippedStates,
            currentClicked,
            setRound,
            () => {},
            dispatch,
          );
          return currentAnims;
        });

        // Win/Lose sound
        const t4 = setTimeout(() => {
          AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");
        }, 2000);
        timerRefs.current.push(t4);

        // Win/Lose Overlay Logic
        const t5 = setTimeout(() => {
          console.log(`${D} 🎬 Triggering Win/Lose Overlay`);

          const winIndex = packet.correct ? 4 : 3;

          setPopupIndex(winIndex);

          const curPI = policeIndexRef.current;
          const curPN = playerNamesRef.current;

          console.log(
            `${D} Winner is: ${curPI !== null ? curPN[curPI] : "Unknown"}`,
          );
        }, 4000);

        timerRefs.current.push(t5);

        const t6 = setTimeout(() => {
          setIsDynamicPopUp(false);
          setShowTableButton(true);

          if (packet.isLastRound) {
            console.log(`${D} 🏁 LAST ROUND — transitioning to score quiz`);
            // Prepare quiz state, then use ONLY playTransition (don't set gamePhase directly — that causes a flash)
            scoreQuizStartedRef.current = false;
            setQuizPlayerIndex(0);
            setQuizDone(false);
            setQuizOptionDisabled(false);
            quizOptionDisabledRef.current = false;
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
            setMyRole(null);
            setShowTableButton(false); // ✅ FIX: Reset so Play button shows after video
            hasGuessedRef.current = false;
            // ✅ FIX: Play intro video between rounds instead of going straight to waiting
            setGamePhase("round_video");
          }
        }, 8000);
        timerRefs.current.push(t6);
      }

      if (packet.type === CP.SCORE_QUIZ_TURN) {
        const players = ChorPoliceEngine.state.players;
        const quizPlayer = players[packet.playerIndex];

        if (!quizPlayer || quizPlayer.id !== packet.playerId) {
          console.warn(
            `${D} Ignoring malformed SCORE_QUIZ_TURN packet`,
            packet,
          );
          return;
        }

        scoreQuizStartedRef.current = true;
        currentQuizPlayerIdRef.current = packet.playerId;
        setGamePhase("score_quiz");
        setQuizDone(false);
        setQuizPlayerIndex(packet.playerIndex);
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

        if (isHost && quizPlayer.isBot) {
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

      if (packet.type === CP.SCORE_GUESS && isHost) {
        const expectedPlayerId = currentQuizPlayerIdRef.current;

        if (!expectedPlayerId || packet.playerId !== expectedPlayerId) {
          console.warn(`${D} Ignoring stale SCORE_GUESS packet`, packet);
          return;
        }

        const players = ChorPoliceEngine.state.players;
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
        setQuizPlayerIndex(packet.playerIndex);
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

        const player = ChorPoliceEngine.state.players[packet.playerIndex];
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
        // Use ONLY playTransition to avoid flash — playTransition sets phase to "video_transition"
        // and queues "final_result" as nextPhase, which is applied after video ends.
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

        const isWinner = packet.leaderboard?.[0]?.id === localPlayerId;
        const totalPot = packet.totalPot ?? 0;

        if (isWinner && totalPot > 0) {
          dispatch(updateCoins(totalPot));

          toast.success("CHAMPION! 🏆", `You won ${totalPot} coins!`);
        }

        recordCPGame(dispatch, isWinner, "completed");
      }

      /* ── 5. HOST QUIT ── */
      if (
        packet.type === CP.GAME_END &&
        packet.reason === "host_quit" &&
        !isHost
      ) {
        const refund = packet.stake || 0;
        if (refund > 0) {
          dispatch(updateCoins(refund));
          toast.success("Refunded!", `${refund} coins returned.`);
        }
        stopSession();
        router.dismissAll();
        router.replace("/mode-select" as any);
      }

      if (packet.type === CP.GAME_END && packet.reason === "player_left") {
        const refund = packet.stake || 0;
        const leaverId = packet.leaverId as string | undefined;

        if (localPlayerId !== leaverId && refund > 0) {
          dispatch(updateCoins(refund));
          toast.success("Refunded!", `${refund} coins returned.`, 3000);
        } else if (localPlayerId !== leaverId) {
          toast.error("Match Ended", "A player left, so the match was closed.", 3000);
        }

        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];
        ChorPoliceBotBehavior.reset();
        ChorPoliceEngine.reset();
        stopSession();
        dispatch(resetDifficulty());
        router.dismissAll();
        router.replace("/mode-select" as any);
        return;
      }

      if (
        packet.type === NETWORK.PLAYER_LEAVE &&
        packet.playerId !== localPlayerId &&
        gamePhaseRef.current !== "final_result"
      ) {
        if (isHost) {
          broadcastPacket({
            type: CP.GAME_END,
            reason: "player_left",
            leaverId: packet.playerId,
            stake: ChorPoliceEngine.state.stake,
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
      const refund = ChorPoliceEngine.state.stake || 0;
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
      stopSession();
      dispatch(resetDifficulty());
      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace("/mode-select" as any);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch, isHost, router]);

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
      if (myRole !== "Police") {
        console.log(`${D} 🛡️ BLOCKED — role "${myRole}"`);
        return;
      }
      if (gamePhase !== "police_turn") {
        console.log(`${D} 🛡️ BLOCKED — phase "${gamePhase}"`);
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
        `${D} 🎯 POLICE GUESS: index ${index} (role: ${roles[index]})`,
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
        flipCard(
          index,
          1,
          1500,
          flipAnims,
          setFlippedStates,
          flippedStates,
          roles,
          clickedCards,
          setRound,
          () => {},
          dispatch,
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
      myRole,
      gamePhase,
      areCardsClickable,
      flippedStates,
      firstCardClicked,
      flipAnims,
      roles,
      clickedCards,
      dispatch,
    ],
  );

  const handleCardClickWithBounce = useCallback(
    (index: number) => {
      if (myRole !== "Police" || !areCardsClickable) return;
      const { bounceAnimation } = require("@/Animations/animation");
      bounceAnims[index] && bounceAnimation(bounceAnims[index]).start();
    },
    [bounceAnims, myRole, areCardsClickable],
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
    setGamePhase("waiting");
  }, []);

  /* ═══════════════════════════════════════════════════════
     SCORE QUIZ — After all rounds, each player guesses their total score
     Correct = +2000, Wrong = -2000
     Uses DynamicOverlayPopUp (user's existing popup) for win/lose feedback.
     Refs used to avoid stale-closure bugs with bot timeouts.
  ═══════════════════════════════════════════════════════ */

  // Core quiz answer processor — called by both human tap and bot auto-answer
  const processQuizAnswer = useCallback(
    (selectedScore: number, playerIdx: number) => {
      const players = ChorPoliceEngine.state.players;
      const scores = ChorPoliceEngine.state.scores;
      const player = players[playerIdx];
      if (!player) return;

      const correctScore = scores[player.id]?.totalScore ?? 0;
      const isCorrect = selectedScore === correctScore;
      const bonus = isCorrect ? 2000 : -2000;

      // Apply bonus to engine scores
      if (scores[player.id]) {
        scores[player.id].totalScore += bonus;
      }

      // Update local playerScores
      setPlayerScores((prev) =>
        prev.map((p) =>
          p.playerName === player.name
            ? { ...p, scores: [...p.scores, bonus] }
            : p,
        ),
      );

      console.log(
        `${D} 🎯 ${player.name} guessed ${selectedScore} (correct: ${correctScore}) → ${isCorrect ? "+2000 ✅" : "-2000 ❌"}`,
      );

      // Show feedback using existing DynamicOverlayPopUp
      const pImg = playerImagesRef.current;
      const sImg = selectedImagesRef.current;
      AudioEngine.play(isCorrect ? "win" : "lose", "gameplay");
      setMediaId(isCorrect ? 2 : 1);
      setMediaType("gif");
      setPlayerData({
        image: pImg[sImg[playerIdx]]?.src ?? null,
        message: isCorrect
          ? `guessed correctly! +2000 🎉`
          : `guessed wrong! -2000 😢`,
        name: player.name,
        imageType: pImg[sImg[playerIdx]]?.type ?? null,
      });
      setIsDynamicPopUp(true);

      // Auto-dismiss popup → move to next player
      const t1 = setTimeout(() => {
        setIsDynamicPopUp(false);
      }, 3500);
      const t2 = setTimeout(() => {
        setQuizPlayerIndex((prev) => prev + 1);
      }, 4000);
      timerRefs.current.push(t1, t2);
    },
    [],
  );

  // Generate quiz options when quizPlayerIndex changes during score_quiz phase
  useEffect(() => {
    return;
    if (gamePhase !== "score_quiz") return;
    if (quizDone) return;

    const players = ChorPoliceEngine.state.players;
    const scores = ChorPoliceEngine.state.scores;

    if (quizPlayerIndex >= players.length) {
      console.log(`${D} 🎯 All players finished quiz — ending game`);
      setQuizDone(true);

      const finalScores = players.map((p) => ({
        playerName: p.name,
        totalScore: scores[p.id]?.totalScore ?? 0,
      }));
      dispatch(updateReduxScores(finalScores));

      const t = setTimeout(() => {
        handleIncomingPacket({
          type: MODES.CHOR_POLICE.GAME_END,
          reason: "completed",
        });
      }, 1500);
      timerRefs.current.push(t);
      return;
    }

    const player = players[quizPlayerIndex];
    const correctScore = scores[player.id]?.totalScore ?? 0;

    console.log(
      `${D} 🎯 Quiz for player ${player.name} (score: ${correctScore})`,
    );

    // --- YOUR CUSTOM LOGIC ---
    const generateRandomScore = (baseScore: number) => {
      const variations = [500, 800];
      const variation =
        variations[Math.floor(Math.random() * variations.length)];
      return Math.max(
        0,
        baseScore + (Math.random() < 0.5 ? -variation : variation),
      );
    };

    const randomOptions = new Set<number>();
    randomOptions.add(correctScore);

    while (randomOptions.size < 3) {
      const randomScore = generateRandomScore(correctScore);
      if (!randomOptions.has(randomScore)) {
        randomOptions.add(randomScore);
      }
    }

    const shuffled = Array.from(randomOptions).sort(() => Math.random() - 0.5);
    // -------------------------

    setQuizOptions(shuffled);
    setQuizOptionDisabled(false);
    quizOptionDisabledRef.current = false;
    setIsDynamicPopUp(false);

    // If this player is a bot, auto-answer after a delay
    if (player.isBot) {
      const currentIdx = quizPlayerIndex;
      const botDelay = 1500 + Math.floor(Math.random() * 2000);
      const t = setTimeout(() => {
        if (quizOptionDisabledRef.current) return;
        quizOptionDisabledRef.current = true;
        setQuizOptionDisabled(true);

        // Bots have 40% chance of guessing correctly
        const botGuess =
          Math.random() < 0.4
            ? correctScore
            : (shuffled.find((s) => s !== correctScore) ?? correctScore);
        processQuizAnswer(botGuess, currentIdx);
      }, botDelay);
      timerRefs.current.push(t);
    }
  }, [gamePhase, quizPlayerIndex, quizDone, processQuizAnswer]);

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
    (target?: string) => {
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

      stopSession();
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();

        switch (target) {
          case "stats":
            router.replace("/stats" as any);
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
        const stake = ChorPoliceEngine.state.stake;
        if (stake > 0)
          toast.error("Stake Lost!", `Your ${stake} coins are lost.`, 4000);
        broadcastPacket({
          type: MODES.CHOR_POLICE.GAME_END,
          reason: "host_quit",
          stake,
        });
        shouldFlushNetwork = true;
      } else {
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
      stopSession();
      dispatch(resetDifficulty());
      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace("/mode-select" as any);
      });
    } catch (e) {
      console.error(`${D} ❌ Exit error:`, e);
    } finally {
      isQuittingRef.current = false;
    }
  }, [dispatch, isHost, localPlayerId, router]);

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
    roles,
    playerNames,
    isPlayButtonDisabled,
    policeIndex,
    kingIndex,
    advisorIndex,
    thiefIndex,
    playerScores,
    round,
    totalRounds,
    message,
    showTableButton,
    popupIndex,
    isDynamicPopUp,
    mediaId,
    mediaType,
    playerData,
    areCardsClickable,
    gamePhase,
    myRole,
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
    setGamePhase,
  };
};
