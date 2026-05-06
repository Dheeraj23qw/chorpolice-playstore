import { AppDispatch } from "@/redux/store";
import { Animated } from "react-native";
import { GamePhase } from "@/redux/reducers/sessionSlice";

export interface CPMultiplayerContext {
  // Redux
  dispatch: AppDispatch;
  
  // Navigation
  router: any;
  
  // States (Setters)
  setPlayerNames: React.Dispatch<React.SetStateAction<string[]>>;
  setPlayerScores: React.Dispatch<React.SetStateAction<any[]>>;
  setIsPlayButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setAreCardsClickable: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setRevealData: React.Dispatch<React.SetStateAction<any>>;
  setIsDynamicPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTableButton: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipAnims: React.Dispatch<React.SetStateAction<Animated.Value[]>>;
  setFlippedStates: React.Dispatch<React.SetStateAction<boolean[]>>;
  setClickedCards: React.Dispatch<React.SetStateAction<boolean[]>>;
  setFirstCardClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setInvisibleIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setQuizPlayerIndex: React.Dispatch<React.SetStateAction<number>>;
  setQuizDone: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizOptions: React.Dispatch<React.SetStateAction<number[]>>;
  setQuizOptionDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setMediaId: React.Dispatch<React.SetStateAction<number | null>>;
  setMediaType: React.Dispatch<React.SetStateAction<"image" | "video" | "gif" | null>>;
  setPlayerData: React.Dispatch<React.SetStateAction<any>>;

  // Refs (Anti-Stale)
  refs: {
    isHostRef: React.MutableRefObject<boolean>;
    localPlayerIdRef: React.MutableRefObject<string>;
    gamePhaseRef: React.MutableRefObject<GamePhase>;
    myRoleRef: React.MutableRefObject<string | null>;
    policeIndexRef: React.MutableRefObject<number | null>;
    playerNamesRef: React.MutableRefObject<string[]>;
    playerImagesRef: React.MutableRefObject<any>;
    flippedStatesRef: React.MutableRefObject<boolean[]>;
    clickedCardsRef: React.MutableRefObject<boolean[]>;
    flipAnimsRef: React.MutableRefObject<Animated.Value[]>;
    timerRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>;
    currentQuizPlayerIdRef: React.MutableRefObject<string | null>;
    scoreQuizStartedRef: React.MutableRefObject<boolean>;
    roundStartPendingRef: React.MutableRefObject<boolean>;
    quizOptionDisabledRef: React.MutableRefObject<boolean>;
    hasGuessedRef: React.MutableRefObject<boolean>;
    lastHostSignalAtRef: React.MutableRefObject<number>;
  };

  // Selectors/Computed (values that don't change within a packet cycle or are passed as snapshots)
  reduxRoles: string[];
  
  // Logic Helpers
  logic: {
    cleanup: any;
    economy: any;
    revealSequence: any;
    scoreQuiz: any;
    playTransition: (phase: GamePhase) => void;
    resolveScoreQuizPlayers: () => any[];
    setScoreQuizPlayersSnapshot: (players: any[]) => any[];
  };
}
