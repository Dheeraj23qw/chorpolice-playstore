import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Animated } from "react-native";
import { AppDispatch } from "@/redux/store";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { AudioEngine } from "@/audio/audioEngine";
import { flipCard } from "../useChorPoliceMultiplayer/helpers/flipCardUtil";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { MODES } from "@/constants/Networking";
import { dispatchPacket } from "@/service/packetDispatcher";

interface RevealDeps {
  flipAnimsRef: React.RefObject<Animated.Value[]>;
  setFlippedStates: React.Dispatch<React.SetStateAction<boolean[]>>;
  setInvisibleIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean[]>>; // wait, setAreCardsClickable is boolean state
  setShowTableButton: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupIndex: React.Dispatch<React.SetStateAction<number | null>>;
  timerRefs: React.RefObject<ReturnType<typeof setTimeout>[]>;
  myRoleRef: React.RefObject<string | null>;
  localPlayerId: string;
  setInvestigationTargets: (targets: any[]) => void;
  setMessage: (msg: string) => void;
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
  setInvestigationTargets,
  setMessage,
}: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const triggerRevealSequence = useCallback((packet: any) => {
    console.log(`🎭 [RevealSequence] 🚀 triggerRevealSequence() STARTED. King: ${packet.kingIndex}, Police: ${packet.policeIndex}`);
    const { kingIndex: kIdx, policeIndex: pIdx, policeId, kingId } = packet;
    const engineRoles = [...ChorPoliceEngine.state.roles];

    // Start with DEALING phase
    dispatch(setReduxGamePhase("dealing"));

    // 🔥 Immediately hide cards that are NOT King or Police during revolving
    const hiddenDuringSpin = [0, 1, 2, 3].filter(idx => idx !== kIdx && idx !== pIdx);
    console.log(`🎭 [RevealSequence] Hiding cards: ${hiddenDuringSpin.join(", ")}`);
    setInvisibleIndices(hiddenDuringSpin);

    AudioEngine.play("level", "gameplay");

    const _flipAnims = flipAnimsRef.current;
    
    const emptyStates = Array(20).fill(false);
    
    // Step A: Flip King + Police (4s)
    console.log("[RevealSequence] Starting King flip");
    flipCard(kIdx, 1, 4000, _flipAnims, setFlippedStates, emptyStates, engineRoles, emptyStates, () => {}, () => {}, dispatch);
    flipCard(pIdx, 1, 4000, _flipAnims, setFlippedStates, emptyStates, engineRoles, emptyStates, () => {}, () => {}, dispatch);

    // Step B: HOLD for 1s after spin then show PRIVATE REVEAL (5s total)
    console.log("[PRIVATE_REVEAL] timer scheduled");
    const t3 = setTimeout(() => {
      console.log("[PRIVATE_REVEAL] started");
      
      setMessage("Reveal your role...");
      dispatch(setReduxGamePhase("private_reveal"));
      
      // Step C: END PRIVATE REVEAL and start INVESTIGATION SHUFFLE (7s total)
      const t4 = setTimeout(() => {
        console.log("[PRIVATE_REVEAL] ended");
        
        // Update mystery cards for investigation
        if (packet.investigationTargets) {
          console.log("[INVESTIGATION] targets ready", packet.investigationTargets);
          setInvestigationTargets(packet.investigationTargets);
        }

        console.log("[INVESTIGATION] 3-card shuffle started");
        setInvisibleIndices([0, 1, 2, 3]); // Hide all original cards to show mystery cards
        dispatch(setReduxGamePhase("investigation_shuffle"));
        setMessage("Shuffling mystery cards...");

        // Step D: END SHUFFLE and start POLICE TURN (9s total)
        const t5 = setTimeout(() => {
          console.log("[INVESTIGATION] 3-card shuffle ended");
          const resolvedRole = myRoleRef.current || (policeId === localPlayerId ? "Police" : kingId === localPlayerId ? "King" : null);
          
          setPopupIndex(null);
          setMessage("");
          dispatch(setReduxGamePhase("police_turn"));

          const isLocalPlayerPolice = resolvedRole === "Police";
          console.log("[POLICE_TURN] interaction enabled", { isLocalPlayerPolice, myRole: resolvedRole });
          
          if (isLocalPlayerPolice) {
            setAreCardsClickable(true);
            setShowTableButton(true);
          }

          // 🤖 Trigger Bots precisely now
          dispatchPacket({
            type: MODES.CHOR_POLICE.POLICE_TURN_READY,
            round: packet.round,
            policeId: packet.policeId,
            investigationTargets: packet.investigationTargets
          });
        }, 2000);
        timerRefs.current.push(t5);
      }, 2000);
      timerRefs.current.push(t4);
    }, 5000);
    timerRefs.current.push(t3);
  }, [dispatch, flipAnimsRef, localPlayerId, myRoleRef, setAreCardsClickable, setFlippedStates, setInvisibleIndices, setPopupIndex, setShowTableButton, timerRefs, setInvestigationTargets, setMessage]);

  return {
    triggerRevealSequence,
  };
};
