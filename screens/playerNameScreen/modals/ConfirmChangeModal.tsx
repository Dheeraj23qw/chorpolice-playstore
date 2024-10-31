import React from "react";
import CustomModal from "@/modal/CustomModal";

interface ConfirmChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmChangeModal: React.FC<ConfirmChangeModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Confirm Change"
      content="Do you want to change this superhero?"
      buttons={[
        { text: "No", onPress: onClose },
        { text: "Yes", onPress: onConfirm },
      ]}
    />
  );
};

export default ConfirmChangeModal;
