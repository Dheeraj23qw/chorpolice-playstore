import { hp, wp } from "@/utils/responsive";
import { CardDealPreset } from "@/redux/reducers/sessionSlice";
import { DEALING_SPIN_MS } from "./constants";

/** 📦 Card Start: Neutral center position for Classic/Tornado */
export const getNeutralCenterStart = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;
  return {
    translateX: isLeft ? wp(23) : -wp(23),
    translateY: isTop ? hp(12) : -hp(12),
    rotate: "0deg",
    scale: 1,
    opacity: 0,
  };
};

/** 🌀 Classic/Tornado Shuffle: Move and Spin */
export const getClassicShuffle = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;
  return {
    translateX: isLeft ? wp(23) : -wp(23),
    translateY: isTop ? hp(12) : -hp(12),
    rotate: "1440deg", // Increased for "crazy" feel
    scale: 1,
    opacity: 1,
  };
};

export const getTornadoShuffle = (index: number) => {
  const isLeft = index % 2 === 0;
  const isTop = index < 2;
  return {
    translateX: (isLeft ? wp(23) : -wp(23)) + (index % 2 === 0 ? 15 : -15), // More jitter
    translateY: (isTop ? hp(12) : -hp(12)) + (index < 2 ? 15 : -15),
    rotate: "2160deg", // 6 full spins
    scale: 0.95,
    opacity: 1,
  };
};

/** 🌊 Wave: Start far off-screen */
export const getWaveStart = (index: number) => {
  const startPos = [
    { x: -wp(100), y: 0 }, { x: wp(100), y: 0 }, { x: 0, y: -hp(50) }, { x: 0, y: hp(50) },
  ][index];
  return { translateX: startPos.x, translateY: startPos.y, rotate: "90deg", scale: 0.8, opacity: 0 };
};

export const getWaveShuffle = () => ({
  translateX: 0,
  translateY: 0,
  rotate: "720deg",
  scale: 1,
  opacity: 1,
});

/** 🛰️ Orbit: Circular placement start */
export const getOrbitStart = (index: number) => {
  const angle = (index * Math.PI) / 2;
  const radius = wp(60); 
  return { translateX: Math.cos(angle) * radius, translateY: Math.sin(angle) * radius, rotate: `${index * 90}deg`, scale: 0.5, opacity: 0 };
};

export const getOrbitShuffle = (index: number) => {
  const angle = (index * Math.PI) / 2;
  const radius = wp(15);
  return { translateX: Math.cos(angle) * radius, translateY: Math.sin(angle) * radius, rotate: `${index * 180 + 1440}deg`, scale: 1, opacity: 1 };
};

/** 💥 Pop Burst: Start tiny at center */
export const getPopBurstStart = (index: number) => ({
  translateX: 0,
  translateY: 0,
  rotate: "0deg",
  scale: 0.01,
  opacity: 0,
});

export const getPopBurstShuffle = (index: number) => ({
  translateX: index % 2 === 0 ? 20 : -20,
  translateY: index < 2 ? 20 : -20,
  rotate: `${(index - 1.5) * 40 + 1080}deg`,
  scale: 1.15,
  opacity: 1,
});

export const getCardStartStyle = (preset: CardDealPreset, index: number) => {
  switch (preset) {
    case "classicSpin":
    case "tornadoDeal":
      return getNeutralCenterStart(index);
    case "waveDeal":
      return getWaveStart(index);
    case "orbitDeal":
      return getOrbitStart(index);
    case "popBurstDeal":
      return getPopBurstStart(index);
    default:
      return getNeutralCenterStart(index);
  }
};

export const getCardShuffleStyle = (preset: CardDealPreset, index: number) => {
  switch (preset) {
    case "classicSpin":
      return getClassicShuffle(index);
    case "tornadoDeal":
      return getTornadoShuffle(index);
    case "waveDeal":
      return getWaveShuffle();
    case "orbitDeal":
      return getOrbitShuffle(index);
    case "popBurstDeal":
      return getPopBurstShuffle(index);
    default:
      return getClassicShuffle(index);
  }
};

export const getCardDealTransition = (preset: CardDealPreset, index: number) => {
  if (preset === "waveDeal") {
    return {
      type: "timing" as const,
      duration: DEALING_SPIN_MS,
      delay: index * 150,
    };
  }
  if (preset === "popBurstDeal") {
    return {
      type: "spring" as const,
      damping: 10,
      stiffness: 90,
      delay: index * 100,
    };
  }
  return {
    type: "timing" as const,
    duration: DEALING_SPIN_MS,
  };
};

export const getOfflineRevealPlacement = (index: number, role: string) => {
  const isTopRow = index < 2;
  const isLeftCol = index % 2 === 0;

  if (role === "King") return { translateX: isLeftCol ? wp(24.5) : -wp(24.5), translateY: isTopRow ? hp(15) : -hp(15), rotate: "0deg", scale: 1.25 };
  if (role === "Police") return { translateX: isLeftCol ? wp(24.5) : -wp(24.5), translateY: isTopRow ? hp(15) : -hp(15), rotate: "0deg", scale: 1.25 };
  return { translateX: 0, translateY: 0, rotate: "0deg", scale: 1 };
};
