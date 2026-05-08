import { loadOrCreateClientPlayerId, loadUsername, loadAvatarId } from "@/storage/userStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PlayerConnectionStatus =
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "BOT_REPLACED";

export interface SessionPlayer {
  id: string;
  name: string;
  avatarId: number;
  isBot: boolean;
  type?: "HOST" | "CLIENT";
  coins: number;
  connectionStatus?: PlayerConnectionStatus;
  sessionToken?: string;
  deviceId?: string;
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
  | "private_reveal"
  | "investigation_shuffle"
  | "final_result";

export type CardDealPreset =
  | "classicSpin"
  | "tornadoDeal"
  | "waveDeal"
  | "orbitDeal"
  | "popBurstDeal";

export const CARD_DEAL_PRESETS: CardDealPreset[] = [
  "classicSpin",
  "tornadoDeal",
  "waveDeal",
  "orbitDeal",
  "popBurstDeal",
];

interface RoundRoleState {
  roles: string[];
  policeIndex: number | null;
  kingIndex: number | null;
  thiefIndex: number | null;
  advisorIndex: number | null;
}

export type SettlementStatus = "IDLE" | "PENDING" | "SETTLED" | "REFUNDED" | "CANCELLED";

interface EconomyState {
  matchId: string | null;
  stakeAmount: number;
  stakeDebited: boolean;
  settlementStatus: SettlementStatus;
  debitTransactionId?: string;
  refundTransactionId?: string;
}

interface SessionState {
  // ── Lobby / Connection ──
  roomCode: string | null;
  isHost: boolean;
  hostIp: string | null;
  localIp: string | null;
  isFallback: boolean;
  connectionStatus: ConnectionStatus;
  players: SessionPlayer[];
  localPlayerId: string | null;
  localPlayerName: string;
  localAvatarId: number;
  gameType: string | null;
  errorMessage: string | null;
  lobbyStage: LobbyStage;
  isReconnecting: boolean;
  reconnectTimeoutRemaining: number;
  sessionToken: string | null;
  deviceId: string | null;

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
  isBotThinking: boolean;
  dealAnimationPreset: CardDealPreset;
  stake: number;

  // ── Economy / Coins ──
  economy: EconomyState;
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
  isBotThinking: false,
  dealAnimationPreset: "classicSpin" as CardDealPreset,
  stake: 0,
  economy: {
    matchId: null as string | null,
    stakeAmount: 0,
    stakeDebited: false,
    settlementStatus: "IDLE" as SettlementStatus,
  },
};

const initialState: SessionState = {
  roomCode: null,
  isHost: false,
  hostIp: null,
  localIp: null,
  isFallback: false,
  connectionStatus: "IDLE",
  players: [],
  localPlayerId: DEFAULT_LOCAL_PLAYER_ID,
  localPlayerName: DEFAULT_LOCAL_PLAYER_NAME,
  localAvatarId: DEFAULT_LOCAL_AVATAR_ID,
  gameType: null,
  errorMessage: null,
  lobbyStage: "room",
  isReconnecting: false,
  reconnectTimeoutRemaining: 0,
  sessionToken: null,
  deviceId: null,
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
        sessionToken?: string;
        deviceId?: string;
      }>,
    ) => {
      state.isHost = action.payload.isHost;
      state.localPlayerId = action.payload.localPlayerId;
      state.gameType = action.payload.gameType;
      if (action.payload.sessionToken) state.sessionToken = action.payload.sessionToken;
      if (action.payload.deviceId) state.deviceId = action.payload.deviceId;
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
        isFallback?: boolean;
        sessionToken?: string | null;
      }>,
    ) => {
      if (action.payload.hostIp !== undefined) {
        state.hostIp = action.payload.hostIp;
      }
      if (action.payload.roomCode !== undefined) {
        state.roomCode = action.payload.roomCode;
      }
      if (action.payload.isFallback !== undefined) {
        state.isFallback = action.payload.isFallback;
      }
      if (action.payload.sessionToken !== undefined) {
        state.sessionToken = action.payload.sessionToken;
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
        // console.log(`[LAN_ORCH] [REDUX] Matched local player ${localPlayer.id} in list.`);
        // 🔥 FIX: Only overwrite local identity if it's currently empty/default.
        // This prevents the "echo" from the network from fighting with the local input.
        if (!state.localPlayerName || state.localPlayerName === "User") {
          state.localPlayerName = localPlayer.name;
        }
        if (!state.localAvatarId || state.localAvatarId === 1) {
          state.localAvatarId = localPlayer.avatarId;
        }
      } else if (state.localPlayerId) {
        // console.warn(`[LAN_ORCH] [REDUX] Local player ${state.localPlayerId} NOT in received list!`);
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

    setBotThinking: (state, action: PayloadAction<boolean>) => {
      state.isBotThinking = action.payload;
    },

    setDealAnimationPreset: (state, action: PayloadAction<CardDealPreset>) => {
      state.dealAnimationPreset = action.payload;
    },

    setStake: (state, action: PayloadAction<number>) => {
      state.stake = action.payload;
    },

    setPlayerConnectionStatus: (
      state,
      action: PayloadAction<{ playerId: string; status: PlayerConnectionStatus }>,
    ) => {
      const player = state.players.find((p) => p.id === action.payload.playerId);
      if (player) {
        player.connectionStatus = action.payload.status;
      }
    },

    setLocalReconnecting: (
      state,
      action: PayloadAction<{ isReconnecting: boolean; timeout?: number }>,
    ) => {
      state.isReconnecting = action.payload.isReconnecting;
      if (action.payload.timeout !== undefined) {
        state.reconnectTimeoutRemaining = action.payload.timeout;
      }
    },

    tickReconnectTimeout: (state) => {
      if (state.reconnectTimeoutRemaining > 0) {
        state.reconnectTimeoutRemaining -= 1;
      }
    },

    // ── Economy Reducers ──

    initMatchEconomy: (state, action: PayloadAction<{ matchId: string; stakeAmount: number }>) => {
      state.economy.matchId = action.payload.matchId;
      state.economy.stakeAmount = action.payload.stakeAmount;
      state.economy.stakeDebited = false;
      state.economy.settlementStatus = "PENDING";
    },

    markStakeDebited: (state) => {
      state.economy.stakeDebited = true;
    },

    setSettlementStatus: (state, action: PayloadAction<SettlementStatus>) => {
      state.economy.settlementStatus = action.payload;
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
  setDealAnimationPreset,
  setBotThinking,
  setStake,
  setPlayerConnectionStatus,
  setLocalReconnecting,
  tickReconnectTimeout,
  initMatchEconomy,
  markStakeDebited,
  setSettlementStatus,
  resetGameState,
} = sessionSlice.actions;

