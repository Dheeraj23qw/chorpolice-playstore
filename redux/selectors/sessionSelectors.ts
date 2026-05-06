import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ── Base selector ──
const selectSession = (state: RootState) => state.session;

// ── Lobby / Connection ──

export const selectIsHost = createSelector(
  [selectSession],
  (session) => session.isHost,
);

export const selectLocalPlayerId = createSelector(
  [selectSession],
  (session) => session.localPlayerId,
);

export const selectLocalPlayerName = createSelector(
  [selectSession],
  (session) => session.localPlayerName,
);

// ── Game State ──

export const selectGamePhase = createSelector(
  [selectSession],
  (session) => session.gamePhase,
);

export const selectCurrentRound = createSelector(
  [selectSession],
  (session) => session.currentRound,
);

export const selectTotalRounds = createSelector(
  [selectSession],
  (session) => session.totalRounds,
);

export const selectMyRole = createSelector(
  [selectSession],
  (session) => session.myRole,
);

export const selectRoles = createSelector(
  [selectSession],
  (session) => session.roles,
);

export const selectPoliceIndex = createSelector(
  [selectSession],
  (session) => session.policeIndex,
);

export const selectKingIndex = createSelector(
  [selectSession],
  (session) => session.kingIndex,
);

export const selectStake = createSelector(
  [selectSession],
  (session) => session.stake,
);

export const selectEconomy = createSelector(
  [selectSession],
  (session) => session.economy,
);
