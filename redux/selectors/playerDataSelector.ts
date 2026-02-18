// redux/slices/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Select the entire player state
const selectPlayerState = (state: RootState) => state.player;

// Selector to get selected images
export const selectSelectedImages = createSelector(
  [selectPlayerState],
  (playerState) => playerState.selectedImages
);

// Selector to get player names
export const selectPlayerNames = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerNames
);

// Selector to get player total scores
export const selectPlayerScores = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerScores
);

// Selector to get game status (whether required data is present)
export const selectGameStatus = createSelector(
  [selectPlayerState],
  (playerState) => ({
    hasSelectedImages: playerState.selectedImages.length > 0,
    hasPlayerNames: playerState.playerNames.length > 0,
    hasScores: playerState.playerScores.length > 0,
  })
);

// Selector to get the player with the highest score (winner)
export const selectWinner = createSelector(
  [selectPlayerScores],
  (playerScores) => {
    if (playerScores.length === 0) return null; // Return null if no players
    return playerScores.reduce((highestScorer, currentPlayer) =>
      currentPlayer.totalScore > highestScorer.totalScore
        ? currentPlayer
        : highestScorer
    );
  }
);

// Selector to get player names as an array
export const playerNamesArray = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerNames.map((player) => player.name)
);

// Selector to get player scores by round (scores per round for each player)
export const selectPlayerScoresByRound = createSelector(
  [selectPlayerState],
  (playerState) => playerState.playerScoresByRound // Returns scores for each player per round
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