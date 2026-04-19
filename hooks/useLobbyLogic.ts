import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toast } from "@/components/feedback/toast";
import { useLanDiscovery } from "@/hooks/useLanDiscovery";
import {
  loadOrCreateClientPlayerId,
  loadUsername,
  saveUsername,
} from "@/storage/userStorage";
import {
  setPlayerNames as setReduxPlayerNames,
  setSelectedImages,
} from "@/redux/reducers/playerReducer";
import { setDifficulty, generateTable } from "@/redux/reducers/quiz";
import { MODES, NETWORK } from "@/constants/Networking";
import { DifficultyOption } from "@/constants/difficultyConfig";
import {
  broadcastPacket,
  startHeartbeat,
  clearAllListeners,
  configureSession,
  debugState,
  registerRemotePeer,
  sendPacketToHost,
  setSessionHostIp,
  subscribeToPackets,
  unregisterRemotePeer,
} from "@/service/lanGameService";
import { BotEngine } from "@/service/BotEngine";
import { QuizEngine } from "@/service/QuizEngine";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";
import { getBotName } from "@/utils/nameGenerator";

/** LAN matches should always run as 4-player rooms. */
const ROOM_MAX_PLAYERS = 4;

export interface Player {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
}

/**
 * --- LOBBY LOGIC HOOK ---
 * Adheres to DIP: Receives navigation context from the UI layer to prevent
 * navigation-context-missing errors during re-renders.
 */
