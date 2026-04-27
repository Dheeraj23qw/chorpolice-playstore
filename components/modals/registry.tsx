import React, { type ReactNode } from "react";

import { LowCoinModal } from "@/features/lowCoinReward";
import UnlockedAwardModal from "@/modal/AwardModal";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";
import type { ModalType } from "@/redux/reducers/modalQueueReducer";

export interface ModalRegistration {
  key: ModalType;
  render: (isActive: boolean) => ReactNode;
}

interface CreateModalRegistryParams {
  onClaimBonus: () => void;
  onCloseReward: () => void;
}

export function createModalRegistry({
  onClaimBonus,
  onCloseReward,
}: CreateModalRegistryParams): ModalRegistration[] {
  return [
    {
      key: "BONUS_MODAL",
      render: (isActive) => (
        <WelcomeBonusModal isVisible={isActive} onClaim={onClaimBonus} />
      ),
    },
    {
      key: "REWARD_MODAL",
      render: (isActive) => (
        <UnlockedAwardModal visible={isActive} onClaimed={onCloseReward} />
      ),
    },
  ];
}
