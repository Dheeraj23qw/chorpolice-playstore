import { SpinSegment } from "@/features/SpinWheel/types";

export const segments: SpinSegment[] = [
  {
    label: "RAJA",
    value: 1000,
    color: "#fbbf24",
    bg: "#78350f",
    img: require("@/assets/images/chorsipahi/king.webp"),
  },
  {
    label: "MANTRI",
    value: 800,
    color: "#818cf8",
    bg: "#1e1b4b",
    img: require("@/assets/images/chorsipahi/advisor.webp"),
  },
  {
    label: "CHOR",
    value: -500,
    color: "#ef4444",
    bg: "#450a0a",
    img: require("@/assets/images/chorsipahi/thief.webp"),
  },
  {
    label: "SIPAHI",
    value: 500,
    color: "#10b981",
    bg: "#064e3b",
    img: require("@/assets/images/chorsipahi/police.webp"),
  },
];
export const SPIN_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
