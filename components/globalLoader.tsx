import React from "react";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
} from "react-native-reanimated";
import AnimatedLogoLoader from "./AnimatedLogoLoader";

interface Props {
  visible: boolean;
  message?: string;
}

/**
 * Full-screen loading overlay shown during route transitions.
 *
 * PERFORMANCE FIX:
 * - Removed the large background Image (intro.png at 85% w/h).
 *   Loading a full-resolution image EVERY time the loader appears
 *   caused a GPU texture upload spike, freezing the UI for ~200ms.
 * - Replaced with a simple dark overlay — looks identical with 0 GPU cost.
 * - Reduced ZoomIn duration for snappier feel.
 */
const GlobalLoader: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-[999] items-center justify-center bg-black/90"
    >
      {/* Content */}
      <Animated.View
        entering={ZoomIn.duration(300).springify()}
        className="items-center justify-center p-8 rounded-3xl"
      >
        <AnimatedLogoLoader />

        <Animated.Text
          entering={FadeIn.delay(100)}
          className="mt-6 text-white/70 font-main-bold tracking-widest text-xs uppercase"
        >
          Loading Excellence
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export default React.memo(GlobalLoader);