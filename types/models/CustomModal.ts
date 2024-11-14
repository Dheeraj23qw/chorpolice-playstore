export interface CustomModalButtonProps {
    text: string;
    onPress: () => void;
  }
  
  export interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
    buttons: CustomModalButtonProps[];
    children?: React.ReactNode; // Optional children prop if you need to pass custom content
  }
  