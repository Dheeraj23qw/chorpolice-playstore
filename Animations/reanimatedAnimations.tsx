import { useEffect } from "react";
import {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/* ======================================================
   INTERNAL SPRING PRESETS (Consistency + Performance)
====================================================== */

const SOFT_SPRING = { damping: 14, stiffness: 180 };
const FAST_SPRING = { damping: 18, stiffness: 240 };
const BOUNCY_SPRING = { damping: 10, stiffness: 220 };

/* ======================================================
   PULSATING (Avatar / CTA)
====================================================== */

export const usePulsating = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 450 }),
        withTiming(1, { duration: 450 })
      ),
      -1,
      true
    );

    return () => cancelAnimation(scale);
  }, [scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
};

/* ======================================================
   ROTATION (Loading / Spinner)
====================================================== */

export const useRotation = () => {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 1200 }),
      -1,
      false
    );

    return () => cancelAnimation(rotate);
  }, [rotate]);

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
};

/* ======================================================
   FLOATING (Rewards / Coins)
====================================================== */

export const useFloating = (range = 10, duration = 1000) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-range, { duration }),
        withTiming(0, { duration })
      ),
      -1,
      true
    );

    return () => cancelAnimation(translateY);
  }, [translateY, range, duration]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
};

/* ======================================================
   FADE LOOP (Hints / Tips)
====================================================== */

export const useFading = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      true
    );

    return () => cancelAnimation(opacity);
  }, [opacity]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
};

/* ======================================================
   PRESS SCALE (Buttons / Cards)
====================================================== */

export const usePressScale = (onPress?: () => void) => {
  const scale = useSharedValue(1);

  const pressIn = () => {
    scale.value = withSpring(0.95, FAST_SPRING);
  };

  const pressOut = () => {
    scale.value = withSpring(1, SOFT_SPRING);
    onPress?.();
  };

  return {
    pressIn,
    pressOut,
    style: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    })),
  };
};

/* ======================================================
   CARD BOUNCE (Tap Feedback)
====================================================== */

export const useCardBounce = () => {
  const scale = useSharedValue(1);

  const bounce = () => {
    scale.value = withSequence(
      withSpring(1.15, BOUNCY_SPRING),
      withSpring(1, SOFT_SPRING)
    );
  };

  return {
    bounce,
    style: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    })),
  };
};

/* ======================================================
   FLIP + BOUNCE (Game Card)
====================================================== */

export const useFlipAndBounce = () => {
  const flip = useSharedValue(0);
  const scale = useSharedValue(1);

  const start = () => {
    flip.value = 0;

    flip.value = withTiming(1, { duration: 550 });

    scale.value = withSequence(
      withSpring(1.12, FAST_SPRING),
      withSpring(1, SOFT_SPRING)
    );
  };

  return {
    start,
    style: useAnimatedStyle(() => {
      const rotateY = `${interpolate(flip.value, [0, 1], [0, 180])}deg`;

      return {
        transform: [
          { perspective: 1000 }, // fixes Android distortion
          { rotateY },
          { scale: scale.value },
        ],
      };
    }),
  };
};

/* ======================================================
   SHAKE (Wrong Answer / Error)
====================================================== */

export const useShake = () => {
  const x = useSharedValue(0);

  const shake = () => {
    x.value = withSequence(
      withTiming(12, { duration: 40 }),
      withTiming(-12, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  return {
    shake,
    style: useAnimatedStyle(() => ({
      transform: [{ translateX: x.value }],
    })),
  };
};

/* ======================================================
   HEART BEAT (CTA Pulse)
====================================================== */

export const useHeartBeat = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.12, FAST_SPRING),
        withSpring(1, SOFT_SPRING)
      ),
      -1,
      true
    );

    return () => cancelAnimation(scale);
  }, [scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
};

/* ======================================================
   POP IN (Modal / Tooltip)
====================================================== */

export const usePopIn = () => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const start = () => {
    scale.value = withSpring(1, SOFT_SPRING);
    opacity.value = withTiming(1, { duration: 180 });
  };

  return {
    start,
    style: useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    })),
  };
};
