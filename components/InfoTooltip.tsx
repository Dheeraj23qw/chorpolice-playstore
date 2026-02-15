import React, { useState } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Info } from "lucide-react-native";
import { Text } from "@/components/Text";

interface Props {
  text: string;
  containerClassName?: string;
}

export default function InfoTooltip({ text, containerClassName }: Props) {
  const [visible, setVisible] = useState(false);
  const progress = useSharedValue(0);

  const toggle = () => {
    if (visible) {
      progress.value = withTiming(0, { duration: 200 });
      setTimeout(() => setVisible(false), 200);
    } else {
      setVisible(true);
      progress.value = withSpring(1, {
        damping: 12,      // less damping (more smooth)
        stiffness: 120,   // controlled bounce
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: (1 - progress.value) * -20, // smooth vertical slide
        },
        {
          scale: 0.95 + progress.value * 0.05, // subtle premium scale
        },
      ],
    };
  });

  return (
    <View className={`items-end ${containerClassName || ""}`}>
      {/* Info Button */}
      <Pressable onPress={toggle}>
        <View className="bg-black p-2.5 rounded-full border border-white/20">
          <Info size={28} color="#fff" />
        </View>
      </Pressable>

      {/* Tooltip */}
      {visible && (
        <Animated.View
          style={animatedStyle}
          className="mt-3 w-72"
        >
          <BlurView
            intensity={60}
            tint="dark"
            className="rounded-2xl border border-black overflow-hidden"
          >
            <View className="px-5 py-4 bg-black">
              <Text className="text-white text-[15px] leading-6 tracking-wide">
                {text}
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}
