import { Animated } from "react-native";

/* ================================
   Core Types
================================ */

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
  spinAnim: Animated.Value;
  segments: any[];
}

export interface SpinButtonProps {
  status: SpinStatus;
  onSpin: () => void;
  onClose: () => void;
}

export interface VictoryOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export interface SpinHeaderProps {
  status: SpinStatus;
  result: SpinSegment | null;
}

export interface SpinResultProps {
  status: SpinStatus;
  result: SpinSegment | null;
  pulseAnim: Animated.Value;
}
