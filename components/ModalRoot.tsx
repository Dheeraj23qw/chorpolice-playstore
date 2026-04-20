import React, { useCallback, useMemo } from "react";

import { createModalRegistry } from "@/components/modals/registry";
import { claimFirstLaunchBonus } from "@/features/wallet/walletSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
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

  const modalRegistry = useMemo(
    () =>
      createModalRegistry({
        onClaimBonus: handleBonusClaim,
        onCloseLowCoin: handleLowCoinClose,
        onDisableLowCoin: handleLowCoinDisable,
        onCloseReward: closeActiveModal,
      }),
    [
      closeActiveModal,
      handleBonusClaim,
      handleLowCoinClose,
      handleLowCoinDisable,
    ],
  );

  return (
    <>
      {modalRegistry.map(({ key, render }) => (
        <React.Fragment key={key}>{render(activeModal === key)}</React.Fragment>
      ))}
    </>
  );
}
