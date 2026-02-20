import React, { useEffect, useRef } from "react";
import { Modal, View, TouchableOpacity, Animated, Easing } from "react-native";
import { Text } from "@/components/Text";
import { FontAwesome5 } from "@expo/vector-icons";

interface WelcomeProps {
  isVisible: boolean;
  onClaim: () => void;
}

export const WelcomeBonusModal: React.FC<WelcomeProps> = ({
  isVisible,
  onClaim,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (isVisible) {
      // Bounce Entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Floating Crown
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -12,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Infinite "Shine" flash across the button
      Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 400,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        {/* Outer Neon Glow */}
        <View className="absolute h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm"
        >
          {/* THE GLASS CARD */}
          <View
            style={{ backgroundColor: "rgba(24, 24, 27, 0.8)" }} // Deep Zinc with alpha
            className="overflow-hidden rounded-[40px] border border-white/20 p-1 shadow-2xl"
          >
            <View className="items-center rounded-[36px] bg-zinc-900/50 p-8">
              {/* Floating Game Icon */}
              <Animated.View
                style={{ transform: [{ translateY: floatAnim }] }}
                className="mb-4"
              >
                <View className="h-24 w-24 items-center justify-center rounded-3xl border-2 border-indigo-400/50 bg-indigo-500/10 shadow-lg">
                  <FontAwesome5 name="gem" size={48} color="#6366f1" />
                </View>
              </Animated.View>

              {/* Header Text */}
              <Text className="font-main-bold text-4xl tracking-tighter text-white">
                LEVEL UP!
              </Text>

              {/* Reward Amount with Glassy Background */}
              <View className="my-8 w-full items-center rounded-2xl border border-white/10 bg-white/5 py-4">
                <Text className="font-main-bold text-6xl tracking-tight text-white">
                  1,000
                </Text>
                <Text className="font-main-bold text-lg uppercase text-indigo-500">
                  Bonus Points
                </Text>
              </View>

              {/* THE ARCADE BUTTON */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onClaim}
                className="w-full overflow-hidden rounded-2xl border-b-4 border-indigo-800 bg-indigo-500 shadow-xl"
              >
                {/* Animated Shine Effect */}
                <Animated.View
                  style={{ transform: [{ translateX: shineAnim }] }}
                  className="absolute h-full w-20 -skew-x-12 bg-white/20"
                />

                <View className="items-center py-4">
                  <Text className="font-main-bold text-xl tracking-widest text-white">
                    COLLECT NOW
                  </Text>
                </View>
              </TouchableOpacity>

              <Text className="mt-4 font-main-bold text-[10px] uppercase tracking-widest text-zinc-500">
                Tap to claim
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
