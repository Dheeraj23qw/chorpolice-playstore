import React from "react";
import ScreenWrapper from "@/components/screenwrapper";
import { useEarnLogic } from "@/hooks/useEarnLogic";
import { EarnContent } from "@/components/EarnScreen/EarnContent";

export default function EarnScreen() {
  const {
    coins,
    cardWidth,
    handleClaim,
  } = useEarnLogic();

  return (
    <ScreenWrapper
      title="Rewards Hub"
      variant="dark"
      subtitle="Convert effort into prizes"
    >
      <EarnContent
        coins={coins}
        cardWidth={cardWidth}
        handleClaim={handleClaim}
      />
    </ScreenWrapper>
  );
}
