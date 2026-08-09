import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface OfflineSetupHeaderProps {
  isPlayerListOpen: boolean;
  onBack: () => void;
}

export const OfflineSetupHeader: React.FC<OfflineSetupHeaderProps> = ({
  isPlayerListOpen,
  onBack,
}) => {
  return (
    <View className="px-5 pt-2">
      <View className="flex-row items-center">
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={onBack}
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10"
        >
          <BlurView
            intensity={18}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        {!isPlayerListOpen ? (
          <View className="ml-4 flex-1">
            <Text
              style={{ fontSize: rf(2.35) }}
              className="font-main-bold text-white"
            >
              Pass & Play
            </Text>
          </View>
        ) : (
          <View className="flex-1" />
        )}
      </View>
    </View>
  );
};
