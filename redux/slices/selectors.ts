// redux/slices/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store"; // Adjust the import path according to your project structure

const selectPlayerState = (state: RootState) => state.player;

export const selectSelectedImages = createSelector(
  [selectPlayerState],
  (playerState) => playerState.selectedImages
);

export const selectPlayerNames = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerNames
);

export const selectPlayerScores = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerScores
);

export const selectGameStatus = createSelector(
  [selectPlayerState],
  (playerState) => ({
    hasSelectedImages: playerState.selectedImages.length > 0,
    hasPlayerNames: playerState.playerNames.length > 0,
    hasScores: playerState.playerScores.length > 0,
  })
);

export const selectWinner = createSelector(
  [selectPlayerScores],
  (playerScores) => {
    if (playerScores.length === 0) return null;
    return playerScores.reduce((highestScorer, currentPlayer) =>
      currentPlayer.totalScore > highestScorer.totalScore
        ? currentPlayer
        : highestScorer
    );
  }
);

export const playerNamesArray = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerNames.map((player) => player.name)
);



export const PlayerScoresArray = createSelector(
  [selectPlayerState],
  (playerState) => 
    playerState.playerNames.map((player) => ({
      playerName: player.name,
      scores: playerState.playerScores
        .filter((score) => score.playerName === player.name)  // Filter scores by player name
        .map((score) => score.totalScore),  // Extracting the scores for each player
    }))
);