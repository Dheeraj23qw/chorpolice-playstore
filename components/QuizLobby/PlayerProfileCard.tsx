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

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scale.value = withSequence(
      withSpring(0.94),
      withSpring(1.08),
      withSpring(1),
    );
    lobby.setShowAvatarGrid(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <Animated.View
        entering={FadeInUp.delay(100).duration(500)}
        layout={Layout.springify()}
        className="mb-6 overflow-hidden rounded-[32px]"
      >
        {/* 🔥 OUTER GLOW */}
        <View className="absolute inset-0 rounded-[32px] bg-indigo-500/10 blur-2xl" />

        {/* 🎯 GLASS CARD */}
        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
          className="rounded-[32px] border border-white/10 p-6"
        >
          {/* ✨ TOP LIGHT */}
          <View className="absolute top-0 h-[1px] w-[80%] self-center bg-white/20" />

          {/* IDENTITY */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="mr-6 flex-1">
              <Text className="text-[10px] uppercase tracking-[3px] text-indigo-400">
                Player Identity
              </Text>

              <TextInput
                value={lobby.userName}
                onChangeText={lobby.handleNameChange}
                placeholder="Enter Name..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                className="mt-2 font-main-bold text-3xl text-white"
              />

              <Text className="mt-1 text-[10px] uppercase tracking-[1px] text-white/30">
                Tap avatar to change
              </Text>
            </View>

            {/* 🧑 AVATAR */}
            <AnimatedPressable
              onPress={handleAvatarPress}
              style={animatedStyle}
              className="relative"
            >
              {/* Glow */}
              <View className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />

              <View className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/20">
                <Image
                  source={getAvatarSource(lobby.selectedImages[0] || 1)}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              {/* Camera */}
              <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#121212] bg-indigo-500">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </AnimatedPressable>
          </View>

          {/* ⚙️ SETTINGS */}
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
              onSettingsToggle?.(next === "settings"); // 👈 notify parent
            }}
          >
            {lobby.gameType === "QUIZ" ? (
              <View className="flex-row rounded-2xl bg-black/40 p-1.5">
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
                        className="items-center rounded-xl py-2"
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
            ) : (
              <RoundSelector />
            )}
          </CollapsibleCard>
        </LinearGradient>
      </Animated.View>

      {/* 🧊 AVATAR MODAL (PREMIUM SHEET) */}
      <Modal visible={lobby.showAvatarGrid} transparent animationType="fade">
        <View className="flex-1 justify-end">
          {/* Background Fade */}
          <View className="absolute inset-0 bg-black/70" />

          {/* Sheet */}
          <View className="h-[80%] overflow-hidden rounded-t-[32px]">
            {/* Glow */}
            <View className="absolute inset-0 bg-indigo-500/10 blur-2xl" />

            <LinearGradient
              colors={["#121212", "#0a0a0a"]}
              className="flex-1 border-t border-white/10 p-6"
            >
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="font-main-bold text-lg text-white">
                  Select Avatar
                </Text>

                <Pressable onPress={() => lobby.setShowAvatarGrid(false)}>
                  <Ionicons name="close" size={28} color="white" />
                </Pressable>
              </View>

              <ImageGrid
                selectedImages={lobby.selectedImages}
                handleImageSelect={(id) => {
                  lobby.handleAvatarSelect(id);
                  lobby.setShowAvatarGrid(false);
                }}
                gameMode="ONLINE"
              />
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
};
