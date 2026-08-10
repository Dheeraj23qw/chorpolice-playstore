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
    setFlipAnims, logic, setMysteryRevealStep, setBoostScoreModalVisible
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
  // Stage 1 (t = 0): board freezes; the 2 unselected cards smash out of the
  // phone in random directions while the selected card stays in its slot.
  setMysteryRevealStep(1);

  // Stage 2 (t = FREEZE): after the freeze window the selected card travels
  // to the center of the board — still covered.
  const T_RISE = CP_FLOW_TIMINGS.MYSTERY_FREEZE_MS;
  const tRise = setTimeout(() => {
    setMysteryRevealStep(2);
  }, T_RISE);
  refs.timerRefs.current.push(tRise);

  // Stage 3: Flip ONLY the selected mystery card after it settles at center.
  const T_FLIP =
    T_RISE +
    CP_FLOW_TIMINGS.MYSTERY_RISE_MS +
    CP_FLOW_TIMINGS.MYSTERY_CENTER_HOLD_MS;
  const tFlip = setTimeout(() => {
    setFlippedStates(prev => {
      const next = [...prev];
      next[mysteryPhysIndex] = true;
      return next;
    });
    AudioEngine.play("select", "ui");
  }, T_FLIP);
  refs.timerRefs.current.push(tFlip);

  // 4. Show Cinematic Reveal after the selected card finishes flipping
  const T_CINEMATIC = T_FLIP + CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS;
  const tCinematic = setTimeout(() => {
    setPopupIndex(5);
    setRevealData({ role: pickedRole, isCorrect: packet.correct, index: mysteryIndex });
    AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");
  }, T_CINEMATIC);
  refs.timerRefs.current.push(tCinematic);

  // 4. Show Final Result Popup after cinematic duration
  const T_RESULT = T_CINEMATIC + CP_FLOW_TIMINGS.CINEMATIC_RESULT_REVEAL_MS;
  const tResult = setTimeout(() => {
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
      // Level 2 is opt-in: show the score boost terms before the host starts it.
      setBoostScoreModalVisible(true);
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
