import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MODES, NETWORK } from "@/constants/Networking";
import { DifficultyOption } from "@/constants/difficultyConfig";
import {
  setPlayerNames as setReduxPlayerNames,
  setSelectedImages,
} from "@/redux/reducers/playerReducer";
import { generateTable, setDifficulty } from "@/redux/reducers/quiz";
import {
  setLocalSessionIdentity,
  type SessionPlayer,
} from "@/redux/reducers/sessionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { BotEngine } from "@/service/QuizBotEngine";
import { QuizEngine } from "@/service/QuizEngine";
import {
  broadcastPacket,
  setApIsolationHandler,
  subscribeToPackets,
} from "@/service/lanGameService";
import {
  hostLanLobby,
  leaveLanLobby,
  syncLocalLobbyProfile,
} from "@/service/lanLobbyCoordinator";
import { saveUsername } from "@/storage/userStorage";
import { getLocalIpAddress } from "@/utils/NetworkUtils";

const ROOM_MAX_PLAYERS = 4;
const DEFAULT_GAME_TYPE = "CHOR_POLICE";

export interface Player extends SessionPlayer {}

export const useLobbyLogic = (
  router: any,
  gameParams: Record<string, any>,
  forcedMode?: "host" | "client",
  lanReady = true,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session);
  const preselectedAvatarId = useSelector(
    (state: RootState) => state.player.selectedImages[0] || null,
  );
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound,
  );

  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [difficulty, setDifficultyState] = useState<DifficultyOption>("easy");
  const [isBettingModalVisible, setIsBettingModalVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showApIsolation, setShowApIsolation] = useState(false);
  const hostBootstrappedRef = useRef(false);

  const localPlayerId = session.localPlayerId;
  const gameType =
    String(gameParams.gameType || session.gameType || DEFAULT_GAME_TYPE) ||
    DEFAULT_GAME_TYPE;
  const isHost = forcedMode
    ? forcedMode === "host"
    : gameParams.isHost === "true" || session.isHost;

  const localPlayer = useMemo(
    () =>
      localPlayerId
        ? session.players.find((player) => player.id === localPlayerId) || null
        : null,
    [localPlayerId, session.players],
  );

  const currentAvatarId =
    session.localAvatarId || preselectedAvatarId || localPlayer?.avatarId || 1;
  const userName = session.localPlayerName;
  const players = session.players;
  const roomCode = session.roomCode;
  const hostIp = session.hostIp;
  const connectionStatus = session.connectionStatus;
  const errorMessage = session.errorMessage;
  const localIp = session.localIp || "unknown";

  useEffect(() => {
    void (async () => {
      const ip = await getLocalIpAddress();
      dispatch(setLocalSessionIdentity({ localIp: ip || null }));
    })();
  }, [dispatch]);

  useEffect(() => {
    if (
      preselectedAvatarId &&
      session.connectionStatus === "IDLE" &&
      preselectedAvatarId !== session.localAvatarId
    ) {
      dispatch(setLocalSessionIdentity({ avatarId: preselectedAvatarId }));
    }
  }, [
    dispatch,
    preselectedAvatarId,
    session.connectionStatus,
    session.localAvatarId,
  ]);

  useEffect(() => {
    BotEngine.reset();
    QuizEngine.reset();
    ChorPoliceEngine.reset();
    ChorPoliceBotBehavior.reset();
  }, []);

  useEffect(() => {
    setApIsolationHandler(() => {
      setShowApIsolation(true);
    });

    return () => {
      setApIsolationHandler(null);
    };
  }, []);

  useEffect(() => {
    if (
      !isHost ||
      !lanReady ||
      hostBootstrappedRef.current ||
      !localPlayerId
    ) {
      return;
    }

    hostBootstrappedRef.current = true;

    void hostLanLobby({
      localPlayerId,
      name: userName.trim() || "You",
      avatarId: currentAvatarId,
      gameType,
    });
  }, [
    currentAvatarId,
    gameType,
    isHost,
    lanReady,
    localPlayerId,
    userName,
  ]);

  useEffect(() => {
    if (
      connectionStatus !== "HOSTING" &&
      connectionStatus !== "CONNECTED" &&
      connectionStatus !== "CONNECTING"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      syncLocalLobbyProfile({
        name: userName.trim() || "PLAYER",
        avatarId: currentAvatarId,
      });
    }, 160);

    return () => {
      clearTimeout(timer);
    };
  }, [connectionStatus, currentAvatarId, userName]);

  const handleDifficultyChange = useCallback(
    (newLevel: DifficultyOption) => {
      if (!isHost) return;

      setDifficultyState(newLevel);
      const table = generateTable(newLevel);
      dispatch(setDifficulty({ level: newLevel, table }));
      broadcastPacket(
        {
          type: MODES.THINK_AND_COUNT.DIFFICULTY_CHANGE,
          difficulty: newLevel,
          table,
        },
        { processLocally: false },
      );
    },
    [dispatch, isHost],
  );

  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet) => {
      if (packet.type === MODES.THINK_AND_COUNT.DIFFICULTY_CHANGE) {
        setDifficultyState(packet.difficulty);
        dispatch(
          setDifficulty({ level: packet.difficulty, table: packet.table }),
        );
        return;
      }

      if (packet.type === MODES.THINK_AND_COUNT.GAME_START) {
        // PROD-5: only clients init QuizEngine from broadcast — host already called init() directly
        if (!isHost && packet.players?.length) {
          QuizEngine.init(
            packet.players,
            packet.difficulty,
            packet.betAmount || 0,
            packet.totalRounds,
          );
        }
        // Always sync player names/images (even on host, to keep Redux in sync)
        if (packet.players?.length) {
          dispatch(
            setSelectedImages(
              packet.players.map((player: Player) => player.avatarId),
            ),
          );
          dispatch(
            setReduxPlayerNames(
              packet.players.map((player: Player) => ({
                id: player.id,
                name: player.name,
                avatarId: player.avatarId,
              })),
            ),
          );
        }

        // PROD-1 FIX: 600ms delay so TCP handshake completes before screen mounts
        setTimeout(() => {
          router.push("/think-count-quiz" as any);
        }, 600);
        return;
      }

      if (packet.type === MODES.CHOR_POLICE.GAME_START) {
        // PROD-5: only clients init ChorPoliceEngine from broadcast — host already called init()
        if (!isHost && packet.players?.length) {
          ChorPoliceEngine.init(
            packet.players,
            packet.betAmount || 0,
            packet.totalRounds || 5,
          );
        }
        if (packet.players?.length) {
          dispatch(
            setSelectedImages(
              packet.players.map((player: Player) => player.avatarId),
            ),
          );
          dispatch(
            setReduxPlayerNames(
              packet.players.map((player: Player) => ({
                id: player.id,
                name: player.name,
                avatarId: player.avatarId,
              })),
            ),
          );
        }

        // PROD-1 FIX: 600ms delay so TCP handshake completes before screen mounts
        if (localPlayerId) {
          setTimeout(() => {
            router.push({
              pathname: "/chor-police-mp",
              params: {
                playerId: localPlayerId,
                isHost: String(isHost),
              },
            } as any);
          }, 600);
        }
      }
    });

    return unsubscribe;
  }, [dispatch, isHost, localPlayerId, router]);

  const handleConfirmStake = useCallback(
    (stake: number) => {
      if (isStarting || !isHost) {
        return;
      }

      setIsStarting(true);
      setIsBettingModalVisible(false);

      const finalPlayers = players.slice(0, ROOM_MAX_PLAYERS);
      const botPlayers = finalPlayers.filter((player) => player.isBot);

      dispatch(setSelectedImages(finalPlayers.map((player) => player.avatarId)));
      dispatch(
        setReduxPlayerNames(
          finalPlayers.map((player) => ({
            id: player.id,
            name: player.name,
            avatarId: player.avatarId,
          })),
        ),
      );

      if (gameType === "QUIZ") {
        // BOT-4 FIX: BotEngine.start() was never called — bots never answered quiz questions
        BotEngine.activeBots = botPlayers;
        BotEngine.start(); // registers QUESTION_SYNC listener so bots auto-answer
        QuizEngine.init(finalPlayers, difficulty, stake, selectedRounds || 5);
        broadcastPacket(
          {
            type: MODES.THINK_AND_COUNT.GAME_START,
            hostName: userName.trim() || "PLAYER",
            timestamp: Date.now(),
            difficulty,
            betAmount: stake,
            playerCount: finalPlayers.length,
            players: finalPlayers,
            totalRounds: QuizEngine.state.totalRounds,
          },
          { processLocally: false },
        );
      } else {
        ChorPoliceEngine.init(finalPlayers, stake, selectedRounds || 5);
        ChorPoliceBotBehavior.init(botPlayers);
        broadcastPacket(
          {
            type: MODES.CHOR_POLICE.GAME_START,
            hostName: userName.trim() || "PLAYER",
            timestamp: Date.now(),
            betAmount: stake,
            playerCount: finalPlayers.length,
            totalRounds: selectedRounds || 5,
            players: finalPlayers,
          },
          { processLocally: false },
        );
      }

      setIsTransitioning(true);
    },
    [
      difficulty,
      dispatch,
      gameType,
      isHost,
      isStarting,
      players,
      selectedRounds,
      userName,
    ],
  );

  const handleAvatarSelect = useCallback(
    (avatarId: number) => {
      const isTaken = players.some(
        (player) => player.avatarId === avatarId && player.id !== localPlayerId,
      );

      if (isTaken) {
        return;
      }

      dispatch(setSelectedImages([avatarId]));
      dispatch(setLocalSessionIdentity({ avatarId }));
      setShowAvatarGrid(false);
    },
    [dispatch, localPlayerId, players],
  );

  const handleNameChange = useCallback(
    (name: string) => {
      const sanitized = name.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 12);
      dispatch(setLocalSessionIdentity({ name: sanitized }));

      if (sanitized.trim().length >= 3) {
        saveUsername(sanitized.trim());
      }
    },
    [dispatch],
  );

  const handleBack = useCallback(() => {
    void (async () => {
      await leaveLanLobby();
      router.dismissAll();
      router.replace("/mode-select" as any);
    })();
  }, [router]);

  return {
    isHost,
    localPlayerId,
    gameType,
    userName,
    players,
    roomCode,
    hostIp,
    connectionStatus,
    errorMessage,
    localIp,
    selectedHostIp: isHost ? null : hostIp,
    localAvatarId: currentAvatarId,
    qrPayload: hostIp
      ? JSON.stringify({
          ip: hostIp,
          port: NETWORK.TCP_SERVER_PORT,
        })
      : "",
    showAvatarGrid,
    setShowAvatarGrid,
    difficulty,
    isBettingModalVisible,
    setIsBettingModalVisible,
    selectedImages: [currentAvatarId],
    maxPlayers: ROOM_MAX_PLAYERS,
    handleDifficultyChange,
    handleConfirmStake,
    handleAvatarSelect,
    handleNameChange,
    handleBack,
    isTransitioning,
    showApIsolation,
    setShowApIsolation,
  };
};
