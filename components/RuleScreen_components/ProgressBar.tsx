import React from "react";
import { View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from "react-native-reanimated";

interface Props {
  progress: number;
}

export default function ProgressBar({ progress }: Props) {
  
  // Smoothly animate the width whenever progress props change
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress}%`, {
        damping: 15,
        stiffness: 90,
      }),
      // Optional: change color from indigo to emerald as they finish
      backgroundColor: interpolateColor(
        progress,
        [0, 100],
        ["#6366f1", "#10b981"]
      ),
    };
  });

  return (
    <View className="mb-10">
      {/* The Track (Glassy Base) */}
      <View className="h-3 w-full bg-white/[0.05] rounded-full border border-white/10 overflow-hidden">
        
        {/* The Fill (Glowing & Metamorphic) */}
        <Animated.View
          style={[animatedStyle]}
          className="h-full rounded-full shadow-lg shadow-indigo-500/50"
        >
          {/* Inner Highlight (The 'Fancy' Glass Shine) */}
          <View className="absolute top-0 left-0 right-0 h-[35%] bg-white/30 rounded-full mx-1 mt-[1px]" />
          
          {/* Subtle Pulse/Glow Overlay */}
          <View className="absolute inset-0 bg-indigo-400/20" />
        </Animated.View>

      </View>

      {/* Decorative Glow Orb behind the bar */}
      <View 
        className="absolute -z-10 h-2 w-full bg-indigo-500/20 blur-xl bottom-0" 
        style={{ width: `${progress}%` }} 
      />
    </View>
  );
}