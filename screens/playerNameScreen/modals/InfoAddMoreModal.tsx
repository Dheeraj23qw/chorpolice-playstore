import React from "react";
import CustomModal from "@/modal/CustomModal";

interface InfoAddMoreModalProps {
  visible: boolean;
  onClose: () => void;
}

const InfoAddMoreModal: React.FC<InfoAddMoreModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Info"
      content="Add 3 more avatars to play"
      buttons={[{ text: "OK", onPress: onClose }]}
    />
  );
};

export default InfoAddMoreModal;
