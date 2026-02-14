import React, { memo, useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface ActionButtonsProps {
  onStatsPress: () => void;
  onEarnPress: () => void;
  onHomePress: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  onStatsPress,
  onEarnPress,
  onHomePress,
}) => {
  return (
    <View className="flex-row justify-between mt-8 px-4 w-full">
      <CustomButton 
        onPress={onStatsPress}
        label="Stats"
        icon="stats-chart"
        colors={['#6366f1', '#4338ca']} 
      />
      <CustomButton 
        onPress={onEarnPress}
        label="Earn"
        icon="sparkles"
        colors={['#10b981', '#047857']} 
      />
      <CustomButton 
        onPress={onHomePress}
        label="Home"
        icon="grid"
        colors={['#f59e0b', '#b45309']} 
      />
    </View>
  );
});

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
      style={[
        styles.buttonBase, 
        isPressed && styles.buttonActive
      ]}
      className="flex-1 mx-1.5"
    >
      <BlurView
        intensity={25}
        tint="dark"
        className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/20"
      >
        <View className="flex-1 items-center justify-center">
          
          <LinearGradient
            colors={[colors[0] + '40', 'transparent']}
            className="absolute inset-0 opacity-40"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View className="mb-1">
            <Ionicons name={icon} size={rf(2.8)} color={colors[0]} />
          </View>

          <Text
            style={{ fontSize: rf(1.4) }}
            className="text-white font-main-bold tracking-widest uppercase"
          >
            {label}
          </Text>

          <View 
            style={{ backgroundColor: colors[0] }} 
            className="h-1 w-4 rounded-full mt-1 opacity-60" 
          />
          
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    height: hp(10),
    // Standard JS-based transition (Not Reanimated)
  },
  buttonActive: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  }
});