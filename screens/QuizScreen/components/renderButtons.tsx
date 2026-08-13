import React, { memo, useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import { BlurView } from "expo-blur";

interface ActionButtonsProps {
  onReportBugPress?: () => void;
  onEarnPress?: () => void;
  onRatePress?: () => void;
  onSharePress?: () => void;
  onHomePress: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = memo(
  ({
    onReportBugPress,
    onEarnPress,
    onRatePress,
    onSharePress,
    onHomePress,
  }) => {
    return (
      <View className="mt-8 w-full flex-row justify-between px-4">
        {onReportBugPress && (
          <CustomButton
            onPress={onReportBugPress}
            label="Report"
            icon="bug"
            colors={["#ef4444", "#b91c1c"]}
          />
        )}
        {onEarnPress && (
          <CustomButton
            onPress={onEarnPress}
            label="Earn"
            icon="sparkles"
            colors={["#10b981", "#047857"]}
          />
        )}
        {onSharePress ? (
          <CustomButton
            onPress={onSharePress}
            label="Share"
            icon="share"
            colors={["#6366f1", "#4338ca"]}
          />
        ) : onRatePress ? (
          <CustomButton
            onPress={onRatePress}
            label="Rate Us"
            icon="star"
            colors={["#fbbf24", "#b45309"]}
          />
        ) : null}
        <CustomButton
          onPress={onHomePress}
          label="Home"
          icon="grid"
          colors={["#f59e0b", "#b45309"]}
        />
      </View>
    );
  },
);

ActionButtons.displayName = "ActionButtons";

interface CustomButtonProps {
  onPress: () => void;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  label,
  icon,
  colors,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // Standard StyleSheet transform instead of Reanimated-backed NativeWind classes
      style={[styles.buttonBase, isPressed && styles.buttonActive]}
      className="mx-1.5 flex-1"
    >
      <BlurView
        intensity={25}
        tint="dark"
        style={{ flex: 1 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-black/20"
      >
        <View className="flex-1 items-center justify-center">
          <View className="mb-1">
            <Ionicons name={icon} size={rf(2.8)} color={colors[0]} />
          </View>

          <Text
            style={{ fontSize: rf(1.4) }}
            className="font-main-bold uppercase tracking-widest text-white"
          >
            {label}
          </Text>

          <View
            style={{ backgroundColor: colors[0] }}
            className="mt-1 h-1 w-4 rounded-full opacity-60"
          />
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    height: hp(10),
  },
  buttonActive: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
});
