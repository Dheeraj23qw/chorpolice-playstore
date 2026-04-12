import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toast } from "@/components/feedback/toast";
import { useLanDiscovery } from "@/hooks/useLanDiscovery";
import { loadUsername, saveUsername } from "@/features/Avatar";
import { setSelectedImages } from "@/redux/reducers/playerReducer";
import { setDifficulty, generateTable } from "@/redux/reducers/quiz";
import { MODES, NETWORK } from "@/constants/Networking";
import { DifficultyOption } from "@/constants/difficultyConfig";
import {
  handleIncomingPacket,
  subscribeToPackets,
  startHeartbeat,
  stopHeartbeat,
  clearAllListeners,
  debugState,
} from "@/service/lanGameService";
import { BotEngine } from "@/service/BotEngine";
import { QuizEngine } from "@/service/QuizEngine";

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

  const [userName, setUserName] = useState<string>(() => loadUsername());
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [difficulty, setDifficultyState] = useState<DifficultyOption>("easy");
  const [isBettingModalVisible, setIsBettingModalVisible] = useState(false);

  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );

  // 🔥 HANDLERS (Defined early for use in effects)
  const handleDifficultyChange = useCallback((newLevel: DifficultyOption) => {
    if (!isHost) return;
    setDifficultyState(newLevel);
    const table = generateTable(newLevel);
    dispatch(setDifficulty({ level: newLevel, table }));
    handleIncomingPacket({
      type: MODES.THINK_AND_COUNT.DIFFICULTY_CHANGE,
      difficulty: newLevel,
      table,
    });
  }, [isHost]);

  // 🔥 INIT — Fresh state every time the lobby mounts
  useEffect(() => {
    /**
     * 🧹 STEP 1: Nuke ALL previous game state.
     * WHY: If the user plays a game and comes back to lobby,
     * BotEngine.activeBots, QuizEngine.state.playerScores, etc.
     * still contain data from the last session.
     */
    BotEngine.reset();
    QuizEngine.reset();
    clearAllListeners(); // Kill ghost listeners from crashed sessions

    // STEP 2: Start fresh — only the host player, zero bots
    const hostPlayer: Player = {
      id: "host_id",
      name: userName,
      avatarId: selectedImages[0] || 1,
    };
    setPlayers([hostPlayer]);

    // STEP 3: Initialize session
    if (isHost) {
      startHeartbeat(true, []);
      
      if (gameType === "QUIZ") {
        // Bots will join via PLAYER_JOIN packets (same as real players)
        // This ensures setPlayers picks them up through the subscription
        BotEngine.spawn(3);
        
        // Set default difficulty after listeners are ready
        const t = setTimeout(() => handleDifficultyChange("easy"), 800);
        return () => clearTimeout(t);
      }
    }

    // STEP 4: Cleanup on unmount — kill everything
    return () => {
      if (isHost) {
        stopHeartbeat();
        BotEngine.reset();
      }
    };
  }, [isHost, gameType]);

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

  // 🔥 SUBSCRIPTIONS
  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet) => {
      if (isHost) {
        // Host only cares about Joins
        if (packet.type === NETWORK.PLAYER_JOIN) {
          setPlayers((prev) => {
            if (prev.find((p) => p.id === packet.player.id)) return prev;
            if (prev.length >= 10) return prev;
            return [...prev, packet.player];
          });
        }
      } else {
        // Clients care about Sync
        if (packet.type === MODES.THINK_AND_COUNT.DIFFICULTY_CHANGE) {
          setDifficultyState(packet.difficulty);
          dispatch(setDifficulty({ level: packet.difficulty, table: packet.table }));
        } else if (packet.type === MODES.THINK_AND_COUNT.GAME_START) {
          setTimeout(() => {
            router.push("/think-count-quiz" as any);
          }, 300);
        }
      }
    });

    return unsubscribe;
  }, [isHost, router]);

  // 🔥 HANDLERS
  const handleJoinSystemServer = useCallback(() => {
    router.replace({
      pathname: "/(game)/lobby",
      params: { isHost: "true", gameType: gameType || "QUIZ", isSystem: "true" },
    } as any);
  }, [router, gameType]);

  /**
   * handleJoin — Called from PlayerListItem when a client taps "JOIN" on a discovered host.
   * For VIRTUAL hosts (system bots): re-mount as host with bots.
   * For REAL LAN hosts: send a PLAYER_JOIN packet so the host adds us.
   */
  const handleJoin = useCallback((host: any) => {
    if (host.type === "VIRTUAL") {
      // System Server — become the host with bots
      handleJoinSystemServer();
      return;
    }

    // Real LAN host — notify them we're joining
    const joinPacket = {
      type: NETWORK.PLAYER_JOIN,
      player: {
        id: `client_${Date.now()}`,
        name: userName,
        avatarId: selectedImages[0] || 1,
      },
    };
    handleIncomingPacket(joinPacket, host.ip);
    toast.success("Joining", `Connecting to ${host.deviceName}...`);
  }, [userName, selectedImages, handleJoinSystemServer]);

  const [isStarting, setIsStarting] = useState(false);
  const handleConfirmStake = useCallback((stake: number) => {
    if (isStarting) return; 
    setIsStarting(true);

    setIsBettingModalVisible(false);
    toast.success("Stake Added", `💰 ${stake} coins added to pot!`);

    if (gameType === "QUIZ") {
      QuizEngine.init(players, difficulty, stake);
      handleIncomingPacket({
        type: MODES.THINK_AND_COUNT.GAME_START,
        hostName: userName,
        timestamp: Date.now(),
        difficulty,
        betAmount: stake,
        playerCount: players.length,
      });

      setTimeout(() => {
        router.push("/think-count-quiz" as any);
      }, 500);
    }
  }, [players, difficulty, gameType, userName, isStarting, router]);

  const handleAvatarSelect = useCallback((id: number) => {
    setPlayers(currentPlayers => {
      const isTaken = currentPlayers.some((p) => p.avatarId === id);
      if (isTaken) {
        toast.error("Taken!", "🚫 Character already taken! Please pick another kid.");
        return currentPlayers;
      }
      dispatch(setSelectedImages([id]));
      setShowAvatarGrid(false);
      return currentPlayers;
    });
  }, [dispatch]);

  const handleNameChange = useCallback((name: string) => {
    const sanitized = name.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 12);
    setUserName(sanitized);
    if (sanitized.length >= 3) {
      saveUsername(sanitized);
    }
  }, []);

  return {
    isHost,
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
    handleJoin,
    handleJoinSystemServer,
    handleDifficultyChange,
    handleConfirmStake,
    handleAvatarSelect,
    handleNameChange,
  };
};
