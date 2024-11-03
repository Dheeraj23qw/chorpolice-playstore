import React from "react";
import CustomModal from "@/modal/CustomModal";

interface ConfirmChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: string;  // Add content as a prop
}

const ConfirmChangeModal: React.FC<ConfirmChangeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  content,  // Destructure the content prop
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Confirm Change"
      content={content}  // Use dynamic content here
      buttons={[
        { text: "No", onPress: onClose },
        { text: "Yes", onPress: onConfirm },
      ]}
    />
  );
};

export default ConfirmChangeModal;
