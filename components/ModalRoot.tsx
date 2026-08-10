import React, { useCallback, useMemo } from "react";

import { createModalRegistry } from "@/components/modals/registry";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { dismissActiveModal } from "@/redux/reducers/modalQueueReducer";

export default function ModalRoot() {
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector((state) => state.modalQueue.activeModal);

  const closeActiveModal = useCallback(() => {
    dispatch(dismissActiveModal());
  }, [dispatch]);

  const modalRegistry = useMemo(
    () =>
      createModalRegistry({
        onCloseReward: closeActiveModal,
      }),
    [closeActiveModal],
  );

  return (
    <>
      {modalRegistry.map(({ key, render }) => (
        <React.Fragment key={key}>{render(activeModal === key)}</React.Fragment>
      ))}
    </>
  );
}
