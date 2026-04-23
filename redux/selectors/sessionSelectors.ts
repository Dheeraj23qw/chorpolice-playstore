import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ── Base selector ──
const selectSession = (state: RootState) => state.session;

// ── Lobby / Connection ──

export const selectPlayers = createSelector(
  [selectSession],
  (session) => session.players,
);

export const selectIsHost = createSelector(
  [selectSession],
  (session) => session.isHost,
);

export const selectLocalPlayerId = createSelector(
  [selectSession],
  (session) => session.localPlayerId,
);

export const selectLocalPlayer = createSelector(
  [selectSession],
  (session) =>
    session.localPlayerId
      ? session.players.find((p) => p.id === session.localPlayerId) ?? null
      : null,
);

export const selectConnectionStatus = createSelector(
  [selectSession],
  (session) => session.connectionStatus,
);

export const selectRoomCode = createSelector(
  [selectSession],
  (session) => session.roomCode,
);

export const selectLobbyStage = createSelector(
  [selectSession],
  (session) => session.lobbyStage,
);

export const selectHostIp = createSelector(
  [selectSession],
  (session) => session.hostIp,
);

export const selectErrorMessage = createSelector(
  [selectSession],
  (session) => session.errorMessage,
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

export const selectRoundInfo = createSelector(
  [selectSession],
  (session) => ({
    round: session.currentRound,
    totalRounds: session.totalRounds,
    roles: session.roles,
    policeIndex: session.policeIndex,
    kingIndex: session.kingIndex,
    thiefIndex: session.thiefIndex,
    advisorIndex: session.advisorIndex,
    isRoundActive: session.isRoundActive,
  }),
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

export const selectIsRoundActive = createSelector(
  [selectSession],
  (session) => session.isRoundActive,
);
