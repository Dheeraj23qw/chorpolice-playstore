import React, { useEffect } from "react";
import { Modal, View, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  ZoomIn,
} from "react-native-reanimated";
import { Text } from "@/components/Text";

interface Props {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onRate: () => void;
  onDisable: () => void;
}

export const LowCoinModal = ({
  visible,
  onClose,
  onShare,
  onRate,
  onDisable,
}: Props) => {
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-12, {
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(floatY);
      floatY.value = 0;
    }
  }, [floatY, visible]);

  const thiefStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* THE GLASS SHELL */}
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="w-full max-w-sm overflow-hidden rounded-[55px] border border-white/20"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
        >
          {/* FROSTED TEXTURE */}
          <BlurView intensity={90} tint="dark" className="items-center p-10">
            {/* SUBTLE LIGHT REFLECTION */}
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "transparent"]}
              className="absolute inset-0"
            />

            {/* MINIMALIST CLOSE */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-6 top-6 h-10 w-10 items-center justify-center rounded-full border border-white/10"
            >
              <Ionicons
                name="close-outline"
                size={22}
                color="rgba(255,255,255,0.4)"
              />
            </TouchableOpacity>

            {/* FLOATING THIEF */}
            <Animated.View style={thiefStyle} className="mb-6 mt-2">
              <Image
                source={require("@/assets/images/chorsipahi/thief.png")}
                className="h-28 w-28 opacity-90"
                resizeMode="contain"
              />
            </Animated.View>

            <Text className="font-main-bold text-3xl tracking-tight text-white/90">
              LOW COINS
            </Text>

            <Text className="mt-1 font-main-md text-[9px] uppercase tracking-[6px] text-white/40">
              Chor Police Bag
            </Text>

            {/* BUTTONS (FROSTED TYPE) */}
            <View className="mt-10 w-full gap-4">
              {/* PRIMARY FROSTED BUTTON */}
              <TouchableOpacity onPress={onShare} activeOpacity={0.8}>
                <View className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 py-5">
                  <Text className="text-center font-main-bold text-lg text-white/90">
                    SHARE FOR COINS
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SECONDARY TRANSPARENT BUTTON */}
              <TouchableOpacity onPress={onRate} activeOpacity={0.8}>
                <View className="rounded-3xl border border-white/5 bg-transparent py-5">
                  <Text className="text-center font-main-bold text-lg text-white/40">
                    ⭐ RATE & EARN
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* FLAT MINIMAL FOOTER */}
            <View className="mt-10 w-full flex-row items-center justify-between border-t border-white/5 px-2 pt-8">
              <TouchableOpacity onPress={onClose}>
                <Text className="font-main-md text-[9px] uppercase tracking-[2px] text-white/20">
                  Later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onDisable}>
                <Text className="font-main-md text-[9px] uppercase tracking-[2px] text-indigo-400/40">
                  Don't show again
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};
