/**
 * LobbyPacketHandler — Handles all incoming lobby-level packets.
 * Extracted from lanLobbyCoordinator for Single Responsibility.
 * 
 * Contains: PLAYER_JOIN, PLAYER_LIST_UPDATE, PLAYER_LEAVE, PLAYER_JOIN_REJECT
 * All bug fixes (idempotent join, room code validation, game termination) preserved.
 */
import { NETWORK } from "@/constants/Networking";
import { toast } from "@/components/feedback/toast";
import {
  SessionPlayer,
  setConnectionStatus,
  setLobbyStage,
  setSessionError,
} from "@/redux/reducers/sessionSlice";
import store from "@/redux/store";
import {
  replaceFirstBotWithPlayer,
  replacePlayerWithBot,
} from "@/utils/lobbyPlayers";
import {
  registerRemotePeer,
  sendPacketToPeer,
  unregisterRemotePeer,
  normalizePeerIp,
} from "../lanGameService";
import {
  sanitizeJoiningPlayer,
  checkLobbyDataChanged,
} from "./LobbyDataHelpers";
import { isLobbyPresenceToastAllowed } from "./LobbyToastVisibility";
import { BotEngine as QuizBotEngine } from "../QuizBotEngine";
import { logLanDebug, updateDebugMetric } from "../observability/DebugService";

type SyncFn = (players: SessionPlayer[]) => void;
type BroadcastFn = (players: SessionPlayer[]) => void;
type ClearJoinFn = () => void;
type LeaveFn = () => Promise<void>;

export type LobbyPacketDeps = {
  syncPlayerListLocally: SyncFn;
  broadcastPlayerList: BroadcastFn;
  clearJoinAttempts: ClearJoinFn;
  leaveLanLobby: LeaveFn;
  announcedPlayerIds: Set<string>;
};

