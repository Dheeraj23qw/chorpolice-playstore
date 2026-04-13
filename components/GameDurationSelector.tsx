import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

interface GameDurationSelectorProps {
  showRoundTable: boolean;
  setShowRoundTable: (value: boolean) => void;
  renderSelector: React.ReactNode;
}

const GameDurationSelector: React.FC<GameDurationSelectorProps> = ({
  showRoundTable,
  setShowRoundTable,
  renderSelector,
}) => {
  return (
    <View className="mb-6">
      <Pressable
        onPress={() => setShowRoundTable(!showRoundTable)}
        className="flex-row items-center justify-between rounded-3xl border border-white/10 bg-white/[0.08] p-5"
      >
        <View className="flex-row items-center">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
            <Ionicons name="timer-outline" size={20} color="#818cf8" />
          </View>
          <View>
            <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/40">
              Game Duration
            </Text>
            <Text className="font-main-bold text-base text-white">
              {showRoundTable ? "CLOSE SELECTOR" : "SELECT ROUNDS"}
            </Text>
          </View>
        </View>
        <Ionicons
          name={showRoundTable ? "chevron-up" : "chevron-down"}
          size={24}
          color="white"
        />
      </Pressable>

      {/* Logic Check: Using !! ensures the result is a boolean, not a stray string */}
      {!!showRoundTable && (
        <Animated.View entering={FadeIn.duration(400)} className="mt-4">
          {renderSelector}
        </Animated.View>
      )}
    </View>
  );
};

export default GameDurationSelector;
