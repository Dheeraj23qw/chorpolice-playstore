import { useState, useRef, useCallback } from "react";

export const useCPGameState = () => {
  const [gamePhase, setGamePhase] = useState("waiting");
  const [nextPhase, setNextPhase] = useState("score_quiz");
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [myRole, setMyRole] = useState(null);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [roles, setRoles] = useState(["King", "Advisor", "Thief", "Police"]);
  const [playerScores, setPlayerScores] = useState([]);

  // Indices
  const [indices, setIndices] = useState({
    police: null,
    king: null,
    advisor: null,
    thief: null,
  });

  // UI States
  const [ui, setUi] = useState({
    isPlayButtonDisabled: false,
    showTableButton: false,
    areCardsClickable: false,
    firstCardClicked: false,
    popupTable: false,
    isExitModalVisible: false,
    message: "",
  });

  const gamePhaseRef = useRef(gamePhase);
  gamePhaseRef.current = gamePhase;

  const playTransition = useCallback((afterPhase: any) => {
    setNextPhase(afterPhase);
    setGamePhase("video_transition");
  }, []);

  return {
    state: {
      gamePhase,
      nextPhase,
      round,
      totalRounds,
      myRole,
      playerNames,
      roles,
      playerScores,
      indices,
      ...ui,
    },
    refs: { gamePhaseRef },
    setGamePhase,
    setNextPhase,
    setRound,
    setTotalRounds,
    setMyRole,
    setPlayerNames,
    setRoles,
    setPlayerScores,
    setIndices,
    setUi,
    playTransition,
  };
};
