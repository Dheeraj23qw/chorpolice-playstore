import { loadOrCreateClientPlayerId, loadUsername } from "@/storage/userStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SessionPlayer {
  id: string;
  name: string;
  avatarId: number;
  isBot: boolean;
  type?: "HOST" | "CLIENT";
}

export type ConnectionStatus =
  | "IDLE"
  | "HOSTING"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

interface SessionState {
  roomCode: string | null;
  isHost: boolean;
  hostIp: string | null;
  localIp: string | null;
  connectionStatus: ConnectionStatus;
  players: SessionPlayer[];
  localPlayerId: string | null;
  localPlayerName: string;
  localAvatarId: number;
  gameType: string | null;
  errorMessage: string | null;
}

const DEFAULT_LOCAL_PLAYER_ID = loadOrCreateClientPlayerId();
const DEFAULT_LOCAL_PLAYER_NAME = loadUsername();
const DEFAULT_LOCAL_AVATAR_ID = 1;

const initialState: SessionState = {
  roomCode: null,
  isHost: false,
  hostIp: null,
  localIp: null,
  connectionStatus: "IDLE",
  players: [],
  localPlayerId: DEFAULT_LOCAL_PLAYER_ID,
  localPlayerName: DEFAULT_LOCAL_PLAYER_NAME,
  localAvatarId: DEFAULT_LOCAL_AVATAR_ID,
  gameType: null,
  errorMessage: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    configureSessionState: (
      state,
      action: PayloadAction<{
        isHost: boolean;
        localPlayerId: string;
        gameType: string;
      }>,
    ) => {
      state.isHost = action.payload.isHost;
      state.localPlayerId = action.payload.localPlayerId;
      state.gameType = action.payload.gameType;
      state.errorMessage = null;
    },

    setLocalSessionIdentity: (
      state,
      action: PayloadAction<{
        localPlayerId?: string;
        name?: string;
        avatarId?: number;
        localIp?: string | null;
      }>,
    ) => {
      if (action.payload.localPlayerId?.trim()) {
        state.localPlayerId = action.payload.localPlayerId.trim();
      }

      if (action.payload.name !== undefined) {
        state.localPlayerName = action.payload.name;
      }

      if (
        action.payload.avatarId !== undefined &&
        Number.isInteger(action.payload.avatarId) &&
        action.payload.avatarId > 0
      ) {
        state.localAvatarId = action.payload.avatarId;
      }

      if (action.payload.localIp !== undefined) {
        state.localIp = action.payload.localIp;
      }
    },

    setSessionNetworkInfo: (
      state,
      action: PayloadAction<{
        hostIp?: string | null;
        roomCode?: string | null;
      }>,
    ) => {
      if (action.payload.hostIp !== undefined) {
        state.hostIp = action.payload.hostIp;
      }
      if (action.payload.roomCode !== undefined) {
        state.roomCode = action.payload.roomCode;
      }
    },

    setConnectionStatus: (
      state,
      action: PayloadAction<ConnectionStatus>,
    ) => {
      state.connectionStatus = action.payload;
      if (action.payload !== "ERROR") {
        state.errorMessage = null;
      }
    },

    setSessionError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
      state.connectionStatus = action.payload ? "ERROR" : state.connectionStatus;
    },

    setLobbyPlayers: (state, action: PayloadAction<SessionPlayer[]>) => {
      state.players = action.payload.slice(0, 4);

      const localPlayer = state.localPlayerId
        ? state.players.find(
            (player) =>
              player.id === state.localPlayerId && !player.isBot,
          )
        : null;

      if (localPlayer) {
        state.localPlayerName = localPlayer.name;
        state.localAvatarId = localPlayer.avatarId;
      }
    },

    clearSession: (state) => ({
      ...initialState,
      localPlayerId: state.localPlayerId || initialState.localPlayerId,
      localPlayerName: state.localPlayerName || initialState.localPlayerName,
      localAvatarId: state.localAvatarId || initialState.localAvatarId,
      localIp: state.localIp,
    }),
  },
});

export const {
  clearSession,
  configureSessionState,
  setLocalSessionIdentity,
  setConnectionStatus,
  setLobbyPlayers,
  setSessionError,
  setSessionNetworkInfo,
} = sessionSlice.actions;

export default sessionSlice.reducer;
