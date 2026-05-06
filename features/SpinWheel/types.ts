
/* ================================
   Core Types
================================ */

import { SharedValue } from "react-native-reanimated";

export type SpinStatus = "IDLE" | "SPINNING" | "DONE";

export interface SpinSegment {
  label: string;
  value: number;
  color: string;
  bg: string;
  img: any; // You can later replace with ImageSourcePropType
}

/* ================================
   Component Props
================================ */

export interface SpinWheelViewProps {
 spinAnim: SharedValue<number>;
  segments: SpinSegment[];
}

interface SpinButtonProps {
  status: SpinStatus;
  onSpin: () => void;
  onClose: () => void;
}

interface VictoryOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

interface SpinHeaderProps {
  status: SpinStatus;
  result: SpinSegment | null;
}

export interface SpinResultProps {
  status: SpinStatus;
  result: SpinSegment | null;
  pulseAnim: SharedValue<number>;
}
