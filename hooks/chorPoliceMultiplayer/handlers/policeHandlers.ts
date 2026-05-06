import { Animated } from "react-native";
import { CPMultiplayerContext } from "./types";
import { AudioEngine } from "@/audio/audioEngine";
import { revealAllCards } from "../../useChorPoliceMultiplayer/helpers/revealAllCardsUtils";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { setMyRole as setReduxMyRole, setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";

export const handleRoundResult = (packet: any, context: CPMultiplayerContext) => {
  const { 
    setAreCardsClickable, setPlayerScores, setPopupIndex, setRevealData, 
    dispatch, refs, reduxRoles, setFlippedStates, setClickedCards, 
    setIsDynamicPopUp, setShowTableButton, setFirstCardClicked, setMessage, 
    setInvisibleIndices, setQuizDone, setQuizOptionDisabled, setQuizPlayerIndex,
    setFlipAnims, logic
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

  const pickedRole = packet.correct ? "Thief" : "Advisor";
  const targetIdx = packet.guessedIndex ?? (packet.correct ? reduxRoles.indexOf("Thief") : reduxRoles.indexOf("Advisor"));
  
  setPopupIndex(5);
  setRevealData({ role: pickedRole, isCorrect: packet.correct, index: targetIdx });
  AudioEngine.play(packet.correct ? "win" : "lose", "gameplay");

  const tReveal = setTimeout(() => {
    const currentFlipped = refs.flippedStatesRef.current;
    const currentClicked = refs.clickedCardsRef.current;
    const engineRoles = packet.allRoles?.map((info: any) => info.role) ?? [
      ...ChorPoliceEngine.state.roles,
    ];

    const revealTimer = revealAllCards(
      engineRoles,
      currentFlipped,
      refs.flipAnimsRef.current,
      setFlippedStates,
      currentClicked,
      () => {},
      () => {},
      dispatch,
    );
    refs.timerRefs.current.push(revealTimer);
  }, 2800);
  refs.timerRefs.current.push(tReveal);

  const t5 = setTimeout(() => {
    setPopupIndex(packet.correct ? 4 : 3);
  }, 5500);
  refs.timerRefs.current.push(t5);

  const t6 = setTimeout(() => {
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
      setFlipAnims(Array(4).fill(null).map(() => new Animated.Value(0)));
      setFlippedStates([false, false, false, false]);
      setClickedCards([false, false, false, false]);
      setAreCardsClickable(false);
      setFirstCardClicked(false);
      setPopupIndex(null);
      setMessage("");
      setInvisibleIndices([]);
      dispatch(setReduxMyRole(null));
      setShowTableButton(false);
      refs.hasGuessedRef.current = false;
      dispatch(setReduxGamePhase("round_video"));
    }
  }, 8500);
  refs.timerRefs.current.push(t6);
};
