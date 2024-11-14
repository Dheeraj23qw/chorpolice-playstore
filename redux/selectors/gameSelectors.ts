// gameSelectors.ts

import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

// Base selector to get the entire game state
export const selectGameState = (state: RootState) => state.game;

// Selector for flipped states
export const selectFlippedStates = createSelector(
  (state: RootState) => state.game.flippedStates,
  (flippedStates) => flippedStates
);

// Selector for clicked cards
export const selectClickedCards = createSelector(
  (state: RootState) => state.game.clickedCards,
  (clickedCards) => clickedCards
);

// Selector for selected player
export const selectSelectedPlayer = createSelector(
  (state: RootState) => state.game.selectedPlayer,
  (selectedPlayer) => selectedPlayer
);

// Selector for current message
export const selectMessage = createSelector(
  (state: RootState) => state.game.message,
  (message) => message
);

// Selector for roles (King, Advisor, Thief, Police)
export const selectRoles = createSelector(
  (state: RootState) => state.game.roles,
  (roles) => roles
);

// Selector for play button disabled state
export const selectIsPlayButtonDisabled = createSelector(
  (state: RootState) => state.game.isPlayButtonDisabled,
  (isPlayButtonDisabled) => isPlayButtonDisabled
);

// Selector for police click count
export const selectPoliceClickCount = createSelector(
  (state: RootState) => state.game.policeClickCount,
  (policeClickCount) => policeClickCount
);

// Selector for police player name
export const selectPolicePlayerName = createSelector(
  (state: RootState) => state.game.policePlayerName,
  (policePlayerName) => policePlayerName
);

// Selector for police index
export const selectPoliceIndex = createSelector(
  (state: RootState) => state.game.policeIndex,
  (policeIndex) => policeIndex
);

// Selector for king index
export const selectKingIndex = createSelector(
  (state: RootState) => state.game.kingIndex,
  (kingIndex) => kingIndex
);

// Selector for advisor index
export const selectAdvisorIndex = createSelector(
  (state: RootState) => state.game.advisorIndex,
  (advisorIndex) => advisorIndex
);

// Selector for thief index
export const selectThiefIndex = createSelector(
  (state: RootState) => state.game.thiefIndex,
  (thiefIndex) => thiefIndex
);

// Selector for player scores
export const selectPlayerScores = createSelector(
  (state: RootState) => state.game.playerScores,
  (playerScores) => playerScores
);

// Selector for the current round number
export const selectRound = createSelector(
  (state: RootState) => state.game.round,
  (round) => round
);

// Selector for video index
export const selectVideoIndex = createSelector(
  (state: RootState) => state.game.videoIndex,
  (videoIndex) => videoIndex
);

// Selector for isPlaying state (whether the game is currently playing)
export const selectIsPlaying = createSelector(
  (state: RootState) => state.game.isPlaying,
  (isPlaying) => isPlaying
);

// Selector for whether cards are clickable
export const selectAreCardsClickable = createSelector(
  (state: RootState) => state.game.areCardsClickable,
  (areCardsClickable) => areCardsClickable
);

// Selector for modal visibility state
export const selectIsModalVisible = createSelector(
  (state: RootState) => state.game.isModalVisible,
  (isModalVisible) => isModalVisible
);

// Selector for popup index
export const selectPopupIndex = createSelector(
  (state: RootState) => state.game.popupIndex,
  (popupIndex) => popupIndex
);

// Selector for first card clicked state
export const selectFirstCardClicked = createSelector(
  (state: RootState) => state.game.firstCardClicked,
  (firstCardClicked) => firstCardClicked
);

// Selector for dynamic popup visibility
export const selectIsDynamicPopUp = createSelector(
  (state: RootState) => state.game.isDynamicPopUp,
  (isDynamicPopUp) => isDynamicPopUp
);

// Selector for media ID (image/video/gif)
export const selectMediaId = createSelector(
  (state: RootState) => state.game.mediaId,
  (mediaId) => mediaId
);

// Selector for media type (image/video/gif)
export const selectMediaType = createSelector(
  (state: RootState) => state.game.mediaType,
  (mediaType) => mediaType
);

// Selector for player data (image, message, imageType)
export const selectPlayerData = createSelector(
  (state: RootState) => state.game.playerData,
  (playerData) => playerData
);

// Selector for round start popup visibility
export const selectIsRoundStartPopupVisible = createSelector(
  (state: RootState) => state.game.isRoundStartPopupVisible,
  (isRoundStartPopupVisible) => isRoundStartPopupVisible
);

// Selector for round start message
export const selectRoundStartMessage = createSelector(
  (state: RootState) => state.game.roundStartMessage,
  (roundStartMessage) => roundStartMessage
);
