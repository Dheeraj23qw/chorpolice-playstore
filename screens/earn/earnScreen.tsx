import React, { useState } from "react";
import ScreenWrapper from "@/components/screenwrapper";
import { useEarnLogic } from "@/hooks/useEarnLogic";
import { EarnContent } from "@/components/EarnScreen/EarnContent";
import { RedeemModal } from "@/modal/RedeemModal";

export default function EarnScreen() {
  const {
    coins,
    cardWidth,
    handleClaim,
  } = useEarnLogic();

  const [isRedeemVisible, setIsRedeemVisible] = useState(false);

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
        onRedeemPress={() => setIsRedeemVisible(true)}
      />
      <RedeemModal
        visible={isRedeemVisible}
        onClose={() => setIsRedeemVisible(false)}
      />
    </ScreenWrapper>
  );
}
