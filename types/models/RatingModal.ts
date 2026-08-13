export interface CustomRatingModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    onSuccess?: () => void;
  }