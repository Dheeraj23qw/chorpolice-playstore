import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/Text";
import { MotiView } from "moti";

interface TogglePillProps {
  selected: boolean;
  label: string;
  onPress: () => void;
}

const TogglePill: React.FC<TogglePillProps> = ({
  selected,
  label,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} className="flex-1">
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.96 : 1,
          }}
          transition={{ type: "timing", duration: 120 }}
          className="relative items-center justify-center py-3"
        >
          {/* ✨ subtle glow when active */}
          {selected && (
            <View className="absolute inset-0 rounded-xl bg-indigo-400/10 blur-md" />
          )}

          <Text
            className={`text-center font-main-bold uppercase tracking-[2px] ${
              selected ? "text-white" : "text-white/40"
            }`}
          >
            {label}
          </Text>
        </MotiView>
      )}
    </Pressable>
  );
};

export default TogglePill;
