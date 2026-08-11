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
  setInvestigationTargets: React.Dispatch<React.SetStateAction<any[]>>;
  setMysteryRevealStep: React.Dispatch<React.SetStateAction<number>>;
  // Level 2 Quiz
  setQuizCountdown: React.Dispatch<React.SetStateAction<number | null>>;
  setShowQuizLeaderboard: React.Dispatch<React.SetStateAction<boolean>>;
  setIsQuizRoundComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizResultData: React.Dispatch<React.SetStateAction<any>>;
  setLocalL2Bonus: React.Dispatch<React.SetStateAction<number>>;
  setHasGuessedThisRound: React.Dispatch<React.SetStateAction<boolean>>;
  setBoostScoreModalVisible: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs (Anti-Stale)
  refs: {
    isHostRef: React.RefObject<boolean>;
    localPlayerIdRef: React.RefObject<string>;
    gamePhaseRef: React.RefObject<GamePhase>;
    myRoleRef: React.RefObject<string | null>;
    policeIndexRef: React.RefObject<number | null>;
    playerNamesRef: React.RefObject<string[]>;
    playerImagesRef: React.RefObject<any>;
    flippedStatesRef: React.RefObject<boolean[]>;
    clickedCardsRef: React.RefObject<boolean[]>;
    flipAnimsRef: React.RefObject<Animated.Value[]>;
    timerRefs: React.RefObject<ReturnType<typeof setTimeout>[]>;
    currentQuizPlayerIdRef: React.RefObject<string | null>;
    scoreQuizStartedRef: React.RefObject<boolean>;
    roundStartPendingRef: React.RefObject<boolean>;
    quizOptionDisabledRef: React.RefObject<boolean>;
    hasGuessedRef: React.RefObject<boolean>;
    lastHostSignalAtRef: React.RefObject<number>;
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
