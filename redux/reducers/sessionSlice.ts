import { loadOrCreateClientPlayerId, loadUsername, loadAvatarId } from "@/storage/userStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SessionPlayer {
  id: string;
  name: string;
  avatarId: number;
  isBot: boolean;
  type?: "HOST" | "CLIENT";
  coins: number;
}

type ConnectionStatus =
  | "IDLE"
  | "HOSTING"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

type LobbyStage = "room" | "setup";

export type GamePhase =
  | "idle"
  | "video_transition"
  | "waiting"
  | "dealing"
  | "police_turn"
  | "result"
  | "finished"
  | "round_video"
  | "score_quiz"
  | "final_result";

interface RoundRoleState {
  roles: string[];
  policeIndex: number | null;
  kingIndex: number | null;
  thiefIndex: number | null;
  advisorIndex: number | null;
}

interface SessionState {
  // ── Lobby / Connection ──
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
  lobbyStage: LobbyStage;

  // ── Game State (Chor Police) ──
  gamePhase: GamePhase;
  currentRound: number;
  totalRounds: number;
  roles: string[];
  policeIndex: number | null;
  kingIndex: number | null;
  thiefIndex: number | null;
  advisorIndex: number | null;
  myRole: string | null;
  isRoundActive: boolean;
  stake: number;
}

const DEFAULT_LOCAL_PLAYER_ID = loadOrCreateClientPlayerId();
const DEFAULT_LOCAL_PLAYER_NAME = loadUsername();
const DEFAULT_LOCAL_AVATAR_ID = loadAvatarId();

const INITIAL_GAME_STATE = {
  gamePhase: "idle" as GamePhase,
  currentRound: 1,
  totalRounds: 3,
  roles: [] as string[],
  policeIndex: null as number | null,
  kingIndex: null as number | null,
  thiefIndex: null as number | null,
  advisorIndex: null as number | null,
  myRole: null as string | null,
  isRoundActive: false,
  stake: 0,
};

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
  lobbyStage: "room",
  ...INITIAL_GAME_STATE,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // ── Lobby / Connection Reducers (unchanged) ──

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

    setLobbyStage: (state, action: PayloadAction<LobbyStage>) => {
      state.lobbyStage = action.payload;
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

    // ── Game State Reducers (NEW) ──

    setGamePhase: (state, action: PayloadAction<GamePhase>) => {
      state.gamePhase = action.payload;
    },

    setRoundState: (
      state,
      action: PayloadAction<{
        round: number;
        totalRounds?: number;
        roles: string[];
        policeIndex: number | null;
        kingIndex: number | null;
        thiefIndex: number | null;
        advisorIndex: number | null;
      }>,
    ) => {
      state.currentRound = action.payload.round;
      if (action.payload.totalRounds !== undefined) {
        state.totalRounds = action.payload.totalRounds;
      }
      state.roles = action.payload.roles;
      state.policeIndex = action.payload.policeIndex;
      state.kingIndex = action.payload.kingIndex;
      state.thiefIndex = action.payload.thiefIndex;
      state.advisorIndex = action.payload.advisorIndex;
    },

    setMyRole: (state, action: PayloadAction<string | null>) => {
      state.myRole = action.payload;
    },

    setRoundActive: (state, action: PayloadAction<boolean>) => {
      state.isRoundActive = action.payload;
    },

    setStake: (state, action: PayloadAction<number>) => {
      state.stake = action.payload;
    },

    // ── Reset ──

    clearSession: (state) => ({
      ...initialState,
      localPlayerId: state.localPlayerId || initialState.localPlayerId,
      localPlayerName: state.localPlayerName || initialState.localPlayerName,
      localAvatarId: state.localAvatarId || initialState.localAvatarId,
      localIp: state.localIp,
    }),

    resetGameState: (state) => {
      Object.assign(state, INITIAL_GAME_STATE);
    },
  },
});

export const {
  clearSession,
  configureSessionState,
  setLocalSessionIdentity,
  setConnectionStatus,
  setLobbyPlayers,
  setLobbyStage,
  setSessionError,
  setSessionNetworkInfo,
  setGamePhase,
  setRoundState,
  setMyRole,
  setRoundActive,
  setStake,
  resetGameState,
} = sessionSlice.actions;

