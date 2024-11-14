export interface PlayerData {
    image?: any;
    name?: string | null;
    message?: any;
    imageType?: any;
  }
  
  export interface OverlayPopUpProps {
    isPopUp: boolean;
    mediaId: number;
    mediaType: "image" | "video" | "gif";
    playerData?: PlayerData;
    closeVisibleDelay: number; // Time in milliseconds before "Tap to Close" becomes visible
  }
  