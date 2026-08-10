import React, { useCallback, useMemo, useState } from "react";
import { View, Pressable, TextInput, Image, Modal } from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { CollapsibleCard } from "../CollapsibleCard";
import { DIFFICULTY_OPTIONS } from "@/constants/difficultyConfig";
import RoundSelector from "@/screens/RoundSelector";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { toast } from "@/components/feedback/toast";

export const PlayerProfileCard = ({
  lobby,
  getAvatarSource,
  onSettingsToggle,
  showGameSettings,
}: any) => {
  const [activeTab, setActiveTab] = useState<"settings" | null>(null);
  const [avatarPressed, setAvatarPressed] = useState(false);
  const [localName, setLocalName] = useState(lobby.userName);

  const handleTextChange = useCallback((text: string) => {
    setLocalName(text);
    lobby.handleNameChange(text);
  }, [lobby]);

  /* ---------------- FAST LOOKUP (OPTIMIZED) ---------------- */
  const takenSet = useMemo(() => {
    const set = new Set<number>();
    lobby?.players?.forEach((p: any) => {
      if (p.avatarId && p.id !== lobby.localPlayerId) {
        set.add(p.avatarId);
      }
    });
    return set;
  }, [lobby?.players, lobby?.localPlayerId]);

  const isAvatarTaken = useCallback(
    (id: number) => takenSet.has(id),
    [takenSet],
  );

  /* ---------------- AVATAR PRESS ---------------- */
  const handleAvatarPress = async () => {
    setAvatarPressed(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setAvatarPressed(false), 120);
    lobby.setShowAvatarGrid(true);
  };

  /* ---------------- SAFE SELECT ---------------- */
  const handleAvatarSelect = async (id: number) => {
    if (isAvatarTaken(id)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      toast.error("Avatar already taken", "Please choose another avatar");
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    lobby.handleAvatarSelect(id);
    lobby.setShowAvatarGrid(false);
  };

  return (
    <>
      {/* ================= PROFILE CARD ================= */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -30, height: 0, marginBottom: 0 }}
        transition={{ type: "timing", duration: 350 }}
        className="overflow-hidden rounded-[36px]"
      >
        <View className="mb-6">
        <View className="absolute inset-0 rounded-[36px] bg-indigo-500/20 blur-2xl" />

        <LinearGradient
          colors={[
            "rgba(255,255,255,0.08)",
            "rgba(255,255,255,0.03)",
            "rgba(0,0,0,0.2)",
          ]}
          className="rounded-[36px] border border-white/10"
        >
          <View className="p-6">
          {/* HEADER */}
          <View className="mb-8 flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[10px] uppercase tracking-[3px] text-indigo-300">
                  Identity Profile
                </Text>

                <View className="mt-2 flex-row items-center gap-x-2">
                  <View className="h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/25 bg-indigo-500/15 shadow-lg shadow-indigo-500/40">
                    <Ionicons name="pencil" size={16} color="#C7D2FE" />
                  </View>
                  <TextInput
                    value={localName}
                    onChangeText={handleTextChange}
                    placeholder="Enter Name..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="font-main-bold text-3xl text-white"
                  />
                </View>
              </View>

            {/* AVATAR */}
            <Pressable onPress={handleAvatarPress}>
              <MotiView
                animate={{ scale: avatarPressed ? 0.92 : 1 }}
                transition={{ type: "timing", duration: 120 }}
              >
                <View className="h-24 w-24 rounded-full border border-white/20 p-[2px]">
                  <Image
                    source={getAvatarSource(lobby.selectedImages?.[0] || 1)}
                    className="h-full w-full rounded-full"
                  />
                </View>

                <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              </MotiView>
            </Pressable>
          </View>

          {/* SETTINGS (Host Only) */}
          {showGameSettings && (
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
                          onPress={() => lobby.handleDifficultyChange(opt)}
                          className="flex-1"
                        >
                          <LinearGradient
                            colors={
                              isSelected
                                ? ["#6366F1", "#8B5CF6"]
                                : ["transparent", "transparent"]
                            }
                            className="rounded-xl"
                          >
                            <View className="items-center py-3">
                            <Text
                              className={
                                isSelected
                                  ? "font-main-bold text-white"
                                  : "text-white/30"
                              }
                            >
                              {opt}
                            </Text>
                            </View>
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
          )}
          </View>
        </LinearGradient>
      </View>
      </MotiView>

      {/* ================= AVATAR MODAL (SMOOTH SHEET) ================= */}
      <Modal visible={lobby.showAvatarGrid} transparent>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 180 }}
          className="bg-black/80"
          style={{ flex: 1 }}
        >
          <View className="flex-1">
          {/* SHEET (NO SPRING = NO LAG) */}
          <MotiView
            from={{ translateY: 600 }}
            animate={{ translateY: 0 }}
            exit={{ translateY: 600 }}
            transition={{ type: "timing", duration: 220 }}
            className="rounded-t-[36px] bg-[#050507]"
          >
            <View className="mt-auto h-[80%] p-6">
            {/* HEADER */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-main-bold text-lg text-white">
                Select Avatar
              </Text>

              <Pressable onPress={() => lobby.setShowAvatarGrid(false)}>
                <Ionicons name="close" size={26} color="white" />
              </Pressable>
            </View>

            {/* GRID */}
            <ImageGrid
              selectedImages={lobby.selectedImages}
              handleImageSelect={handleAvatarSelect}
              gameMode="ONLINE"
              isTaken={(id: number) => takenSet.has(id)}
            />
            </View>
          </MotiView>
          </View>
        </MotiView>
      </Modal>
    </>
  );
};