export const handleLobbyPacket = (
  packet: any,
  rawSourceIp: string | undefined,
  deps: LobbyPacketDeps,
) => {
  const state = store.getState().session;
  const sourceIp = normalizePeerIp(rawSourceIp);

  if (!packet?.type) return;

  // ── PLAYER_JOIN (host only) ──
  if (packet.type === NETWORK.PLAYER_JOIN) {
    if (!state.isHost) return;

    // Room code validation
    if (packet.roomCode && state.roomCode && packet.roomCode !== state.roomCode) {
      console.warn(`[Lobby] Rejecting join: room code mismatch`);
      if (sourceIp) {
        sendPacketToPeer(sourceIp, { type: NETWORK.PLAYER_JOIN_REJECT, reason: "invalid_room_code" });
      }
      return;
    }

    // Reject late joins if the game is already in progress or ended
    if (state.gamePhase !== "idle") {
      console.warn(`[Lobby] Rejecting join: game already in progress or ended (${state.gamePhase})`);
      if (sourceIp) {
        sendPacketToPeer(sourceIp, { type: NETWORK.PLAYER_JOIN_REJECT, reason: "game_in_progress" });
      }
      return;
    }

    const humansCount = state.players.filter(p => !p.isBot).length;
    const joiningPlayer = sanitizeJoiningPlayer(packet.player, `guest_${Date.now()}`, humansCount + 1);

    let nextPlayers = state.players;
    let isDataChanged = false;
    let isNewJoin = false;

    const existingIndex = state.players.findIndex(p => p.id === joiningPlayer.id);

    if (existingIndex >= 0) {
      const existing = state.players[existingIndex];
      // IDEMPOTENCY: Only update and broadcast if data actually changed
      if (checkLobbyDataChanged(existing, joiningPlayer)) {
        console.log(`[Lobby] Merging updated data for existing player ${joiningPlayer.id}`);
        nextPlayers = [...state.players];
        nextPlayers[existingIndex] = { ...existing, ...joiningPlayer, isBot: false };
        isDataChanged = true;
      }
    } else {
      const sessionToken = Math.random().toString(36).substring(2, 15);
      const replaced = replaceFirstBotWithPlayer(state.players, { 
        ...joiningPlayer, 
        isBot: false,
        sessionToken,
        deviceId: packet.deviceId,
        connectionStatus: "CONNECTED"
      });
      if (!replaced) {
        if (sourceIp) sendPacketToPeer(sourceIp, { type: NETWORK.PLAYER_JOIN_REJECT, reason: "room_full" });
        return;
      }
      nextPlayers = replaced;

      // 🔥 THINK AND COUNT SPECIAL RULE: If 2 humans, remove all bots
      const newHumansCount = nextPlayers.filter(p => !p.isBot).length;
      if (state.gameType === "THINK_AND_COUNT" && newHumansCount >= 2) {
        console.log(`[Lobby] Think and Count: ${newHumansCount} humans detected. Removing all bots.`);
        nextPlayers = nextPlayers.filter(p => !p.isBot);
        // Explicitly notify bot engine to clear timers
        QuizBotEngine.updateActiveBots(nextPlayers);
      }

      isDataChanged = true;
      isNewJoin = true;
    }

    // FIX-5: Only register peer on new joins or data changes to avoid registration spam
    if (sourceIp && (isNewJoin || isDataChanged)) {
      registerRemotePeer(joiningPlayer.id, sourceIp);
    }

    if (isNewJoin && !deps.announcedPlayerIds.has(joiningPlayer.id)) {
      deps.announcedPlayerIds.add(joiningPlayer.id);
      if (isLobbyPresenceToastAllowed(state)) {
        toast.success(`${joiningPlayer.name} joined!`);
      }
    }

    if (isDataChanged) {
      deps.syncPlayerListLocally(nextPlayers);
      deps.broadcastPlayerList(nextPlayers);
      // Sync bot engine state
      if (state.gameType === "THINK_AND_COUNT") {
        QuizBotEngine.updateActiveBots(nextPlayers);
      }
    } else if (sourceIp) {
      // Re-send current state to confirm the duplicate join without broadcasting
      sendPacketToPeer(sourceIp, {
        type: NETWORK.PLAYER_LIST_UPDATE,
        players: state.players,
        lobbyStage: state.lobbyStage,
      });
    }
    return;
  }

  // ── PLAYER_LIST_UPDATE (client) ──
  if (packet.type === NETWORK.PLAYER_LIST_UPDATE && Array.isArray(packet.players)) {
    deps.clearJoinAttempts();
    deps.syncPlayerListLocally(packet.players);
    store.dispatch(setLobbyStage(packet.lobbyStage === "setup" ? "setup" : "room"));
    if (!state.isHost) {
      const wasConnecting = state.connectionStatus === "CONNECTING";
      store.dispatch(setConnectionStatus("CONNECTED"));
      store.dispatch(setSessionError(null));
      if (wasConnecting) {
        logLanDebug("client connected");
        updateDebugMetric("lanClientConnection", "connected");
        toast.success("All set! 🎉", "You've successfully joined the room.");
      }
    }
    return;
  }

  // ── PLAYER_LEAVE ──
  if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
    deps.clearJoinAttempts();

    // TERMINATE GAME IF IN PROGRESS — human leaving mid-game ends session
    if (state.gamePhase !== "idle") {
      const leaver = state.players.find(p => p.id === packet.playerId);
      if (!(leaver?.isBot ?? false)) {
        store.dispatch(setConnectionStatus("ERROR"));
        store.dispatch(setSessionError(
          state.isHost
            ? `${leaver?.name || "A player"} left the game. Session terminated.`
            : "The host or a player disconnected. Game ended."
        ));
        void deps.leaveLanLobby();
        return;
      }
    }

    if (state.isHost) {
      unregisterRemotePeer(packet.playerId);
      const departingPlayer = state.players.find(p => p.id === packet.playerId);
      const nextPlayers = replacePlayerWithBot(state.players, packet.playerId);
      if (nextPlayers !== state.players) {
        deps.syncPlayerListLocally(nextPlayers);
        deps.broadcastPlayerList(nextPlayers);
        const botIndex = state.players.findIndex(p => p.id === packet.playerId);
        const bot = nextPlayers[botIndex];
        if (bot?.isBot) toast.info(`${departingPlayer?.name || "Player"} left. ${bot.name} is now ready.`);
      }
      return;
    }

    // PROD-2 FIX: Only show ERROR if this was NOT a self-initiated leave
    if (packet.playerId === state.localPlayerId && packet.reason !== "player_quit" && packet.reason !== "user_exit") {
      store.dispatch(setConnectionStatus("ERROR"));
      store.dispatch(setSessionError("Lost connection to the room."));
    }
    return;
  }

  // ── PLAYER_JOIN_REJECT ──
  if (packet.type === NETWORK.PLAYER_JOIN_REJECT) {
    deps.clearJoinAttempts();
    store.dispatch(setConnectionStatus("ERROR"));
    const errorMsg = packet.reason === "room_full"
      ? "This room already has 4 real players."
      : packet.reason === "invalid_room_code"
      ? "Invalid Room Code. Make sure you entered it correctly."
      : "Could not join the room.";
    store.dispatch(setSessionError(errorMsg));
  }
};
