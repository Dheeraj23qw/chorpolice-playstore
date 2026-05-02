import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MODES, NETWORK } from "@/constants/Networking";
import { NUM_QUESTIONS } from "@/constants/quizConstants";
import { DifficultyOption } from "@/constants/difficultyConfig";
import { toast } from "@/components/feedback/toast";
import {
  setPlayerNames as setReduxPlayerNames,
  setSelectedImages,
} from "@/redux/reducers/playerReducer";
import { generateTable, setDifficulty } from "@/redux/reducers/quiz";
import {
  setConnectionStatus,
  setLobbyStage,
  setLocalSessionIdentity,
  setSessionError,
  setSessionNetworkInfo,
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
import { GameSessionTransport } from "@/service/network/GameSessionTransport";
import {
  hostLanLobby,
  leaveLanLobby,
  syncLocalLobbyProfile,
} from "@/service/lanLobbyCoordinator";
import { saveUsername } from "@/storage/userStorage";
import { getLocalIpAddress } from "@/utils/NetworkUtils";
import { encodeRoomCode } from "@/utils/roomCode";

const ROOM_MAX_PLAYERS = 4;
const DEFAULT_GAME_TYPE = "CHOR_POLICE";

interface Player extends SessionPlayer {}

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
  const currentTable = useSelector(
    (state: RootState) => state.difficulty.table,
  );
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [difficulty, setDifficultyState] = useState<DifficultyOption>("easy");
  const [isBettingModalVisible, setIsBettingModalVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showApIsolation, setShowApIsolation] = useState(false);
  const [allowLocalOnlyLobby, setAllowLocalOnlyLobby] = useState(false);
  const [isBootstrappingHost, setIsBootstrappingHost] = useState(false);
  const hostBootstrappedRef = useRef(false);
  const startNavigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
  const lobbyStage = session.lobbyStage;
  const isLocalOnlyLobby =
    isHost && connectionStatus === "HOSTING" && !hostIp && !roomCode;

  const minPlayerCoins = useMemo(() => {
    // Only count human players for the bet limit
    const humans = players.filter((p) => !p.isBot);
    const min =
      humans.length === 0 ? 0 : Math.min(...humans.map((p) => p.coins || 0));
    console.log(
      "[Lobby] Calculated min human coins:",
      min,
      "from humans:",
      humans.length,
    );
    return min;
  }, [players]);

  useEffect(() => {
    if (lanReady) {
      void (async () => {
        const ip = await getLocalIpAddress();
        dispatch(setLocalSessionIdentity({ localIp: ip || null }));
      })();
    }
  }, [dispatch, lanReady]);

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
    if (lanReady && allowLocalOnlyLobby) {
      setAllowLocalOnlyLobby(false);
      hostBootstrappedRef.current = false;
      // If we were forced into setup, go back to room to allow joining
      if (session.lobbyStage === "setup") {
        dispatch(setLobbyStage("room"));
      }
      toast.success(
        "Network Ready",
        "Multiplayer mode activated. You can now invite friends.",
      );
    }
  }, [lanReady, allowLocalOnlyLobby, dispatch, session.lobbyStage]);

  useEffect(() => {
    setApIsolationHandler(() => {
      setShowApIsolation(true);
    });

    return () => {
      setApIsolationHandler(null);
    };
  }, []);

  const queueGameStartNavigation = useCallback(
    (targetGameType: string, playerId?: string | null) => {
      if (startNavigationTimerRef.current) {
        clearTimeout(startNavigationTimerRef.current);
      }

      startNavigationTimerRef.current = setTimeout(() => {
        startNavigationTimerRef.current = null;
        setIsTransitioning(false);
        setIsStarting(false);

        if (targetGameType === "QUIZ") {
          router.push("/think-count-quiz" as any);
          return;
        }

        if (!playerId) {
          return;
        }

        router.push({
          pathname: "/chor-police-mp",
          params: {
            playerId,
            isHost: String(isHost),
          },
        } as any);
      }, 600);
    },
    [isHost, router],
  );

  useEffect(() => {
    return () => {
      if (startNavigationTimerRef.current) {
        clearTimeout(startNavigationTimerRef.current);
        startNavigationTimerRef.current = null;
      }
    };
  }, []);

  const bootstrapHostLobby = useCallback(
    async (forceRetry = false) => {
      if (
        !isHost ||
        (!lanReady && !allowLocalOnlyLobby) ||
        !localPlayerId ||
        (hostBootstrappedRef.current && !forceRetry)
      ) {
        return;
      }

      hostBootstrappedRef.current = true;
      setIsBootstrappingHost(true);
      dispatch(setSessionError(null));

      if (forceRetry) {
        dispatch(setConnectionStatus("IDLE"));
      }

      try {
        await hostLanLobby({
          localPlayerId,
          name: userName.trim() || "PLAYER_1",
          avatarId: currentAvatarId,
          coins: userCoins,
          gameType,
        });
      } catch (error) {
        hostBootstrappedRef.current = false;
        console.error("[Lobby] Failed to bootstrap host lobby:", error);
        // The coordinator already dispatches ERROR + errorMessage to Redux,
        // which surfaces the HostStartErrorCard. Show a toast too so the
        // user gets immediate feedback.
        toast.error(
          "Room failed to start",
          "Tap Try Hosting Again to retry, or play locally with Ready Seats.",
        );
      } finally {
        setIsBootstrappingHost(false);
      }
    },
    [
      allowLocalOnlyLobby,
      currentAvatarId,
      dispatch,
      gameType,
      isHost,
      lanReady,
      localPlayerId,
      userName,
      userCoins,
    ],
  );

  useEffect(() => {
    void bootstrapHostLobby();
  }, [bootstrapHostLobby]);

  // 🚀 BACKGROUND IP MONITOR: If we are hosting but hostIp is missing (due to slow hotspot startup),
  // keep checking for it every few seconds.
  useEffect(() => {
    if (!isHost || connectionStatus !== "HOSTING" || (hostIp && roomCode)) {
      if (isHost && connectionStatus === "HOSTING" && hostIp && roomCode) {
        console.log(
          `[Lobby] 📡 Host ready: IP=${hostIp}, roomCode=${roomCode}, ` +
          `port=${GameSessionTransport.getListeningPort()}, players=${players.length}`,
        );
      }
      return;
    }

    console.log(
      `[Lobby] ⏳ Starting background IP monitor (hostIp=${hostIp || "null"}, ` +
      `roomCode=${roomCode || "null"}, status=${connectionStatus})`,
    );
    let pollCount = 0;

    const interval = setInterval(async () => {
      pollCount++;
      console.log(`[Lobby] 🔄 Background IP poll #${pollCount}...`);
      const ip = await getLocalIpAddress();
      if (ip) {
        const port = GameSessionTransport.getListeningPort();
        const code = encodeRoomCode(ip, port);
        console.log(
          `[Lobby] ✅ IP resolved after ${pollCount} polls: IP=${ip}, ` +
          `port=${port}, roomCode=${code}`,
        );
        
        dispatch(setSessionNetworkInfo({
          hostIp: ip,
          roomCode: code,
        }));
        
        // Also sync local profile with the new IP
        dispatch(setLocalSessionIdentity({ localIp: ip }));
        
        clearInterval(interval);
      } else {
        console.log(`[Lobby] ⏳ Poll #${pollCount}: no IP yet, retrying in 2.5s...`);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isHost, connectionStatus, hostIp, roomCode, dispatch]);

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

        // PROD-6: Sync table if provided in start packet
        if (!isHost && packet.table) {
          dispatch(
            setDifficulty({ level: packet.difficulty, table: packet.table }),
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

        queueGameStartNavigation("QUIZ");
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

        queueGameStartNavigation("CHOR_POLICE", localPlayerId);
      }
    });

    return unsubscribe;
  }, [dispatch, isHost, localPlayerId, queueGameStartNavigation]);

  const broadcastLobbyStage = useCallback(
    (nextStage: "room" | "setup") => {
      if (!isHost) {
        return;
      }

      broadcastPacket(
        {
          type: NETWORK.PLAYER_LIST_UPDATE,
          players: players.slice(0, ROOM_MAX_PLAYERS),
          lobbyStage: nextStage,
        },
        { processLocally: false },
      );
    },
    [isHost, players],
  );

  const routeToLobbyStage = useCallback(
    (nextStage: "room" | "setup") => {
      router.replace({
        pathname: nextStage === "setup" ? "/lobby-setup" : "/lobby",
        params: {
          gameType,
          isHost: String(isHost),
        },
      } as any);
    },
    [gameType, isHost, router],
  );

  const handleOpenSetup = useCallback(() => {
    if (!isHost) {
      return;
    }

    if (connectionStatus !== "HOSTING") {
      toast.error(
        "Room not ready",
        "Wait until the room is ready, then tap Let's Go.",
      );
      return;
    }

    dispatch(setLobbyStage("setup"));
    broadcastLobbyStage("setup");
    routeToLobbyStage("setup");
  }, [
    broadcastLobbyStage,
    connectionStatus,
    dispatch,
    isHost,
    routeToLobbyStage,
  ]);

  const handleBackToRoom = useCallback(() => {
    if (isHost) {
      dispatch(setLobbyStage("room"));
      broadcastLobbyStage("room");
    }

    routeToLobbyStage("room");
  }, [broadcastLobbyStage, dispatch, isHost, routeToLobbyStage]);

  const handleContinueWithReadySeats = useCallback(() => {
    if (!isHost) {
      return;
    }

    setAllowLocalOnlyLobby(true);
    hostBootstrappedRef.current = false;
    dispatch(setLobbyStage("setup"));
    toast.info(
      "Local Mode Active",
      "To play with your friends, allow Chor Police network permissions.",
      4500,
    );
  }, [dispatch, isHost]);

  const handleRetryHosting = useCallback(() => {
    if (!isHost) {
      return;
    }

    setAllowLocalOnlyLobby(false);
    hostBootstrappedRef.current = false;
    void bootstrapHostLobby(true);
  }, [bootstrapHostLobby, isHost]);

  const handleConfirmStake = useCallback(
    (stake: number) => {
      console.log("[Lobby] Confirming stake:", stake, "isHost:", isHost);
      if (isStarting || !isHost) {
        return;
      }

      if (connectionStatus !== "HOSTING") {
        toast.error(
          "Lobby not ready",
          "Wait for the local lobby server to start, then try again.",
        );
        return;
      }

      setIsStarting(true);
      setIsBettingModalVisible(false);

      const finalPlayers = players.slice(0, ROOM_MAX_PLAYERS);
      const botPlayers = finalPlayers.filter((player) => player.isBot);

      dispatch(
        setSelectedImages(finalPlayers.map((player) => player.avatarId)),
      );
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
        // PROD-6: Ensure table is generated if host didn't change difficulty manually
        let finalTable = currentTable;
        if (!finalTable || finalTable.length <= 1) {
          finalTable = generateTable(difficulty);
          dispatch(setDifficulty({ level: difficulty, table: finalTable }));
        }

        // BOT-4 FIX: BotEngine.start() was never called — bots never answered quiz questions
        BotEngine.activeBots = botPlayers;
        BotEngine.start(); // registers QUESTION_SYNC listener so bots auto-answer
        // Quiz always uses NUM_QUESTIONS as round count (not selectedRounds,
        // which is for ChorPolice). selectedRounds defaults to 1 in Redux
        // which would limit the quiz to a single question.
        QuizEngine.init(finalPlayers, difficulty, stake, NUM_QUESTIONS);
        broadcastPacket(
          {
            type: MODES.THINK_AND_COUNT.GAME_START,
            hostName: userName.trim() || "PLAYER_1",
            timestamp: Date.now(),
            difficulty,
            betAmount: stake,
            playerCount: finalPlayers.length,
            players: finalPlayers,
            totalRounds: QuizEngine.state.totalRounds,
            table: finalTable,
          },
          { processLocally: false },
        );
      } else {
        ChorPoliceEngine.init(finalPlayers, stake, selectedRounds || 3);
        ChorPoliceBotBehavior.init(botPlayers);
        broadcastPacket(
          {
            type: MODES.CHOR_POLICE.GAME_START,
            hostName: userName.trim() || "PLAYER_1",
            timestamp: Date.now(),
            betAmount: stake,
            playerCount: finalPlayers.length,
            totalRounds: selectedRounds || 3,
            players: finalPlayers,
          },
          { processLocally: false },
        );
      }

      setIsTransitioning(true);
      queueGameStartNavigation(gameType, localPlayerId);
    },
    [
      difficulty,
      dispatch,
      gameType,
      isHost,
      isStarting,
      connectionStatus,
      localPlayerId,
      players,
      queueGameStartNavigation,
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
    lobbyStage,
    userName,
    players,
    roomCode,
    hostIp,
    connectionStatus,
    errorMessage,
    localIp,
    isLocalOnlyLobby,
    selectedHostIp: isHost ? null : hostIp,
    localAvatarId: currentAvatarId,
    qrPayload: hostIp
      ? JSON.stringify({
          ip: hostIp,
          port: GameSessionTransport.getListeningPort(),
        })
      : "",
    showAvatarGrid,
    setShowAvatarGrid,
    difficulty,
    selectedRounds,
    isBettingModalVisible,
    setIsBettingModalVisible,
    selectedImages: [currentAvatarId],
    maxPlayers: ROOM_MAX_PLAYERS,
    handleDifficultyChange,
    handleConfirmStake,
    handleAvatarSelect,
    handleNameChange,
    handleBack,
    handleOpenSetup,
    handleBackToRoom,
    handleContinueWithReadySeats,
    handleRetryHosting,
    isBootstrappingHost,
    isTransitioning,
    showApIsolation,
    setShowApIsolation,
    minPlayerCoins,
  };
};
