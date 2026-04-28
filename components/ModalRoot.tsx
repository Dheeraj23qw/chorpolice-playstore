import React, { useCallback, useMemo } from "react";

import { createModalRegistry } from "@/components/modals/registry";
import { claimFirstLaunchBonus } from "@/features/wallet/walletSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { dismissActiveModal } from "@/redux/reducers/modalQueueReducer";
import { router } from "expo-router";

export default function ModalRoot() {
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);

  const closeActiveModal = useCallback(() => {
    dispatch(dismissActiveModal());
  }, [dispatch]);

  const handleBonusClaim = useCallback(() => {
    dispatch(claimFirstLaunchBonus());
    dispatch(dismissActiveModal());
    router.push("/earn");
  }, [dispatch]);

  const modalRegistry = useMemo(
    () =>
      createModalRegistry({
        onClaimBonus: handleBonusClaim,
        onCloseReward: closeActiveModal,
      }),
    [closeActiveModal, handleBonusClaim],
  );

  return (
    <>
      {modalRegistry.map(({ key, render }) => (
        <React.Fragment key={key}>{render(activeModal === key)}</React.Fragment>
      ))}
    </>
  );
}
