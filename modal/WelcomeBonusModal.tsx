import React, { useEffect } from "react";
import { Modal, View, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  ZoomIn,
  withDelay,
} from "react-native-reanimated";
import { Text } from "@/components/Text";

interface WelcomeProps {
  isVisible: boolean;
  onClaim: () => void;
}

export const WelcomeBonusModal: React.FC<WelcomeProps> = ({
  isVisible,
  onClaim,
}) => {
  const floatY = useSharedValue(0);
  const shimmerX = useSharedValue(-200);

  useEffect(() => {
    if (isVisible) {
      // Floating Thief
      floatY.value = withRepeat(
        withSequence(
          withTiming(-15, {
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );

      // Glass Shimmer
      shimmerX.value = withRepeat(
        withDelay(
          500,
          withTiming(400, { duration: 2000, easing: Easing.linear }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(floatY);
      cancelAnimation(shimmerX);
      floatY.value = 0;
      shimmerX.value = -200;
    }
  }, [floatY, isVisible, shimmerX]);

  const thiefStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      {/* REMOVED BLACK BACKGROUND: 
          The flex-1 container is now completely transparent. 
      */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={ZoomIn.springify().damping(15)}
          className="w-full max-w-sm overflow-hidden rounded-[50px] border border-white/40 shadow-2xl"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          {/* HIGH INTENSITY BLUR: This makes the game screen behind it look like frosted glass */}
          <BlurView intensity={95} tint="dark" className="items-center p-10">
            {/* FLOATING THIEF */}
            <Animated.View style={thiefStyle} className="mb-4">
              <Image
                source={require("@/assets/images/chorsipahi/thief.png")}
                className="h-32 w-32"
                resizeMode="contain"
              />
            </Animated.View>

            <Text className="font-main-bold text-4xl tracking-tighter text-white">
              BIG WIN!
            </Text>

            {/* COIN BOX */}
            <View className="my-8 w-full items-center rounded-[30px] border border-white/10 bg-white/5 py-6">
              <Text className="font-main-bold text-6xl text-yellow-400">
                10000
              </Text>
              <Text className="mt-1 font-main-bold text-sm tracking-[6px] text-white/70">
                COINS
              </Text>
            </View>

            {/* CRYSTAL BUTTON */}
            <TouchableOpacity
              onPress={onClaim}
              activeOpacity={0.9}
              className="w-full"
            >
              <View className="overflow-hidden rounded-2xl border-t border-white/30 shadow-xl">
                <BlurView intensity={40} tint="light">
                  <LinearGradient
                    colors={[
                      "rgba(99, 102, 241, 0.7)",
                      "rgba(67, 56, 202, 0.7)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="items-center py-5"
                  >
                    <Text className="font-main-bold text-xl tracking-[2px] text-white">
                      ADD TO BAG
                    </Text>
                  </LinearGradient>
                </BlurView>
              </View>
            </TouchableOpacity>

            <Text className="mt-6 font-main-md text-[9px] uppercase tracking-[4px] text-white/20">
              TAP TO CONTINUE
            </Text>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};
