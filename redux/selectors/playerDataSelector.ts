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