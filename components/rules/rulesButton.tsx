import React from "react";
import { Pressable, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

// Utils
import { rf, hp, wp } from "@/utils/responsive";

interface RulesButtonProps {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RulesButton: React.FC<RulesButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Snappy spring for that "fast" modern feel
  const springConfig = { damping: 12, stiffness: 200 };

  return (
    <View className="mt-2">
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.94, springConfig))}
        onPressOut={() => (scale.value = withSpring(1, springConfig))}
        style={[animatedStyle]}
        className="overflow-hidden rounded-[24px] border border-white/10"
      >
        {/* Glass Base Layer */}
        <View 
          style={{ height: hp(7.5) }}
          className="w-full flex-row items-center justify-between px-6 bg-white/5"
        >
          {/* Internal Glow/Sheen */}
          <View className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent" />
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center mr-3 border border-indigo-500/30">
               <Ionicons name="book-outline" size={rf(1.8)} color="#818cf8" />
            </View>
            <View>
              <Text 
                style={{ fontSize: rf(1.8) }} 
                className="text-white font-black uppercase tracking-[2px]"
              >
                Game Rules
              </Text>
              <Text 
                style={{ fontSize: rf(1.1) }} 
                className="text-white/40 font-bold uppercase"
              >
                Learn how to play
              </Text>
            </View>
          </View>

          {/* Minimalist indicator */}
          <View className="flex-row items-center bg-white/10 px-3 py-1 rounded-full border border-white/5">
            <Text style={{ fontSize: rf(1.1) }} className="text-white/70 font-bold mr-1">
              VIEW
            </Text>
            <Ionicons name="chevron-forward" size={rf(1.4)} color="rgba(255,255,255,0.5)" />
          </View>
        </View>

        {/* Top edge highlight for depth */}
        <View className="absolute top-0 left-4 right-4 h-[1px] bg-white/20" />
      </AnimatedPressable>
    </View>
  );
};

export default React.memo(RulesButton);