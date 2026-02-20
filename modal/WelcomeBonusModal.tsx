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
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();

      // Crown floating loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isVisible]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Modal visible={isVisible} transparent statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/85 px-6">
        {/* Glow Background */}
        <View className="absolute h-72 w-72 rounded-full bg-indigo-600/20" />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="w-full max-w-sm overflow-hidden rounded-[48px] border border-white/10"
        >
          {/* Crown Section */}
          <Animated.View
            style={{ transform: [{ translateY: floatAnim }] }}
            className="relative mb-8"
          >
            <View className="absolute -inset-6 rounded-full bg-indigo-500/20 blur-xl" />
            <View className="rounded-full border border-white/10 bg-zinc-800/60 p-6">
              <FontAwesome5 name="crown" size={44} color="#818cf8" />
            </View>
          </Animated.View>

          {/* Title */}
          <View className="mb-6 items-center">
            <Text className="font-main-bold text-3xl tracking-tight text-white">
              CHOR POLICE
            </Text>
            <Text className="mt-1 text-sm tracking-widest text-indigo-400">
              WELCOME REWARD
            </Text>
          </View>

          {/* Points */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: pointsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ],
              opacity: pointsAnim,
            }}
            className="mb-10 flex-row items-end justify-center"
          >
            <Text className="font-main-bold text-6xl text-white">1,000</Text>
            <Text className="mb-2 ml-2 font-main-bold text-2xl text-indigo-400">
              pts
            </Text>
          </Animated.View>

          {/* Claim Button */}
          <Animated.View
            style={{ transform: [{ scale: buttonScale }] }}
            className="w-full"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClaim}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className="overflow-hidden rounded-2xl"
            >
              <Text className="font-main-bold text-lg tracking-widest text-white">
                CLAIM REWARD
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};
