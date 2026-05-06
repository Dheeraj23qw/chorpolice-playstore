import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Animated } from "react-native";
import { AppDispatch } from "@/redux/store";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { AudioEngine } from "@/audio/audioEngine";
import { flipCard } from "../useChorPoliceMultiplayer/helpers/flipCardUtil";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";

interface RevealDeps {
  flipAnimsRef: React.MutableRefObject<Animated.Value[]>;
  setFlippedStates: React.Dispatch<React.SetStateAction<boolean[]>>;
  setInvisibleIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean[]>>; // wait, setAreCardsClickable is boolean state
  setShowTableButton: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupIndex: React.Dispatch<React.SetStateAction<number | null>>;
  timerRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>;
  myRoleRef: React.MutableRefObject<string | null>;
  localPlayerId: string;
}

export const useCPRevealSequence = ({
  flipAnimsRef,
  setFlippedStates,
  setInvisibleIndices,
  setAreCardsClickable,
  setShowTableButton,
  setPopupIndex,
  timerRefs,
  myRoleRef,
  localPlayerId,
}: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const triggerRevealSequence = useCallback((packet: any) => {
    const { kingIndex: kIdx, policeIndex: pIdx, policeId, kingId } = packet;
    const engineRoles = [...ChorPoliceEngine.state.roles];

    // 🔥 Immediately hide cards that are NOT King or Police during revolving
    const hiddenDuringSpin = [0, 1, 2, 3].filter(idx => idx !== kIdx && idx !== pIdx);
    setInvisibleIndices(hiddenDuringSpin);

    AudioEngine.play("level", "gameplay");

    const _flipAnims = flipAnimsRef.current;
    
    // Step A: Flip King + Police (4s)
    flipCard(kIdx, 1, 4000, _flipAnims, setFlippedStates, [false, false, false, false], engineRoles, [false, false, false, false], () => {}, () => {}, dispatch);
    flipCard(pIdx, 1, 4000, _flipAnims, setFlippedStates, [false, false, false, false], engineRoles, [false, false, false, false], () => {}, () => {}, dispatch);

    // Step B: HOLD for 1s after spin then show PRIVATE REVEAL (5s total)
    const t3 = setTimeout(() => {
      dispatch(setReduxGamePhase("private_reveal"));
      
      // Step C: END PRIVATE REVEAL and start POLICE TURN (7s total)
      const t4 = setTimeout(() => {
        setInvisibleIndices([kIdx, pIdx]);
        const resolvedRole = myRoleRef.current || (policeId === localPlayerId ? "Police" : kingId === localPlayerId ? "King" : null);
        
        setPopupIndex(null);
        dispatch(setReduxGamePhase("police_turn"));

        if (resolvedRole === "Police") {
          setAreCardsClickable(true);
          setShowTableButton(true);
        }
      }, 2000);
      timerRefs.current.push(t4);
    }, 5000);
    timerRefs.current.push(t3);
  }, [dispatch, flipAnimsRef, localPlayerId, myRoleRef, setAreCardsClickable, setFlippedStates, setInvisibleIndices, setPopupIndex, setShowTableButton, timerRefs]);

  return {
    triggerRevealSequence,
  };
};
