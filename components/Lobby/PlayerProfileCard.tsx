import React, { useState } from "react";
import { View, Pressable, TextInput, Image, Modal } from "react-native";
import Animated, {
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { CollapsibleCard } from "../CollapsibleCard";
import { DIFFICULTY_OPTIONS } from "@/constants/difficultyConfig";
import RoundSelector from "@/screens/RoundSelector";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PlayerProfileCard = ({
  lobby,
  getAvatarSource,
  onSettingsToggle,
}: any) => {
  const [activeTab, setActiveTab] = useState<"settings" | null>(null);
  const scale = useSharedValue(1);

  /* ---------------- AVATAR ANIMATION ---------------- */
  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    scale.value = withSequence(
      withSpring(0.92, { damping: 12 }),
      withSpring(1.08, { damping: 10 }),
      withSpring(1, { damping: 14 }),
    );

    lobby.setShowAvatarGrid(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <Animated.View
        entering={FadeInUp.duration(500)}
        layout={Layout.springify()}
        className="mb-6 overflow-hidden rounded-[36px]"
      >
        {/* 🌈 OUTER GLOW LAYER */}
        <View className="absolute inset-0 rounded-[36px] bg-indigo-500/20 blur-3xl" />

        {/* 🌫 GLASS CORE */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.08)",
            "rgba(255,255,255,0.03)",
            "rgba(0,0,0,0.2)",
          ]}
          className="rounded-[36px] border border-white/10 p-6"
        >
          {/* ✨ TOP LIGHT REFLECTION */}
          <View className="absolute top-0 h-[1px] w-[70%] self-center bg-white/30" />

          {/* ---------------- HEADER ---------------- */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[10px] uppercase tracking-[3px] text-indigo-300">
                Identity Profile
              </Text>

              <TextInput
                value={lobby.userName}
                onChangeText={lobby.handleNameChange}
                placeholder="Enter Name..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                className="mt-2 font-main-bold text-3xl text-white"
              />

              <Text className="mt-1 text-[10px] uppercase tracking-[2px] text-white/30">
                Tap avatar to change
              </Text>
            </View>

            <AnimatedPressable
              onPress={handleAvatarPress}
              style={animatedStyle}
              className="relative"
            >
              {/* outer frame (simple border only) */}
              <View className="h-24 w-24 rounded-full border border-white/20 p-[2px]">
                {/* image container */}
                <View className="h-full w-full overflow-hidden rounded-full bg-black">
                  <Image
                    source={getAvatarSource(lobby.selectedImages[0] || 1)}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* camera badge */}
              <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-indigo-500">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </AnimatedPressable>
          </View>

          {/* ---------------- SETTINGS ---------------- */}
          <CollapsibleCard
            label="Game Configuration"
            title={
              lobby.gameType === "QUIZ"
                ? `LEVEL: ${lobby.difficulty || "SELECT"}`
                : "SELECT ROUNDS"
            }
            icon={
              lobby.gameType === "QUIZ"
                ? "speedometer-outline"
                : "timer-outline"
            }
            isOpen={activeTab === "settings"}
            onToggle={() => {
              const next = activeTab === "settings" ? null : "settings";
              setActiveTab(next);
              onSettingsToggle?.(next === "settings");
            }}
          >
            {lobby.gameType === "QUIZ" ? (
              <View className="rounded-2xl border border-white/10 bg-white/5 p-2">
                <View className="flex-row gap-2">
                  {DIFFICULTY_OPTIONS.map((opt: any) => {
                    const isSelected = lobby.difficulty === opt;

                    return (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          lobby.handleDifficultyChange(opt);

                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                        }}
                        className="flex-1"
                      >
                        <LinearGradient
                          colors={
                            isSelected
                              ? ["#6366F1", "#8B5CF6"]
                              : ["transparent", "transparent"]
                          }
                          className="items-center rounded-xl py-3"
                        >
                          <Text
                            className={`font-main-bold ${
                              isSelected ? "text-white" : "text-white/30"
                            }`}
                          >
                            {opt}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <RoundSelector />
            )}
          </CollapsibleCard>
        </LinearGradient>
      </Animated.View>

      {/* ---------------- AVATAR MODAL ---------------- */}
      <Modal visible={lobby.showAvatarGrid} transparent animationType="fade">
        <View className="flex-1 justify-end">
          {/* dark veil */}
          <View className="absolute inset-0 bg-black/80" />

          {/* sheet glow */}
          <View className="absolute inset-0 bg-indigo-500/10 blur-3xl" />

          <LinearGradient
            colors={["#0b0b10", "#050507"]}
            className="h-[80%] rounded-t-[36px] border-t border-white/10 p-6"
          >
            {/* header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-main-bold text-lg text-white">
                Select Avatar
              </Text>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  lobby.setShowAvatarGrid(false);
                }}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>

            <ImageGrid
              selectedImages={lobby.selectedImages}
              handleImageSelect={(id) => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );

                lobby.handleAvatarSelect(id);
                lobby.setShowAvatarGrid(false);
              }}
              gameMode="ONLINE"
            />
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
};
