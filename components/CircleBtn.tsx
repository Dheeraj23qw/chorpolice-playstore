import React, { memo } from "react";
import { Pressable } from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

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
  return (
    <Pressable
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={{ marginLeft: marginBetween }}
    >
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.9 : 1,
            opacity: pressed ? 0.85 : 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 250,
          }}
          style={{
            backgroundColor,
            width: btnDim,
            height: btnDim,
            borderRadius: btnDim / 2,
            alignItems: "center",
            justifyContent: "center",

            // 🔥 subtle depth
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",

            // 🔥 shadow (important for premium feel)
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          {children}
        </MotiView>
      )}
    </Pressable>
  );
});

CircleBtn.displayName = "CircleBtn";
