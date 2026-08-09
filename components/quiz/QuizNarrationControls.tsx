import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface QuizNarrationControlsProps {
  narrationEnabled: boolean;
  onToggleNarration: () => void;
  onReplayNarration: () => void;
  onOpenSettings: () => void;
  canReplay: boolean;
}

export const QuizNarrationControls = ({
  narrationEnabled,
  onToggleNarration,
  onReplayNarration,
  onOpenSettings,
  canReplay,
}: QuizNarrationControlsProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top + 10,
        right: 14,
        zIndex: 100,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Replay Button (Only visible if enabled and canReplay) */}
      {narrationEnabled && canReplay && (
        <Pressable
          onPress={onReplayNarration}
          className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 active:scale-90"
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#818cf8"
          />
        </Pressable>
      )}

      {/* Settings Gear */}
      <Pressable
        onPress={onOpenSettings}
        className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 active:scale-90"
      >
        <Ionicons
          name="settings-outline"
          size={18}
          color="#818cf8"
        />
      </Pressable>

      {/* Main Toggle Button */}
      <Pressable
        onPress={onToggleNarration}
        className="overflow-hidden rounded-full active:scale-95"
      >
        <BlurView
          intensity={30}
          tint="light"
          className="h-[42px] w-[42px] border border-white/20 bg-white/10"
        >
          <View className="flex-1 items-center justify-center">
            <Ionicons
              name={
                narrationEnabled
                  ? "volume-high-outline"
                  : "volume-mute-outline"
              }
              size={22}
              color={narrationEnabled ? "#818cf8" : "#94a3b8"}
            />
          </View>
        </BlurView>
      </Pressable>
    </View>
  );
};
