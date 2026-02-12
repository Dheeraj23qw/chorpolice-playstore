import React, { memo } from "react";
import { Pressable, View } from "react-native";
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
    // Replaced hp(4) with NativeWind mt-8 and wp(4) with px-4
    <View className="flex-row justify-between mt-8 px-4 w-full">
      
      <CustomButton 
        onPress={onStatsPress}
        label="Stats"
        icon="stats-chart"
        colors={['#6366f1', '#4338ca']} // Indigo
      />

      <CustomButton 
        onPress={onEarnPress}
        label="Earn"
        icon="sparkles"
        colors={['#10b981', '#047857']} // Emerald
      />

      <CustomButton 
        onPress={onHomePress}
        label="Home"
        icon="grid"
        colors={['#f59e0b', '#b45309']} // Amber
      />

    </View>
  );
});

/* ======================================================
    New Minimalist Glass-UI Button
====================================================== */
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
}) => (
  <Pressable
    onPress={onPress}
    style={{ height: hp(10) }}
    className="flex-1 mx-1.5 active:scale-90 transition-all duration-200"
  >
    <BlurView
      intensity={25}
      tint="dark"
      className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/20"
    >
      <View className="flex-1 items-center justify-center">
        
        {/* Glowing Background Accent */}
        <LinearGradient
          colors={[colors[0] + '40', 'transparent']}
          className="absolute inset-0 opacity-40"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Minimal Icon */}
        <View className="mb-1">
          <Ionicons name={icon} size={rf(2.8)} color={colors[0]} />
        </View>

        {/* Label with dynamic color shadow */}
        <Text
          style={{ fontSize: rf(1.4) }}
          className="text-white font-main-bold tracking-widest uppercase"
        >
          {label}
        </Text>

        {/* Bottom indicator dot */}
        <View 
          style={{ backgroundColor: colors[0] }} 
          className="h-1 w-4 rounded-full mt-1 opacity-60" 
        />
        
      </View>
    </BlurView>
  </Pressable>
);