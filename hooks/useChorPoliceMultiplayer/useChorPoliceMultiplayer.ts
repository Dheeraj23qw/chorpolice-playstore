import { useState, useEffect, useCallback, useRef } from "react";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppDispatch, RootState } from "@/redux/store";
import store from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";
import {
  setPlayerNames as setReduxPlayerNames,
  updatePlayerScores as updateReduxScores,
} from "@/redux/reducers/playerReducer";
import {
  setGamePhase as setReduxGamePhase,
  setMyRole as setReduxMyRole,
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
  selectEconomy,
  selectLocalPlayerName,
} from "@/redux/selectors/sessionSelectors";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";

import {
  handleIncomingPacket,
  sendPacketToHost,
  subscribeToPackets,
  broadcastPacket,
} from "@/service/lanGameService";
import { MODES, NETWORK } from "@/constants/Networking";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { flipCard } from "./helpers/flipCardUtil";

// Extracted Logic Hooks
import { useCPCleanup } from "../chorPoliceMultiplayer/useCPCleanup";
import { useCPEconomy } from "../chorPoliceMultiplayer/useCPEconomy";
import { useCPRevealSequence } from "../chorPoliceMultiplayer/useCPRevealSequence";
import { useCPScoreQuiz } from "../chorPoliceMultiplayer/useCPScoreQuiz";

// Extracted Packet Handlers
import { routePacket } from "../chorPoliceMultiplayer/handlers/packetRouter";
import { CPMultiplayerContext } from "../chorPoliceMultiplayer/handlers/types";

type Role = "King" | "Police" | "Thief" | "Advisor";
type ScoreQuizParticipant = {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
};

const D = "🎭 [CPHook]";

