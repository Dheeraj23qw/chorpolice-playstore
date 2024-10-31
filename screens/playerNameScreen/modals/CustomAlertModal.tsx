import React from "react";
import CustomModal from "@/modal/CustomModal";

interface CustomAlertModalProps {
  visible: boolean;
  onClose: () => void;
  alertMessage: string;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  onClose,
  alertMessage,
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Alert"
      content={alertMessage}
      buttons={[{ text: "OK", onPress: onClose }]}
    />
  );
};

export default CustomAlertModal;
