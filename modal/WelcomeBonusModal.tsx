import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Text } from "@/components/Text";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
        ])
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
      <View className="flex-1 bg-black/85 justify-center items-center px-6">

        {/* Glow Background */}
        <View className="absolute w-72 h-72 bg-indigo-600/20 rounded-full" />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="w-full max-w-sm overflow-hidden rounded-[48px] border border-white/10"
        >
          <LinearGradient
            colors={["#111827", "#09090b"]}
            className="p-8 items-center"
          >
            {/* Crown Section */}
            <Animated.View
              style={{ transform: [{ translateY: floatAnim }] }}
              className="relative mb-8"
            >
              <View className="absolute -inset-6 bg-indigo-500/20 rounded-full blur-xl" />
              <View className="bg-zinc-800/60 border border-white/10 p-6 rounded-full">
                <FontAwesome5 name="crown" size={44} color="#818cf8" />
              </View>
            </Animated.View>

            {/* Title */}
            <View className="items-center mb-6">
              <Text className="text-white text-3xl font-main-bold tracking-tight">
                CHOR POLICE
              </Text>
              <Text className="text-indigo-400 text-sm mt-1 tracking-widest">
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
              className="flex-row items-end justify-center mb-10"
            >
              <Text className="text-white text-6xl font-main-bold">
                1,000
              </Text>
              <Text className="text-indigo-400 text-2xl font-main-bold ml-2 mb-2">
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
                <LinearGradient
                  colors={["#6366f1", "#4f46e5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 items-center"
                >
                  <Text className="text-white font-main-bold text-lg tracking-widest">
                    CLAIM REWARD
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};
