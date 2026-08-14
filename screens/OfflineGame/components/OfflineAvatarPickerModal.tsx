import React from "react";
import { AvatarPickerModal } from "@/modal/AvatarPickerModal";

interface OfflineAvatarPickerModalProps {
  visible: boolean;
  editingPlayerName: string;
  selectedAvatarIds: number[];
  isAvatarTaken: (id: number) => boolean;
  onClose: () => void;
  onSelect: (avatarId: number) => void;
}

export const OfflineAvatarPickerModal: React.FC<
  OfflineAvatarPickerModalProps
> = (props) => {
  return <AvatarPickerModal {...props} />;
};

