import React, { type ReactNode } from "react";

import { LowCoinModal } from "@/features/lowCoinReward";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";
import type { ModalType } from "@/redux/reducers/modalQueueReducer";

export interface ModalRegistration {
  key: ModalType;
  render: (isActive: boolean) => ReactNode;
}

interface CreateModalRegistryParams {
  onClaimBonus: () => void;
  onCloseLowCoin: () => void;
  onDisableLowCoin: () => void;
  onCloseReward: () => void;
}

export function createModalRegistry({
  onClaimBonus,
  onCloseLowCoin,
  onDisableLowCoin,
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
      key: "LOW_COIN_MODAL",
      render: (isActive) => (
        <LowCoinModal
          visible={isActive}
          onShare={onCloseLowCoin}
          onRate={onCloseLowCoin}
          onClose={onCloseLowCoin}
          onDisable={onDisableLowCoin}
        />
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
