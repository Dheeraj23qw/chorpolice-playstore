import React, { useState } from "react";
import { View, Pressable, TextInput, Image, Modal } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { CollapsibleCard } from "../CollapsibleCard";
import { DIFFICULTY_OPTIONS } from "@/constants/difficultyConfig";
import RoundSelector from "@/screens/RoundSelector";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";

export const PlayerProfileCard = ({
  lobby,
  getAvatarSource,
  onSettingsToggle,
}: any) => {
  const [activeTab, setActiveTab] = useState<"settings" | null>(null);
  const [avatarPressed, setAvatarPressed] = useState(false);

  const handleAvatarPress = async () => {
    setAvatarPressed(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setAvatarPressed(false), 150);

    lobby.setShowAvatarGrid(true);
  };

  return (
    <>
      {/* 🔥 CARD ENTRY */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="mb-6 overflow-hidden rounded-[36px]"
      >
        {/* 🌈 GLOW */}
        <View className="absolute inset-0 rounded-[36px] bg-indigo-500/20 blur-3xl" />

        {/* 🌫 GLASS */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.08)",
            "rgba(255,255,255,0.03)",
            "rgba(0,0,0,0.2)",
          ]}
          className="rounded-[36px] border border-white/10 p-6"
        >
          {/* HEADER */}
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

            {/* 🔥 AVATAR */}
            <Pressable onPress={handleAvatarPress}>
              <MotiView
                animate={{
                  scale: avatarPressed ? 0.9 : 1,
                }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                }}
                className="relative"
              >
                <View className="h-24 w-24 rounded-full border border-white/20 p-[2px]">
                  <View className="h-full w-full overflow-hidden rounded-full bg-black">
                    <Image
                      source={getAvatarSource(lobby.selectedImages[0] || 1)}
                      className="h-full w-full"
                    />
                  </View>
                </View>

                {/* CAMERA BADGE */}
                <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-indigo-500">
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              </MotiView>
            </Pressable>
          </View>

          {/* SETTINGS */}
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
                        onPress={async () => {
                          await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                          lobby.handleDifficultyChange(opt);
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
      </MotiView>

      {/* 🔥 AVATAR MODAL (PROPER SHEET ANIMATION) */}
      <Modal visible={lobby.showAvatarGrid} transparent>
        <AnimatePresence>
          {lobby.showAvatarGrid && (
            <>
              {/* BACKDROP */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
              />

              {/* SHEET */}
              <MotiView
                from={{ translateY: 500 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 500 }}
                transition={{ type: "spring", damping: 18 }}
                className="mt-auto h-[80%] rounded-t-[36px] border-t border-white/10 bg-[#050507] p-6"
              >
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
              </MotiView>
            </>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
};
