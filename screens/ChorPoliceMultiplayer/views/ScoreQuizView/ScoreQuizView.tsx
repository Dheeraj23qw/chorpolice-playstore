import React from "react";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import ScoreQuizRound from "./ScoreQuizRound";
import ScoreQuizLeaderboard from "./ScoreQuizLeaderboard";

const ScoreQuizView = ({ g }: any) => {
  if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
    return (
      <DynamicOverlayPopUp
        isPopUp={g.isDynamicPopUp}
        mediaId={g.mediaId}
        mediaType={g.mediaType}
        closeVisibleDelay={3000}
        playerData={g.playerData}
      />
    );
  }

  if (g.showQuizLeaderboard) {
    return (
      <ScoreQuizLeaderboard
        onNextRound={g.handleNextQuizRound}
        isHost={g.isHost}
        isRoundComplete={g.isQuizRoundComplete}
        isLastQuestion={g.quizPlayerIndex >= 3}
      />
    );
  }

  return <ScoreQuizRound g={g} />;
};

export default ScoreQuizView;
