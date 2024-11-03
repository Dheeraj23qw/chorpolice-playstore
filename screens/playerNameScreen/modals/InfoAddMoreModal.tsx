import React from "react";
import CustomModal from "@/modal/CustomModal";

interface InfoAddMoreModalProps {
  visible: boolean;
  onClose: () => void;
  content: string; // Add content prop for dynamic content
}

const InfoAddMoreModal: React.FC<InfoAddMoreModalProps> = ({
  visible,
  onClose,
  content, // Destructure content prop
}) => {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Info"
      content={content} // Use the dynamic content
      buttons={[{ text: "OK", onPress: onClose }]}
    />
  );
};

export default InfoAddMoreModal;
