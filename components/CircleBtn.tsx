import React, { memo, useCallback } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type CircleBtnProps = {
  children: React.ReactNode;
  onPress?: () => void;
  btnDim: number;
  marginBetween: number;
  backgroundColor: string;
};

export const CircleBtn = memo(function CircleBtn({
  children,
  onPress,
  btnDim,
  marginBetween,
  backgroundColor,
}: CircleBtnProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => (scale.value = withSpring(0.85)), [scale]);
  const handlePressOut = useCallback(() => (scale.value = withSpring(1)), [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginLeft: marginBetween }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor,
            width: btnDim,
            height: btnDim,
            borderRadius: btnDim / 2,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
});

CircleBtn.displayName = "CircleBtn";