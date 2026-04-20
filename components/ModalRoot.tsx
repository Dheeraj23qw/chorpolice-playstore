import React, { useCallback } from "react";

import { LowCoinModal } from "@/features/lowCoinReward";
import { claimFirstLaunchBonus } from "@/features/wallet/walletSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { WelcomeBonusModal } from "@/modal/WelcomeBonusModal";
import { dismissActiveModal } from "@/redux/reducers/modalQueueReducer";
import { disableForever, dismissTemp } from "@/storage/lowCoinStorage";

export default function ModalRoot() {
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);

  const closeActiveModal = useCallback(() => {
    dispatch(dismissActiveModal());
  }, [dispatch]);

  const handleBonusClaim = useCallback(() => {
    dispatch(claimFirstLaunchBonus());
    dispatch(dismissActiveModal());
  }, [dispatch]);

  const handleLowCoinClose = useCallback(() => {
    dismissTemp();
    closeActiveModal();
  }, [closeActiveModal]);

  const handleLowCoinDisable = useCallback(() => {
    disableForever();
    closeActiveModal();
  }, [closeActiveModal]);

  return (
    <>
      <WelcomeBonusModal
        isVisible={activeModal === "BONUS_MODAL"}
        onClaim={handleBonusClaim}
      />

      <LowCoinModal
        visible={activeModal === "LOW_COIN_MODAL"}
        onShare={handleLowCoinClose}
        onRate={handleLowCoinClose}
        onClose={handleLowCoinClose}
        onDisable={handleLowCoinDisable}
      />

      <UnlockedAwardModal
        visible={activeModal === "REWARD_MODAL"}
        onClaimed={closeActiveModal}
      />
    </>
  );
}
