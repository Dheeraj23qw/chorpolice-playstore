import React, { type ReactNode } from "react";

import UnlockedAwardModal from "@/modal/AwardModal";
import type { ModalType } from "@/redux/reducers/modalQueueReducer";

interface ModalRegistration {
  key: ModalType;
  render: (isActive: boolean) => ReactNode;
}

interface CreateModalRegistryParams {
  onCloseReward: () => void;
}

export function createModalRegistry({
  onCloseReward,
}: CreateModalRegistryParams): ModalRegistration[] {
  return [
    {
      key: "REWARD_MODAL",
      render: (isActive) => (
        <UnlockedAwardModal />
      ),
    },
  ];
}