export const useChorPoliceMultiplayer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams<{ playerId?: string; isHost?: string }>();

  // ── Redux State ──
  const reduxGamePhase = useSelector(selectGamePhase);
  const reduxIsHost = useSelector(selectIsHost);
  const reduxLocalPlayerId = useSelector(selectLocalPlayerId);
  const localPlayerName = useSelector(selectLocalPlayerName);
  const reduxMyRole = useSelector(selectMyRole);
  const reduxPoliceIndex = useSelector(selectPoliceIndex);
  const reduxKingIndex = useSelector(selectKingIndex);
  const reduxAdvisorIndex = useSelector((state: RootState) => state.session.advisorIndex);
  const reduxThiefIndex = useSelector((state: RootState) => state.session.thiefIndex);
  const reduxRoles = useSelector(selectRoles);
  const reduxCurrentRound = useSelector(selectCurrentRound);
  const reduxTotalRounds = useSelector(selectTotalRounds);
  const reduxStake = useSelector(selectStake);
  const economy = useSelector(selectEconomy);

  const localPlayerId = typeof params.playerId === "string" ? params.playerId : reduxLocalPlayerId || "host_id";
  const isHost = typeof params.isHost === "string" ? params.isHost === "true" : reduxIsHost;

  // ── Local UI State ──
  const [nextPhase, setNextPhase] = useState<GamePhase>("score_quiz");
  const [flipAnims, setFlipAnims] = useState<Animated.Value[]>(() => Array(4).fill(null).map(() => new Animated.Value(0)));
  const [flippedStates, setFlippedStates] = useState<boolean[]>([false, false, false, false]);
  const [clickedCards, setClickedCards] = useState<boolean[]>([false, false, false, false]);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [scoreQuizPlayers, setScoreQuizPlayers] = useState<ScoreQuizParticipant[]>([]);
  const [isPlayButtonDisabled, setIsPlayButtonDisabled] = useState(false);
  const [playerScores, setPlayerScores] = useState<Array<{ playerId: string; playerName: string; scores: (number | string)[] }>>([]);
  const [showTableButton, setShowTableButton] = useState(false);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | null>(null);
  const [playerData, setPlayerData] = useState<any>({ image: null, message: null, imageType: null, name: null });
  const [revealData, setRevealData] = useState<{role: string; isCorrect: boolean; index: number} | null>(null);
  const [areCardsClickable, setAreCardsClickable] = useState(false);
  const [firstCardClicked, setFirstCardClicked] = useState(false);
  const [quizPlayerIndex, setQuizPlayerIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizOptionDisabled, setQuizOptionDisabled] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [message, setMessage] = useState("");
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const [invisibleIndices, setInvisibleIndices] = useState<number[]>([]);
  const [popupTable, setPopupTable] = useState(false);

  // ── Refs (Anti-Stale Closure) ──
  const flipAnimsRef = useRef(flipAnims);
  const quizOptionDisabledRef = useRef(false);
  const hasGuessedRef = useRef(false);
  const isQuittingRef = useRef(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundStartPendingRef = useRef(false);
  const scoreQuizStartedRef = useRef(false);
  const currentQuizPlayerIdRef = useRef<string | null>(null);
  const isHostRef = useRef(isHost);
  const localPlayerIdRef = useRef(localPlayerId);
  const gamePhaseRef = useRef<GamePhase>(reduxGamePhase);
  const myRoleRef = useRef<string | null>(reduxMyRole);
  const policeIndexRef = useRef(reduxPoliceIndex);
  const playerNamesRef = useRef(playerNames);
  const playerImagesRef = useRef<any>(null);
  const flippedStatesRef = useRef(flippedStates);
  const clickedCardsRef = useRef(clickedCards);
  const stakeRef = useRef(reduxStake);
  const scoreQuizPlayersRef = useRef(scoreQuizPlayers);
  const playerScoresRef = useRef(playerScores);
  const lastHostSignalAtRef = useRef(Date.now());

  const playerImages = useSelector((state: RootState) => state.playerImages.images);
  const selectedImages = useSelector((state: RootState) => state.player.selectedImages);
  const selectedImagesRef = useRef(selectedImages);

  // Sync Refs
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
  stakeRef.current = reduxStake;
  playerScoresRef.current = playerScores;
  scoreQuizPlayersRef.current = scoreQuizPlayers;

  // Helpers
  const playTransition = useCallback((afterPhase: GamePhase) => {
    setNextPhase(afterPhase);
    dispatch(setReduxGamePhase("video_transition"));
  }, [dispatch]);

  const toggleModal = useCallback(() => setPopupTable((p) => !p), []);
  const getActiveStake = useCallback(() => stakeRef.current > 0 ? stakeRef.current : ChorPoliceEngine.state.stake, []);

  const setScoreQuizPlayersSnapshot = useCallback((players: ScoreQuizParticipant[]) => {
    scoreQuizPlayersRef.current = players;
    setScoreQuizPlayers(players);
    return players;
  }, []);

  const resolveScoreQuizPlayers = useCallback((): ScoreQuizParticipant[] => {
    const enginePlayers = ChorPoliceEngine.state.players.map(p => ({ id: p.id, name: p.name, avatarId: p.avatarId, isBot: p.isBot }));
    if (enginePlayers.length > 0) return setScoreQuizPlayersSnapshot(enginePlayers);
    if (scoreQuizPlayersRef.current.length > 0) return scoreQuizPlayersRef.current;
    const fallbackPlayers = playerScoresRef.current.filter(p => typeof p.playerId === "string").map((p, idx) => ({ id: p.playerId, name: p.playerName, avatarId: selectedImagesRef.current[idx] || 1, isBot: false }));
    return setScoreQuizPlayersSnapshot(fallbackPlayers);
  }, [setScoreQuizPlayersSnapshot]);

  // ── Logic Hooks ──
  const cleanup = useCPCleanup({ timerRefs, isQuittingRef, currentQuizPlayerIdRef, scoreQuizStartedRef, roundStartPendingRef });
  const economyLogic = useCPEconomy({ localPlayerId, reduxStake });
  const revealSequence = useCPRevealSequence({ flipAnimsRef, setFlippedStates, setInvisibleIndices, setAreCardsClickable, setShowTableButton, setPopupIndex, timerRefs, myRoleRef, localPlayerId });
  const scoreQuiz = useCPScoreQuiz({ isHostRef, timerRefs, currentQuizPlayerIdRef, scoreQuizStartedRef, quizOptionDisabledRef, setQuizDone, setQuizOptionDisabled, setQuizPlayerIndex, setQuizOptions, resolveScoreQuizPlayers });

  // ── Packet Router Context ──
  const context: CPMultiplayerContext = {
    dispatch,
    router,
    setPlayerNames,
    setPlayerScores,
    setIsPlayButtonDisabled,
    setAreCardsClickable,
    setPopupIndex,
    setRevealData,
    setIsDynamicPopUp,
    setShowTableButton,
    setFlipAnims,
    setFlippedStates,
    setClickedCards,
    setFirstCardClicked,
    setMessage,
    setInvisibleIndices,
    setQuizPlayerIndex,
    setQuizDone,
    setQuizOptions,
    setQuizOptionDisabled,
    setMediaId,
    setMediaType,
    setPlayerData,
    refs: {
      isHostRef,
      localPlayerIdRef,
      gamePhaseRef,
      myRoleRef,
      policeIndexRef,
      playerNamesRef,
      playerImagesRef,
      flippedStatesRef,
      clickedCardsRef,
      flipAnimsRef,
      timerRefs,
      currentQuizPlayerIdRef,
      scoreQuizStartedRef,
      roundStartPendingRef,
      quizOptionDisabledRef,
      hasGuessedRef,
      lastHostSignalAtRef,
    },
    reduxRoles,
    logic: {
      cleanup,
      economy: economyLogic,
      revealSequence,
      scoreQuiz,
      playTransition,
      resolveScoreQuizPlayers,
      setScoreQuizPlayersSnapshot,
    },
  };

  // ── Side Effects ──
  useEffect(() => {
    if (reduxGamePhase === "score_quiz" && isHost && !scoreQuizStartedRef.current) {
      const startTimer = setTimeout(() => scoreQuiz.queueScoreQuizTurn(0), 300);
      timerRefs.current.push(startTimer);
    }
  }, [reduxGamePhase, isHost, scoreQuiz]);

  useEffect(() => {
    economyLogic.handleStakeDebit(economy);
  }, [economyLogic, economy]);

  useEffect(() => {
    const players = ChorPoliceEngine.state.players;
    if (players.length) {
      setPlayerNames(prev => prev.some(Boolean) ? prev : players.map(p => p.name));
      setPlayerScores(prev => prev.length > 0 ? prev : players.map(p => ({ playerId: p.id, playerName: p.name, scores: [] })));
      setScoreQuizPlayersSnapshot(players.map(p => ({ id: p.id, name: p.name, avatarId: p.avatarId, isBot: p.isBot })));
    }
  }, [setScoreQuizPlayersSnapshot]);

  // ── Packet Listener ──
  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet, sourceIp) => {
      routePacket(packet, sourceIp, context);
    });

    return () => {
      unsubscribe();
      cleanup.clearAllTimers();
    };
  }, [cleanup]); // Only depend on cleanup since everything else is stable or in refs

  const [bounceAnims] = useState(() => Array(4).fill(null).map(() => new Animated.Value(1)));
  const canSeeBoard = reduxMyRole === "Police" || reduxMyRole === null;
  const canInteract = reduxMyRole === "Police";

  // Handlers
  const handlePlay = useCallback(() => {
    if (!isHost || gamePhaseRef.current !== "waiting" || roundStartPendingRef.current || ChorPoliceEngine.state.isRoundActive) return;
    if (ChorPoliceEngine.state.players.length !== 4) { toast.warning("Need 4 players", "Start the round only when all 4 seats are ready."); return; }
    roundStartPendingRef.current = true;
    setIsPlayButtonDisabled(true);
    setMessage("Shuffling cards...");
    const t = setTimeout(() => handleIncomingPacket({ type: MODES.CHOR_POLICE.ROUND_START, round: ChorPoliceEngine.state.currentRound }), 500);
    timerRefs.current.push(t);
  }, [isHost]);

  const handleCardClick = useCallback((index: number) => {
    if (reduxMyRole !== "Police" || reduxGamePhase !== "police_turn" || !areCardsClickable || flippedStates[index] || firstCardClicked || hasGuessedRef.current) return;
    setFirstCardClicked(true);
    hasGuessedRef.current = true;
    setAreCardsClickable(false);
    AudioEngine.play("select", "ui");
    const guessPacket = { type: MODES.CHOR_POLICE.POLICE_GUESS, targetIndex: index, playerId: localPlayerId };
    if (isHost) {
      flipCard(index, 1, 1500, flipAnimsRef.current, setFlippedStates, flippedStates, reduxRoles, clickedCards, () => {}, () => {}, dispatch, true);
      setClickedCards(prev => { const n = [...prev]; n[index] = true; return n; });
      handleIncomingPacket(guessPacket);
      return;
    }
    setMessage("Sending your guess...");
    sendPacketToHost(guessPacket);
  }, [isHost, localPlayerId, reduxMyRole, reduxGamePhase, reduxRoles, areCardsClickable, flippedStates, firstCardClicked, clickedCards, dispatch]);

  const handleCardClickWithBounce = useCallback((index: number) => {
    if (reduxMyRole !== "Police" || !areCardsClickable) return;
    const { bounceAnimation } = require("@/Animations/animation");
    bounceAnims[index] && bounceAnimation(bounceAnims[index]).start();
  }, [reduxMyRole, areCardsClickable, bounceAnims]);

  const getCardStyle = useCallback((index: number) => {
    const { flipAndBounceStyle } = require("@/Animations/animation");
    return flipAndBounceStyle(flipAnims[index], bounceAnims[index]);
  }, [flipAnims, bounceAnims]);

  const handleVideoEnd = useCallback(() => {
    setIsPlayButtonDisabled(false);
    dispatch(setReduxGamePhase("waiting"));
  }, [dispatch]);

  const handleQuizOption = useCallback((selectedScore: number) => {
    if (quizOptionDisabledRef.current || gamePhaseRef.current !== "score_quiz" || currentQuizPlayerIdRef.current !== localPlayerId) return;
    quizOptionDisabledRef.current = true;
    setQuizOptionDisabled(true);
    const guessPacket = { type: MODES.CHOR_POLICE.SCORE_GUESS, playerId: localPlayerId, guessedScore: selectedScore };
    if (isHost) { handleIncomingPacket(guessPacket); return; }
    sendPacketToHost(guessPacket);
  }, [isHost, localPlayerId]);

  const handleQuitInMiddle = useCallback(() => setIsExitModalVisible(true), []);
  const handleCancelExit = useCallback(() => setIsExitModalVisible(false), []);

  const handleConfirmExit = useCallback(async () => {
    if (isQuittingRef.current) return;
    isQuittingRef.current = true;
    setIsExitModalVisible(false);
    const isGameOver = gamePhaseRef.current === "final_result" || gamePhaseRef.current === "finished";
    if (!isGameOver) {
      const stake = getActiveStake();
      if (stake > 0) toast.error("Stake Lost!", `Your ${stake} coins are lost.`, 4000);
      if (isHost) broadcastPacket({ type: MODES.CHOR_POLICE.GAME_END, reason: "host_quit", stake });
      else sendPacketToHost({ type: NETWORK.PLAYER_LEAVE, playerId: localPlayerId, reason: "user_exit" });
      await new Promise(r => setTimeout(r, 150));
    }
    await cleanup.performFullCleanup();
    cleanup.navigateToHome();
  }, [cleanup, getActiveStake, isHost, localPlayerId]);

  const handleBackPress = useCallback(() => {
    const phase = gamePhaseRef.current;
    if (phase === "final_result" || phase === "finished") cleanup.handleFinalExit();
    else if (phase !== "video_transition") handleQuitInMiddle();
  }, [cleanup, handleQuitInMiddle]);

  return {
    flipAnims, flippedStates, clickedCards,
    roles: reduxRoles.length > 0 ? reduxRoles : ["King", "Advisor", "Thief", "Police"],
    playerNames, isPlayButtonDisabled,
    policeIndex: reduxPoliceIndex, kingIndex: reduxKingIndex, advisorIndex: reduxAdvisorIndex, thiefIndex: reduxThiefIndex,
    playerScores, scoreQuizPlayers, round: reduxCurrentRound, totalRounds: reduxTotalRounds, message, showTableButton,
    popupIndex, isDynamicPopUp, mediaId, mediaType, playerData, areCardsClickable, revealData,
    gamePhase: reduxGamePhase, myRole: reduxMyRole as Role | null,
    popupTable, canSeeBoard, canInteract,
    handlePlay, handleCardClick, handleCardClickWithBounce, getCardStyle, toggleModal, setPopupTable,
    isExitModalVisible, handleQuitInMiddle, handleCancelExit, handleConfirmExit, handleVideoEnd,
    quizPlayerIndex, quizOptions, quizOptionDisabled, quizDone, handleQuizOption, handleFinalExit: cleanup.handleFinalExit, handleBackPress,
    isHost, localPlayerId, localPlayerName, nextPhase, playTransition, invisibleIndices,
    setGamePhase: (phase: GamePhase) => dispatch(setReduxGamePhase(phase)),
  };
};
