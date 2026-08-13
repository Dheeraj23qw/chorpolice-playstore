import React, { type ReactNode } from "react";

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
  return [];
}