export const useLobbyLogic = (router: any, gameParams: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const isHost = gameParams.isHost === "true";
  const gameType = gameParams.gameType;
  const [localPlayerId] = useState(() =>
    isHost ? "host_id" : loadOrCreateClientPlayerId(),
  );

  const [userName, setUserName] = useState<string>(() => loadUsername());
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [difficulty, setDifficultyState] = useState<DifficultyOption>("easy");
  const [isBettingModalVisible, setIsBettingModalVisible] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  // 🔥 HANDLERS (Defined early for use in effects)
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
    [isHost],
  );

  // 🔥 INIT — Fresh state every time the lobby mounts
  useEffect(() => {
    configureSession({ isHost, localPlayerId, hostIp: null });
    /**
     * 🧹 STEP 1: Nuke ALL previous game state.
     * WHY: If the user plays a game and comes back to lobby,
     * BotEngine.activeBots, QuizEngine.state.playerScores, etc.
     * still contain data from the last session.
     */
    BotEngine.reset();
    QuizEngine.reset();
    ChorPoliceEngine.reset();
    ChorPoliceBotBehavior.reset();
    clearAllListeners(); // Kill ghost listeners from crashed sessions

    // STEP 2: Start fresh — only the host player, zero bots
    const hostPlayer: Player = {
      id: localPlayerId,
      name: userName,
      avatarId: selectedImages[0] || 1,
    };
    setPlayers([hostPlayer]);

    // STEP 3: Initialize session
    if (isHost) {
      startHeartbeat(true);

      if (gameType === "QUIZ") {
        BotEngine.spawn(3);
        const t = setTimeout(() => handleDifficultyChange("easy"), 800);
        return () => clearTimeout(t);
      }

      if (gameType === "CHOR_POLICE") {
        // Chor Police needs exactly 4 players — spawn 3 bots by default.
        // If real players join, bots will be trimmed before game start.
        BotEngine.spawn(3);
      }
    }

    // STEP 4: Cleanup on unmount — kill everything
  }, [
    gameType,
    handleDifficultyChange,
    isHost,
    localPlayerId,
  ]);

  const { availableHosts } = useLanDiscovery(isHost, userName);
  const [virtualHosts, setVirtualHosts] = useState<any[]>([]);

  // 🔥 SYSTEM ROOM INJECTION
  useEffect(() => {
    if (isHost) return;

    let timer: any;
    if (availableHosts.length === 0) {
      timer = setTimeout(() => {
        setVirtualHosts([
          {
            type: "VIRTUAL",
            deviceName: "System Server (Bots) 🌐",
            ip: "127.0.0.1",
            version: NETWORK.PROTOCOL_VERSION,
            lastSeen: Date.now(),
          },
        ]);
      }, 3000);
    } else {
      setVirtualHosts([]);
    }
    return () => clearTimeout(timer);
  }, [availableHosts.length, isHost]);

  const allHosts = [...availableHosts, ...virtualHosts];

  // Sync Debug State
  useEffect(() => {
    debugState.connectionCount = isHost ? players.length - 1 : allHosts.length;
  }, [players, allHosts, isHost]);

  // Quiz and Chor Police both run as exact 4-player LAN rooms.
  const maxPlayers = ROOM_MAX_PLAYERS;

  // 🔥 SUBSCRIPTIONS
  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet, sourceIp) => {
      if (isHost) {
        // Host only cares about Joins
        if (packet.type === NETWORK.PLAYER_JOIN) {
          const joiningPlayer: Player = packet.player;
          const isHumanJoining = !joiningPlayer.isBot;
          let accepted = false;

          setPlayers((prev) => {
            const existingPlayer = prev.find((p) => p.id === joiningPlayer.id);
            if (existingPlayer) {
              accepted = true;
              return prev.map((player) =>
                player.id === joiningPlayer.id
                  ? { ...player, ...joiningPlayer }
                  : player,
              );
            }

            /**
             * LAN ROOM AUTO-TRIM:
             * When a human joins, remove one bot to keep the room at 4 players.
             * Humans ALWAYS have priority over bots.
             */
            if (isHumanJoining) {
              const humanCount = prev.filter((p) => !p.isBot).length;

              // Already at max humans (4) → reject with warning
              if (humanCount >= ROOM_MAX_PLAYERS) {
                console.log(
                  `🛡️ [Lobby] Rejecting human join — max humans reached (${humanCount})`,
                );
                toast.error(
                  "Room Full!",
                  "🚫 Maximum 4 players allowed. No more can join.",
                  3000,
                );
                return prev;
              }

              // If lobby is full (4), remove one bot to make room for the human
              if (prev.length >= ROOM_MAX_PLAYERS) {
                const botIndex = prev.findIndex((p) => p.isBot);
                if (botIndex === -1) {
                  // No bots to trim — lobby is full of humans, reject with warning
                  console.log(
                    `🛡️ [Lobby] Rejecting human join — no bots to replace`,
                  );
                  toast.error(
                    "Room Full!",
                    "🚫 Maximum 4 players allowed. No more can join.",
                    3000,
                  );
                  return prev;
                }
                const updated = [...prev];
                const trimmedBot = updated.splice(botIndex, 1)[0];
                console.log(
                  `🤖 [Lobby] Auto-trimmed bot "${trimmedBot.name}" to make room for human "${joiningPlayer.name}"`,
                );
                // Also remove from BotEngine's active list
                BotEngine.activeBots = BotEngine.activeBots.filter(
                  (b) => b.id !== trimmedBot.id,
                );
                accepted = true;
                return [...updated, joiningPlayer];
              }
            }

            // Default: append if under max
            if (prev.length >= maxPlayers) return prev;
            accepted = true;
            return [...prev, joiningPlayer];
          });

          if (accepted && sourceIp) {
            registerRemotePeer(joiningPlayer.id, sourceIp);
          }
        } else if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
          unregisterRemotePeer(packet.playerId);
          setPlayers((prev) => prev.filter((player) => player.id !== packet.playerId));
        }
      } else if (packet.type === MODES.THINK_AND_COUNT.DIFFICULTY_CHANGE) {
        setDifficultyState(packet.difficulty);
        dispatch(
          setDifficulty({ level: packet.difficulty, table: packet.table }),
        );
      } else if (packet.type === MODES.THINK_AND_COUNT.GAME_START) {
        if (packet.players?.length) {
          QuizEngine.init(
            packet.players,
            packet.difficulty,
            packet.betAmount || 0,
            packet.totalRounds,
          );
          dispatch(setSelectedImages(packet.players.map((player: Player) => player.avatarId)));
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

        setTimeout(() => {
          router.push("/think-count-quiz" as any);
        }, 300);
      } else if (packet.type === MODES.CHOR_POLICE.GAME_START) {
        if (packet.players?.length) {
          ChorPoliceEngine.init(
            packet.players,
            packet.betAmount || 0,
            packet.totalRounds || 5,
          );
          dispatch(
            setSelectedImages(packet.players.map((player: Player) => player.avatarId)),
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

        setTimeout(() => {
          router.push({
            pathname: "/chor-police-mp",
            params: {
              playerId: localPlayerId,
              isHost: "false",
            },
          } as any);
        }, 300);
      } else if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId === localPlayerId) {
        toast.error("Disconnected", "You were removed from the room.", 3000);
        router.dismissAll();
        router.replace("/mode-select" as any);
      }
    });

    return unsubscribe;
  }, [dispatch, gameType, isHost, localPlayerId, maxPlayers, router]);

  // 🔥 HANDLERS
  const handleJoinSystemServer = useCallback(() => {
    router.replace({
      pathname: "/(game)/lobby",
      params: {
        isHost: "true",
        gameType: gameType || "QUIZ",
        isSystem: "true",
      },
    } as any);
  }, [router, gameType]);

  /**
   * handleJoin — Called from PlayerListItem when a client taps "JOIN" on a discovered host.
   * For VIRTUAL hosts (system bots): re-mount as host with bots.
   * For REAL LAN hosts: send a PLAYER_JOIN packet so the host adds us.
   */
  const handleJoin = useCallback(
    (host: any) => {
      if (host.type === "VIRTUAL") {
        // System Server — become the host with bots
        handleJoinSystemServer();
        return;
      }

      // Real LAN host — notify them we're joining
      const joinPacket = {
        type: NETWORK.PLAYER_JOIN,
        player: {
          id: localPlayerId,
          name: userName,
          avatarId: selectedImages[0] || 1,
        },
      };
      setSessionHostIp(host.ip);
      sendPacketToHost(joinPacket);
      toast.success("Joining", `Connecting to ${host.deviceName}...`);
    },
    [handleJoinSystemServer, localPlayerId, selectedImages, userName],
  );

  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound,
  );

  const [isStarting, setIsStarting] = useState(false);
  const handleConfirmStake = useCallback(
    (stake: number) => {
      if (isStarting) return;
      setIsStarting(true);

      setIsBettingModalVisible(false);
      toast.success("Stake Added", `💰 ${stake} coins added to pot!`);

      if (gameType === "QUIZ") {
        const humans = players.filter((p) => !p.isBot).slice(0, ROOM_MAX_PLAYERS);
        const existingBots = players.filter((p) => p.isBot);
        const botsNeeded = ROOM_MAX_PLAYERS - humans.length;

        let selectedBots = existingBots.slice(0, botsNeeded);

        if (selectedBots.length < botsNeeded) {
          const extraNeeded = botsNeeded - selectedBots.length;
          const usedAvatars = new Set(
            [...humans, ...selectedBots].map((p) => p.avatarId),
          );

          for (let i = 0; i < extraNeeded; i++) {
            let avatarId: number;
            do {
              avatarId = Math.floor(Math.random() * 13) + 1;
            } while (usedAvatars.has(avatarId));
            usedAvatars.add(avatarId);

            const botName = getBotName(selectedBots.length + i);
            selectedBots.push({
              id: `bot_${botName.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`,
              name: botName,
              avatarId,
              isBot: true,
            });
          }
        }

        const finalPlayers = [...humans, ...selectedBots];
        BotEngine.activeBots = finalPlayers.filter((player) => player.isBot);

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

        QuizEngine.init(finalPlayers, difficulty, stake);
        broadcastPacket(
          {
            type: MODES.THINK_AND_COUNT.GAME_START,
            hostName: userName,
            timestamp: Date.now(),
            difficulty,
            betAmount: stake,
            playerCount: finalPlayers.length,
            players: finalPlayers,
            totalRounds: QuizEngine.state.totalRounds,
          },
          { processLocally: false },
        );
        setIsTransitioning(true);

        // setTimeout(() => {
        //   router.push("/think-count-quiz" as any);
        // }, 500);
      }

      if (gameType === "CHOR_POLICE") {
        /**
         * BUILD FINAL 4-PLAYER ROSTER:
         * 1. Separate humans and bots from the current player list.
         * 2. Take up to 4 humans (humans always have priority).
         * 3. If fewer than 4 humans, dynamically fill remaining slots with bots.
         * 4. This guarantees exactly 4 players every time.
         */
        const humans = players.filter((p) => !p.isBot);
        const existingBots = players.filter((p) => p.isBot);

        // Take at most 4 humans
        const selectedHumans = humans.slice(0, ROOM_MAX_PLAYERS);
        const botsNeeded = ROOM_MAX_PLAYERS - selectedHumans.length;

        // Reuse existing bots first, dynamically create more if needed
        let selectedBots = existingBots.slice(0, botsNeeded);

        // If we don't have enough existing bots, spawn fresh ones
        if (selectedBots.length < botsNeeded) {
          const extraNeeded = botsNeeded - selectedBots.length;
          const usedAvatars = new Set(
            [...selectedHumans, ...selectedBots].map((p) => p.avatarId),
          );

          for (let i = 0; i < extraNeeded; i++) {
            let avatarId: number;
            do {
              avatarId = Math.floor(Math.random() * 13) + 1;
            } while (usedAvatars.has(avatarId));
            usedAvatars.add(avatarId);

            const botName = getBotName(selectedBots.length + i);
            selectedBots.push({
              id: `bot_${botName.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`,
              name: botName,
              avatarId,
              isBot: true,
            });
          }
        }

        const finalPlayers = [...selectedHumans, ...selectedBots];

        console.log(
          `🎮 [Lobby] Final roster: ${finalPlayers.map((p) => `${p.name}(${p.isBot ? "BOT" : "HUMAN"})`).join(", ")}`,
        );

        // Bridge lobby players → Redux so PlayerCard can find avatar images
        dispatch(setSelectedImages(finalPlayers.map((p) => p.avatarId)));
        dispatch(
          setReduxPlayerNames(
            finalPlayers.map((player) => ({
              id: player.id,
              name: player.name,
              avatarId: player.avatarId,
            })),
          ),
        );

        ChorPoliceEngine.init(finalPlayers, stake, selectedRounds || 5);

        // Initialize bot behavior for bots in the final roster
        const bots = finalPlayers.filter((p) => p.isBot);
        ChorPoliceBotBehavior.init(bots);

        broadcastPacket(
          {
            type: MODES.CHOR_POLICE.GAME_START,
            hostName: userName,
            timestamp: Date.now(),
            betAmount: stake,
            playerCount: finalPlayers.length,
            totalRounds: selectedRounds || 5,
            players: finalPlayers,
          },
          { processLocally: false },
        );

        setIsTransitioning(true);
      }
    },
    [
      dispatch,
      players,
      difficulty,
      gameType,
      isStarting,
      selectedRounds,
      userName,
    ],
  );

  const handleAvatarSelect = useCallback(
    (id: number) => {
      setPlayers((currentPlayers) => {
        const isTaken = currentPlayers.some((p) => p.avatarId === id);
        if (isTaken) {
          toast.error(
            "Taken!",
            "🚫 Character already taken! Please pick another kid.",
          );
          return currentPlayers;
        }
        dispatch(setSelectedImages([id]));
        setShowAvatarGrid(false);

        // Update the host player's avatar in the player list so the UI reflects it
        return currentPlayers.map((p) =>
          p.id === localPlayerId ? { ...p, avatarId: id } : p,
        );
      });
    },
    [dispatch, localPlayerId],
  );

  const handleNameChange = useCallback((name: string) => {
    const sanitized = name.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 12);
    setUserName(sanitized);
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === localPlayerId ? { ...player, name: sanitized } : player,
      ),
    );
    if (sanitized.length >= 3) {
      saveUsername(sanitized);
    }
  }, [localPlayerId]);

  // Proposed: A single point of truth for cleanup
  const resetAllEngines = () => {
    [BotEngine, QuizEngine, ChorPoliceEngine, ChorPoliceBotBehavior].forEach(
      (engine) => {
        if (typeof engine.reset === "function") engine.reset();
      },
    );
    clearAllListeners();
  };

  return {
    isHost,
    localPlayerId,
    gameType,
    userName,
    players,
    allHosts,
    showAvatarGrid,
    setShowAvatarGrid,
    difficulty,
    isBettingModalVisible,
    setIsBettingModalVisible,
    selectedImages,
    maxPlayers,
    handleJoin,
    handleJoinSystemServer,
    handleDifficultyChange,
    handleConfirmStake,
    handleAvatarSelect,
    handleNameChange,
    resetAllEngines,
    isTransitioning,
  };
};
