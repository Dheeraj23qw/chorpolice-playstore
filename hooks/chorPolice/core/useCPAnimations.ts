/**
 * @file useCPAnimations.ts
 * @module Hooks/ChorPolice
 */

import { useState, useCallback } from "react";
import { Animated } from "react-native";
import { AudioEngine } from "@/audio/audioEngine";
import { flipCard } from "@/hooks/useChorPoliceMultiplayer/helpers/flipCardUtil";
import { revealAllCards } from "@/hooks/useChorPoliceMultiplayer/helpers/revealAllCardsUtils";

export const useCPAnimations = (timer: any, dispatch: any) => {
  const [flipAnims] = useState(() =>
    Array(4)
      .fill(null)
      .map(() => new Animated.Value(0)),
  );
  const [bounceAnims] = useState(() =>
    Array(4)
      .fill(null)
      .map(() => new Animated.Value(1)),
  );
  const [flippedStates, setFlippedStates] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [clickedCards, setClickedCards] = useState([
    false,
    false,
    false,
    false,
  ]);

  /**
   * SEQUENCE 1: runDealingSequence (11.5s Intro)
   */
  const runDealingSequence = useCallback(
    (packet: any, gameState: any) => {
      gameState.setGamePhase("dealing");
      AudioEngine.play("level", "gameplay");

      const { kingIndex, policeIndex } = packet;

      // STEP A: Initial Flip (King & Police)
      [kingIndex, policeIndex].forEach((idx) => {
        flipCard(
          idx,
          1,
          4000,
          flipAnims,
          setFlippedStates,
          [false, false, false, false],
          gameState.state.roles,
          [false, false, false, false],
          gameState.setRound,
          () => {},
          dispatch,
        );
      });

      // STEP B: 4.5s - Police Popup
      timer.add(() => {
        gameState.setUi((prev: any) => ({ ...prev, popupIndex: 2 }));
        AudioEngine.play("police", "gameplay");
      }, 4500);

      // STEP C: 8.5s - King Popup
      timer.add(() => {
        gameState.setUi((prev: any) => ({ ...prev, popupIndex: 1 }));
        AudioEngine.play("king", "gameplay");
      }, 8500);

      // STEP D: 11.5s - Enable Gameplay
      timer.add(() => {
        gameState.setUi((prev: any) => ({
          ...prev,
          popupIndex: null,
          areCardsClickable: gameState.state.myRole === "Police",
          showTableButton: gameState.state.myRole === "Police",
        }));
        gameState.setGamePhase("police_turn");
      }, 11500);
    },
    [flipAnims, dispatch, timer],
  );

  /**
   * SEQUENCE 2: runRevealSequence (8s Result)
   * FIXED: Corrected argument order for revealAllCards and added Win/Lose feedback.
   */
  const runRevealSequence = useCallback(
    (packet: any, gameState: any, onComplete: () => void) => {
      // 1. Instant Audio Feedback
      AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");

      // 2. Flip all remaining roles (Chor/Advisor)
      // CORRECT ORDER: roles, currentFlipped, currentAnims, setFlippedStates, clickedCards, setRound, callback, dispatch
      revealAllCards(
        gameState.state.roles,
        flippedStates,
        flipAnims,
        setFlippedStates,
        clickedCards,
        gameState.setRound,
        () => {},
        dispatch,
      );

      // 3. Show the Win/Lose Overlay (Popup index 4 for Win, 3 for Lose)
      timer.add(() => {
        const resultPopupIndex = packet.correct ? 4 : 3;
        gameState.setUi((prev: any) => ({
          ...prev,
          popupIndex: resultPopupIndex,
        }));
      }, 2000);

      // 4. End of result phase handover
      timer.add(() => {
        gameState.setUi((prev: any) => ({ ...prev, popupIndex: null }));
        onComplete();
      }, 8000);
    },
    [flipAnims, flippedStates, clickedCards, dispatch, timer],
  );

  const hardResetAnimations = useCallback(() => {
    flipAnims.forEach((anim) => anim.setValue(0));
    setFlippedStates([false, false, false, false]);
    setClickedCards([false, false, false, false]);
    bounceAnims.forEach((anim) => anim.setValue(1));
  }, [flipAnims, bounceAnims]);

  return {
    flipAnims,
    flippedStates,
    setFlippedStates,
    clickedCards,
    setClickedCards,
    bounceAnims,
    runDealingSequence,
    runRevealSequence,
    hardResetAnimations,
  };
};
