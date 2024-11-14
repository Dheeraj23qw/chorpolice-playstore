export interface OverlayPopUpProps {
    index: number;
    policeIndex: number | null;
    advisorIndex: number | null;
    thiefIndex: number | null;
    kingIndex: number | null;
    displayDuration?: number;
    contentType?: "default" | "textOnly";
    customMessage?: string | null;
  }
  