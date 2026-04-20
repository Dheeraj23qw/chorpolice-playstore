import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { toast } from "@/components/feedback/toast";
import { NETWORK, MODES } from "@/constants/Networking";
import { DifficultyOption } from "@/constants/difficultyConfig";
import { useLanDiscovery } from "@/hooks/useLanDiscovery";
import { RootState, AppDispatch } from "@/redux/store";
import {
  setPlayerNames as setReduxPlayerNames,
  setSelectedImages,
} from "@/redux/reducers/playerReducer";
import { setDifficulty, generateTable } from "@/redux/reducers/quiz";
import { BotEngine } from "@/service/BotEngine";
import { ChorPoliceBotBehavior } from "@/service/ChorPoliceBotBehavior";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { QuizEngine } from "@/service/QuizEngine";
import {
  broadcastPacket,
  clearAllListeners,
  configureSession,
  debugState,
  registerRemotePeer,
  sendPacketToHost,
  sendPacketToPeer,
  setSessionHostIp,
  startHeartbeat,
  subscribeToPackets,
  unregisterRemotePeer,
} from "@/service/lanGameService";
import { updateDebugMetric } from "@/service/observability/DebugService";
import {
  loadOrCreateClientPlayerId,
  loadUsername,
  saveUsername,
} from "@/storage/userStorage";
import { getBotName } from "@/utils/nameGenerator";

const ROOM_MAX_PLAYERS = 4;

