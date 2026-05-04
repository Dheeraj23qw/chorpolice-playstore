import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OfflinePlayer {
  id: string;
  name: string;
  avatarId: number;
}

interface OfflineSessionState {
  players: OfflinePlayer[];
  totalRounds: number;
}

const initialState: OfflineSessionState = {
  players: [
    { id: "p1", name: "Player 1", avatarId: 1 },
    { id: "p2", name: "Player 2", avatarId: 2 },
    { id: "p3", name: "Player 3", avatarId: 3 },
    { id: "p4", name: "Player 4", avatarId: 4 },
  ],
  totalRounds: 3,
};

export const offlineSessionSlice = createSlice({
  name: "offlineSession",
  initialState,
  reducers: {
    setOfflinePlayers: (state, action: PayloadAction<OfflinePlayer[]>) => {
      state.players = action.payload;
    },
    updateOfflinePlayer: (state, action: PayloadAction<{ index: number; name?: string; avatarId?: number }>) => {
      const { index, name, avatarId } = action.payload;
      if (state.players[index]) {
        if (name !== undefined) state.players[index].name = name;
        if (avatarId !== undefined) state.players[index].avatarId = avatarId;
      }
    },
    resetOfflineSession: (state) => {
      state.players = initialState.players;
      state.totalRounds = initialState.totalRounds;
    },
    setTotalRounds: (state, action: PayloadAction<number>) => {
      state.totalRounds = action.payload;
    },
  },
});

export const { setOfflinePlayers, updateOfflinePlayer, resetOfflineSession, setTotalRounds } = offlineSessionSlice.actions;
export default offlineSessionSlice.reducer;
