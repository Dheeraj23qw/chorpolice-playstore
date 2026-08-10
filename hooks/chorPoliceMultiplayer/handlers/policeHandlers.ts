import { Animated } from "react-native";
import { CPMultiplayerContext } from "./types";
import { AudioEngine } from "@/audio/audioEngine";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { setMyRole as setReduxMyRole, setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

export const handleRoundResult = (packet: any, context: CPMultiplayerContext) => {
  const { 
    setAreCardsClickable, setPlayerScores, setPopupIndex, setRevealData, 
    dispatch, refs, reduxRoles, setFlippedStates, setClickedCards, 
    setIsDynamicPopUp, setShowTableButton, setFirstCardClicked, setMessage, 
    setInvisibleIndices, setQuizDone, setQuizOptionDisabled, setQuizPlayerIndex,
    setFlipAnims, logic, setMysteryRevealStep
  } = context;

  const D = "🎭 [CPPacket]";

  // 🛡️ Timer Safety: Clear existing timers to prevent overlapping round-end sequences
  refs.timerRefs.current.forEach(clearTimeout);
  refs.timerRefs.current = [];

  refs.roundStartPendingRef.current = false;
  setAreCardsClickable(false);

  // Update UI-only score display
  setPlayerScores((prev) => {
    const updated = prev.map((p) => ({ ...p, scores: [...p.scores] }));
    packet.allRoles?.forEach((info: any) => {
      const entry = updated.find((p) => p.playerId === info.playerId);
      if (entry) {
        const pts: Record<string, number> = packet.correct
          ? { King: 1000, Advisor: 800, Police: 500, Thief: 0 }
          : { King: 1000, Advisor: 800, Police: 0, Thief: 500 };
        entry.scores.push(pts[info.role] || 0);
      }
    });
    return updated;
  });

  const pickedRole = packet.guessedRole || (packet.correct ? "Thief" : "Advisor");
  // 🎭 Mystery Index is 0, 1, or 2 corresponding to mystery cards at 10, 11, 12
  const mysteryIndex = typeof packet.guessedMysteryIndex === 'number' ? packet.guessedMysteryIndex : 0;
  
  // 🔥 Mark the card as clicked so it shows green/red border on all screens
  const mysteryPhysIndex = 10 + mysteryIndex;
  console.log(`[CP_MYSTERY] Selected mystery card=${mysteryIndex} (smash-out reveal)`);
  
  setClickedCards(prev => {
    const next = [...prev];
    next[mysteryPhysIndex] = true;
    return next;
  });

  // ── Smash-Out Reveal Sequence (synced across all players) ──
  // 1. Immediately: smash the 2 unselected cards off the board (random
  //    directions) while the selected card rises up — still covered.
  setMysteryRevealStep(1);

  // 2. After the smash-out, hold the selected card raised & covered.
  const tHold = setTimeout(() => {
    setMysteryRevealStep(2);
  }, CP_FLOW_TIMINGS.MYSTERY_SMASH_OUT_MS);
  refs.timerRefs.current.push(tHold);

  // 3. Flip ONLY the selected mystery card after it's been raised a while.
  const tFlip = setTimeout(() => {
    console.log("[CP_MYSTERY] Flipping selected mystery card");
    setFlippedStates(prev => {
      const next = [...prev];
      next[mysteryPhysIndex] = true;
      return next;
    });
    AudioEngine.play("select", "ui");
  }, CP_FLOW_TIMINGS.MYSTERY_SMASH_OUT_MS + CP_FLOW_TIMINGS.MYSTERY_SELECTED_HOLD_MS);
  refs.timerRefs.current.push(tFlip);

  // 4. Show Cinematic Reveal after the selected card finishes flipping
  const T_CINEMATIC = CP_FLOW_TIMINGS.MYSTERY_SMASH_OUT_MS + CP_FLOW_TIMINGS.MYSTERY_SELECTED_HOLD_MS + CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS;
  const tCinematic = setTimeout(() => {
    console.log("[CP_MYSTERY] Cinematic result reveal started");
    setPopupIndex(5);
    setRevealData({ role: pickedRole, isCorrect: packet.correct, index: mysteryIndex });
    AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");
  }, T_CINEMATIC);
  refs.timerRefs.current.push(tCinematic);

  // 4. Show Final Result Popup after cinematic duration
  const T_RESULT = T_CINEMATIC + CP_FLOW_TIMINGS.CINEMATIC_RESULT_REVEAL_MS;
  const tResult = setTimeout(() => {
    console.log("[CP_MYSTERY] Cinematic result reveal ended");
    setPopupIndex(packet.correct ? 4 : 3);
  }, T_RESULT); 
  refs.timerRefs.current.push(tResult);

  // 5. Final transition to next phase (Video / Quiz)
  const T_NEXT = T_RESULT + 3000; // Hold final result for 3 seconds
  const tNextPhase = setTimeout(() => {
    setIsDynamicPopUp(false);
    setShowTableButton(true);

    if (packet.isLastRound) {
      refs.scoreQuizStartedRef.current = false;
      setQuizPlayerIndex(0);
      setQuizDone(false);
      setQuizOptionDisabled(false);
      refs.quizOptionDisabledRef.current = false;
      logic.resolveScoreQuizPlayers();
      logic.playTransition("score_quiz");
    } else {
      setFlipAnims(Array(20).fill(null).map(() => new Animated.Value(0)));
      setFlippedStates(Array(20).fill(false));
      setClickedCards(Array(20).fill(false));
      setAreCardsClickable(false);
      setFirstCardClicked(false);
      setPopupIndex(null);
      setMessage("");
      setInvisibleIndices([]);
      setMysteryRevealStep(0);
      dispatch(setReduxMyRole(null));
      setShowTableButton(false);
      refs.hasGuessedRef.current = false;
      dispatch(setReduxGamePhase("round_video"));
    }
  }, T_NEXT);
  refs.timerRefs.current.push(tNextPhase);
};