export interface Player {
  id: string;
  name: string;
  avatarId: number;
  isBot?: boolean;
}

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
  const [isStarting, setIsStarting] = useState(false);
  const [selectedHostIp, setSelectedHostIp] = useState<string | null>(null);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound,
  );

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
    configureSession({ isHost, localPlayerId, hostIp: null });
    BotEngine.reset();
    QuizEngine.reset();
    ChorPoliceEngine.reset();
    ChorPoliceBotBehavior.reset();
    clearAllListeners();

    const hostPlayer: Player = {
      id: localPlayerId,
      name: userName,
      avatarId: selectedImages[0] || 1,
    };
    setPlayers([hostPlayer]);

    if (isHost) {
      startHeartbeat(true);
      updateDebugMetric("hostIp", "self-hosted");

      if (gameType === "QUIZ") {
        BotEngine.spawn(3);
        const timer = setTimeout(() => handleDifficultyChange("easy"), 800);
        return () => clearTimeout(timer);
      }

      if (gameType === "CHOR_POLICE") {
        BotEngine.spawn(3);
      }
    }
  }, [gameType, handleDifficultyChange, isHost, localPlayerId]);

  const { availableHosts, localIp } = useLanDiscovery(isHost, userName);

  useEffect(() => {
    debugState.connectionCount = isHost ? players.length - 1 : availableHosts.length;
    updateDebugMetric("discoveredHostCount", availableHosts.length);
  }, [players, availableHosts, isHost]);

  useEffect(() => {
    if (isHost) {
      updateDebugMetric("hostIp", localIp === "unknown" ? "self-hosted" : localIp);
    }
  }, [isHost, localIp]);

  const maxPlayers = ROOM_MAX_PLAYERS;

  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet, sourceIp) => {
      if (isHost) {
        if (packet.type === NETWORK.PLAYER_JOIN) {
          const joiningPlayer: Player = packet.player;
          const isHumanJoining = !joiningPlayer.isBot;
          let accepted = false;
          let rejectionReason: "room_full" | null = null;

          if (__DEV__) {
            console.log(
              `[LAN] Host received join from ${joiningPlayer.name} (${joiningPlayer.id}) at ${sourceIp ?? "unknown-ip"}`,
            );
          }

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

            if (isHumanJoining) {
              const humanCount = prev.filter((p) => !p.isBot).length;

              if (humanCount >= ROOM_MAX_PLAYERS) {
                rejectionReason = "room_full";
                toast.error(
                  "Room Full!",
                  "Maximum 4 players allowed. No more can join.",
                  3000,
                );
                return prev;
              }

              if (prev.length >= ROOM_MAX_PLAYERS) {
                const botIndex = prev.findIndex((p) => p.isBot);
                if (botIndex === -1) {
                  rejectionReason = "room_full";
                  toast.error(
                    "Room Full!",
                    "Maximum 4 players allowed. No more can join.",
                    3000,
                  );
                  return prev;
                }

                const updated = [...prev];
                const trimmedBot = updated.splice(botIndex, 1)[0];
                BotEngine.activeBots = BotEngine.activeBots.filter(
                  (bot) => bot.id !== trimmedBot.id,
                );
                accepted = true;
                return [...updated, joiningPlayer];
              }
            }

            if (prev.length >= maxPlayers) {
              rejectionReason = "room_full";
              return prev;
            }

            accepted = true;
            return [...prev, joiningPlayer];
          });

          if (accepted && sourceIp) {
            registerRemotePeer(joiningPlayer.id, sourceIp);
          } else if (rejectionReason && sourceIp) {
            sendPacketToPeer(sourceIp, {
              type: NETWORK.PLAYER_JOIN_REJECT,
              reason: rejectionReason,
            });
          }
        } else if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
          unregisterRemotePeer(packet.playerId);
          setPlayers((prev) =>
            prev.filter((player) => player.id !== packet.playerId),
          );
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

        setTimeout(() => {
          router.push({
            pathname: "/chor-police-mp",
            params: {
              playerId: localPlayerId,
              isHost: "false",
            },
          } as any);
        }, 300);
      } else if (packet.type === NETWORK.PLAYER_JOIN_REJECT) {
        setSelectedHostIp(null);
        setSessionHostIp(null);
        updateDebugMetric("hostIp", "N/A");
        toast.error(
          "Room Full",
          "This room already has 4 players. Please join another room.",
          3000,
        );
      } else if (
        packet.type === NETWORK.PLAYER_LEAVE &&
        packet.playerId === localPlayerId
      ) {
        setSelectedHostIp(null);
        updateDebugMetric("hostIp", "N/A");
        toast.error("Disconnected", "You were removed from the room.", 3000);
        router.dismissAll();
        router.replace("/mode-select" as any);
      }
    });

    return unsubscribe;
  }, [dispatch, gameType, isHost, localPlayerId, maxPlayers, router]);

  const handleJoin = useCallback(
    (host: any) => {
      const joinPacket = {
        type: NETWORK.PLAYER_JOIN,
        player: {
          id: localPlayerId,
          name: userName,
          avatarId: selectedImages[0] || 1,
        },
      };

      if (__DEV__) {
        console.log(
          `[LAN] Client joining host ${host.deviceName} at ${host.ip}. Local IP: ${localIp}`,
        );
      }

      setSelectedHostIp(host.ip);
      setSessionHostIp(host.ip);
      updateDebugMetric("hostIp", host.ip);
      sendPacketToHost(joinPacket);
      toast.success("Joining", `Connecting to ${host.deviceName}...`);
    },
    [localIp, localPlayerId, selectedImages, userName],
  );

  const handleConfirmStake = useCallback(
    (stake: number) => {
      if (isStarting) return;
      setIsStarting(true);

      setIsBettingModalVisible(false);
      toast.success("Stake Added", `${stake} coins added to pot!`);

      if (gameType === "QUIZ") {
        const humans = players.filter((player) => !player.isBot).slice(0, ROOM_MAX_PLAYERS);
        const existingBots = players.filter((player) => player.isBot);
        const botsNeeded = ROOM_MAX_PLAYERS - humans.length;

        let selectedBots = existingBots.slice(0, botsNeeded);

        if (selectedBots.length < botsNeeded) {
          const extraNeeded = botsNeeded - selectedBots.length;
          const usedAvatars = new Set(
            [...humans, ...selectedBots].map((player) => player.avatarId),
          );

          for (let index = 0; index < extraNeeded; index += 1) {
            let avatarId: number;
            do {
              avatarId = Math.floor(Math.random() * 13) + 1;
            } while (usedAvatars.has(avatarId));
            usedAvatars.add(avatarId);

            const botName = getBotName(selectedBots.length + index);
            selectedBots.push({
              id: `bot_${botName.toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`,
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
      }

      if (gameType === "CHOR_POLICE") {
        const humans = players.filter((player) => !player.isBot);
        const existingBots = players.filter((player) => player.isBot);
        const selectedHumans = humans.slice(0, ROOM_MAX_PLAYERS);
        const botsNeeded = ROOM_MAX_PLAYERS - selectedHumans.length;

        let selectedBots = existingBots.slice(0, botsNeeded);

        if (selectedBots.length < botsNeeded) {
          const extraNeeded = botsNeeded - selectedBots.length;
          const usedAvatars = new Set(
            [...selectedHumans, ...selectedBots].map((player) => player.avatarId),
          );

          for (let index = 0; index < extraNeeded; index += 1) {
            let avatarId: number;
            do {
              avatarId = Math.floor(Math.random() * 13) + 1;
            } while (usedAvatars.has(avatarId));
            usedAvatars.add(avatarId);

            const botName = getBotName(selectedBots.length + index);
            selectedBots.push({
              id: `bot_${botName.toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`,
              name: botName,
              avatarId,
              isBot: true,
            });
          }
        }

        const finalPlayers = [...selectedHumans, ...selectedBots];

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

        ChorPoliceEngine.init(finalPlayers, stake, selectedRounds || 5);
        ChorPoliceBotBehavior.init(finalPlayers.filter((player) => player.isBot));

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
      difficulty,
      dispatch,
      gameType,
      isStarting,
      players,
      selectedRounds,
      userName,
    ],
  );

  const handleAvatarSelect = useCallback(
    (id: number) => {
      setPlayers((currentPlayers) => {
        const isTaken = currentPlayers.some((player) => player.avatarId === id);
        if (isTaken) {
          toast.error(
            "Taken!",
            "Character already taken. Please pick another kid.",
          );
          return currentPlayers;
        }

        dispatch(setSelectedImages([id]));
        setShowAvatarGrid(false);

        return currentPlayers.map((player) =>
          player.id === localPlayerId ? { ...player, avatarId: id } : player,
        );
      });
    },
    [dispatch, localPlayerId],
  );

  const handleNameChange = useCallback(
    (name: string) => {
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
    },
    [localPlayerId],
  );

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
    allHosts: availableHosts,
    localIp,
    selectedHostIp,
    showAvatarGrid,
    setShowAvatarGrid,
    difficulty,
    isBettingModalVisible,
    setIsBettingModalVisible,
    selectedImages,
    maxPlayers,
    handleJoin,
    handleDifficultyChange,
    handleConfirmStake,
    handleAvatarSelect,
    handleNameChange,
    resetAllEngines,
    isTransitioning,
  };
};
