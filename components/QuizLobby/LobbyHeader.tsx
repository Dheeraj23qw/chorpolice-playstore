import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rf } from "@/utils/responsive";

export const LobbyHeader = ({ onBack }: { onBack: () => void }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 10 }} className="px-6 pb-4">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
      >
        <Ionicons name="chevron-back" size={rf(2.5)} color="white" />
      </Pressable>
    </View>
  );
};
