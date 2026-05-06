import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface HeaderActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  onPress: () => void;
}

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  icon,
  label,
  iconColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-12 w-12"
    >
      <View
        className="absolute inset-0 rounded-full"
        style={{
          shadowColor: "#312e81",
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 6,
        }}
      />
      <View className="h-12 w-12 overflow-hidden rounded-full border border-white/10">
        <LinearGradient
          colors={["rgba(79,70,229,0.98)", "rgba(30,27,75,0.98)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
          style={{ borderRadius: 999 }}
        >
          <View className="absolute inset-0 rounded-full bg-white/5" />
          <View className="absolute inset-[3px] rounded-full border border-white/10" />
          <View className="absolute left-3 right-3 top-[3px] h-[1px] rounded-full bg-white/35" />
          <Ionicons name={icon} size={20} color={iconColor} />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

interface OfflineGameHeaderProps {
  onBack: () => void;
  onShowScores: () => void;
  onShowRules: () => void;
}

export const OfflineGameHeader: React.FC<OfflineGameHeaderProps> = ({
  onBack,
  onShowScores,
  onShowRules,
}) => {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <TouchableOpacity
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <View className="flex-1" />
      <View className="flex-row items-center">
        <HeaderActionButton
          icon="podium-outline"
          label="Scores"
          iconColor="#7dd3fc"
          onPress={onShowScores}
        />
        <View className="w-3" />
        <HeaderActionButton
          icon="book-outline"
          label="Rules"
          iconColor="#facc15"
          onPress={onShowRules}
        />
      </View>
    </View>
  );
};
