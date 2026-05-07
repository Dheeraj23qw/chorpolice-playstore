import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Animated } from "react-native";
import { AppDispatch } from "@/redux/store";
import { 
  setGamePhase as setReduxGamePhase,
  setDealAnimationPreset
} from "@/redux/reducers/sessionSlice";
import { AudioEngine } from "@/audio/audioEngine";
import { flipCard } from "../useChorPoliceMultiplayer/helpers/flipCardUtil";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { MODES } from "@/constants/Networking";
import { dispatchPacket } from "@/service/packetDispatcher";
import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";
import {
  DEALING_SPIN_MS,
  PUBLIC_REVEAL_SETTLE_MS,
} from "@/screens/ChorPoliceMultiplayer/components/GamePlaySection/constants";

// ─── Derived offsets (read-only, computed once at module level) ───────────────
const T_SHUFFLE  = DEALING_SPIN_MS;
const T_PUBLIC   = PUBLIC_REVEAL_SETTLE_MS;
const T_PRIVATE  = CP_FLOW_TIMINGS.HUMAN_ROLE_REVEAL_DURATION_MS;
const T_MYSTERY  = CP_FLOW_TIMINGS.MYSTERY_SHUFFLE_DURATION_MS;

// Cumulative offsets for each phase start
const OFFSET_PUBLIC_REVEAL   = T_SHUFFLE;
const OFFSET_PRIVATE_REVEAL  = T_SHUFFLE + T_PUBLIC;
const OFFSET_MYSTERY_SHUFFLE = T_SHUFFLE + T_PUBLIC + T_PRIVATE;
const OFFSET_POLICE_TURN     = T_SHUFFLE + T_PUBLIC + T_PRIVATE + T_MYSTERY;

interface RevealDeps {
  flipAnimsRef: React.RefObject<Animated.Value[]>;
  setFlippedStates: React.Dispatch<React.SetStateAction<boolean[]>>;
  setInvisibleIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean>>;
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
}: RevealDeps) => {
  const dispatch = useDispatch<AppDispatch>();

  const triggerRevealSequence = useCallback(
    (packet: any) => {
      const { kingIndex: kIdx, policeIndex: pIdx, policeId, kingId } = packet;
      const engineRoles = [...ChorPoliceEngine.state.roles];
      const flipAnims = flipAnimsRef.current;
      const emptyStates = Array(20).fill(false);

      // ── Phase 0: Shuffle / Dealing ────────────────────────────────────────
      console.log("[CP_FLOW] Shuffle started");
      
      if (packet.dealAnimationPreset) {
        console.log("[CP_ANIMATION] Selected deal preset from packet:", packet.dealAnimationPreset);
        dispatch(setDealAnimationPreset(packet.dealAnimationPreset));
      }

      dispatch(setReduxGamePhase("dealing"));
      setInvisibleIndices([]);
      setAreCardsClickable(false);
      setShowTableButton(false);
      setMessage("Shuffling all cards...");

      // ── Phase 1: Public King + Police Reveal (after shuffle) ─────────────
      const t_publicReveal = setTimeout(() => {
        console.log("[CP_FLOW] Public reveal started");
        AudioEngine.play("level", "gameplay");
        setMessage("King and Police revealed");

        flipCard(kIdx, 1, 1, flipAnims, setFlippedStates, emptyStates, engineRoles, emptyStates, () => {}, () => {}, dispatch, true);
        flipCard(pIdx, 1, 1, flipAnims, setFlippedStates, emptyStates, engineRoles, emptyStates, () => {}, () => {}, dispatch, true);
      }, OFFSET_PUBLIC_REVEAL);
      timerRefs.current.push(t_publicReveal);

      // ── Phase 2: Private Role Reveal ──────────────────────────────────────
      // NOTE: myRoleRef is read lazily inside this timer so it is guaranteed
      // to be set by the time CP_ROLE_ASSIGN has been processed (which arrives
      // well before the 6 s offset below).
      const t_privateReveal = setTimeout(() => {
        const role = myRoleRef.current ?? (
          policeId === localPlayerId ? "Police"
          : kingId === localPlayerId ? "King"
          : null
        );
        console.log(`[CP_FLOW] Human role reveal started: ${role ?? "unknown"}`);
        setMessage("");
        dispatch(setReduxGamePhase("private_reveal"));
      }, OFFSET_PRIVATE_REVEAL);
      timerRefs.current.push(t_privateReveal);

      // ── Phase 3: Mystery Investigation Shuffle ────────────────────────────
      const t_mysteryShuffle = setTimeout(() => {
        console.log("[CP_FLOW] Mystery shuffle started");
        if (packet.investigationTargets) {
          setInvestigationTargets(packet.investigationTargets);
        }
        setInvisibleIndices([0, 1, 2, 3]);
        dispatch(setReduxGamePhase("investigation_shuffle"));
        setMessage("Catch the Thief and stay away from Joker.");
        AudioEngine.play("spin", "gameplay");
      }, OFFSET_MYSTERY_SHUFFLE);
      timerRefs.current.push(t_mysteryShuffle);

      // ── Phase 4: Police Turn Ready ────────────────────────────────────────
      const t_policeTurn = setTimeout(() => {
        console.log("[CP_FLOW] Police turn ready");
        const resolvedRole =
          myRoleRef.current ?? (
            policeId === localPlayerId ? "Police"
            : kingId  === localPlayerId ? "King"
            : null
          );

        setPopupIndex(null);
        setMessage("Catch the Thief and stay away from Joker.");
        dispatch(setReduxGamePhase("police_turn"));

        if (resolvedRole === "Police") {
          setAreCardsClickable(true);
          setShowTableButton(true);
        }

        dispatchPacket({
          type: MODES.CHOR_POLICE.POLICE_TURN_READY,
          round: packet.round,
          policeId: packet.policeId,
          investigationTargets: packet.investigationTargets,
        });
      }, OFFSET_POLICE_TURN);
      timerRefs.current.push(t_policeTurn);
    },
    [
      dispatch,
      flipAnimsRef,
      localPlayerId,
      myRoleRef,
      setAreCardsClickable,
      setFlippedStates,
      setInvisibleIndices,
      setPopupIndex,
      setShowTableButton,
      timerRefs,
      setInvestigationTargets,
      setMessage,
    ],
  );

  return { triggerRevealSequence };
};
