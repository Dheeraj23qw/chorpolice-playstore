import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type ReconnectReason = 
  | "heartbeat_timeout" 
  | "socket_closed" 
  | "app_background" 
  | "host_lost" 
  | "unknown";

export interface ReconnectState {
  isActive: boolean;
  disconnectedPlayerId: string | null;
  disconnectedPlayerName: string | null;
  disconnectedPlayerAvatar?: number | null;
  startedAt: number | null;
  deadlineAt: number | null;
  remainingSeconds: number;
  reason: ReconnectReason | null;
  matchId: string | null;
  isResolving: boolean;
}

const initialState: ReconnectState = {
  isActive: false,
  disconnectedPlayerId: null,
  disconnectedPlayerName: null,
  disconnectedPlayerAvatar: null,
  startedAt: null,
  deadlineAt: null,
  remainingSeconds: 0,
  reason: null,
  matchId: null,
  isResolving: false,
};

const reconnectSlice = createSlice({
  name: "reconnect",
  initialState,
  reducers: {
    startReconnectWindow: (state, action: PayloadAction<{
      disconnectedPlayerId: string | null;
      disconnectedPlayerName: string | null;
      disconnectedPlayerAvatar?: number | null;
      deadlineAt: number;
      reason: ReconnectReason;
      matchId: string | null;
    }>) => {
      state.isActive = true;
      state.disconnectedPlayerId = action.payload.disconnectedPlayerId;
      state.disconnectedPlayerName = action.payload.disconnectedPlayerName;
      state.disconnectedPlayerAvatar = action.payload.disconnectedPlayerAvatar;
      state.startedAt = Date.now();
      state.deadlineAt = action.payload.deadlineAt;
      state.reason = action.payload.reason;
      state.matchId = action.payload.matchId;
      state.remainingSeconds = Math.max(0, Math.ceil((action.payload.deadlineAt - Date.now()) / 1000));
      state.isResolving = false;
    },
    tickReconnectWindow: (state) => {
      if (!state.isActive || !state.deadlineAt) return;
      state.remainingSeconds = Math.max(0, Math.ceil((state.deadlineAt - Date.now()) / 1000));
      if (state.remainingSeconds <= 0) {
        state.isResolving = true;
      }
    },
    resolveReconnectSuccess: (state) => {
      return initialState;
    },
    resolveReconnectFailed: (state) => {
      state.isResolving = true;
      // We don't clear immediately to allow UI to show "Failed" state if needed
      // but usually the coordinator will call clearReconnectState
    },
    clearReconnectState: () => {
      return initialState;
    },
  },
});

export const {
  startReconnectWindow,
  tickReconnectWindow,
  resolveReconnectSuccess,
  resolveReconnectFailed,
  clearReconnectState,
} = reconnectSlice.actions;

export const selectReconnectState = (state: RootState) => state.reconnect;
export const selectIsReconnectActive = (state: RootState) => state.reconnect.isActive;
export const selectReconnectRemainingSeconds = (state: RootState) => state.reconnect.remainingSeconds;
export const selectDisconnectedPlayerName = (state: RootState) => state.reconnect.disconnectedPlayerName;
export const selectReconnectDeadlineAt = (state: RootState) => state.reconnect.deadlineAt;

export default reconnectSlice.reducer;
