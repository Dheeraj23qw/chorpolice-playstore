import React, { memo } from "react";

import PlayButton from "@/components/RajamantriGameScreen/playButton";
import { OfflineInvestigationBanner } from "@/screens/OfflineGame/components/OfflineInvestigationBanner";

type PlayOrInvestigationCTAProps = {
  isInvestigation: boolean;
  message: string | null;
  isPlayButtonDisabled: boolean;
  handlePlay: () => void;
  buttonText: string;
};

export const PlayOrInvestigationCTA = memo(
  ({
    isInvestigation,
    message,
    isPlayButtonDisabled,
    handlePlay,
    buttonText,
  }: PlayOrInvestigationCTAProps) => {
    if (isInvestigation) {
      return message ? <OfflineInvestigationBanner message={message} /> : null;
    }

    return (
      <PlayButton
        disabled={isPlayButtonDisabled}
        onPress={handlePlay}
        buttonText={buttonText}
      />
    );
  },
);

PlayOrInvestigationCTA.displayName = "PlayOrInvestigationCTA";
