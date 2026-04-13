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
import { Text } from "@/components/Text";
import { CollapsibleCard } from "../CollapsibleCard";
import { DIFFICULTY_OPTIONS } from "@/constants/difficultyConfig";
import RoundSelector from "@/screens/RoundSelector";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PlayerProfileCard = ({ lobby, getAvatarSource }: any) => {
  const [activeTab, setActiveTab] = useState<"settings" | null>(null);
  const scale = useSharedValue(1);

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scale.value = withSequence(
      withSpring(0.94),
      withSpring(1.06),
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
        className="mb-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black"
      >
        {/* IDENTITY SECTION */}
        <View className="mb-8 flex-row items-center justify-between">
          <View className="mr-6 flex-1">
            <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-indigo-400">
              Player Identity
            </Text>
            <TextInput
              value={lobby.userName}
              onChangeText={lobby.handleNameChange}
              placeholder="Enter Name..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              className="mt-2 font-main-bold text-3xl text-white"
            />
            <Text className="font-main-medium mt-1 text-[10px] uppercase tracking-[1px] text-white/30">
              Click photo to change avatar
            </Text>
          </View>

          {/* AVATAR WITH SIDE CAMERA ICON */}
          <AnimatedPressable
            onPress={handleAvatarPress}
            style={animatedStyle}
            className="relative h-24 w-24 overflow-visible rounded-full"
          >
            <View className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 bg-indigo-600/20 shadow-xl shadow-indigo-500">
              <Image
                source={getAvatarSource(lobby.selectedImages[0] || 1)}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#121212] bg-indigo-500 shadow-lg">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </AnimatedPressable>
        </View>

        {/* GAME SETTINGS */}
        <CollapsibleCard
          label="Game Configuration"
          title={
            lobby.gameType === "QUIZ"
              ? `LEVEL: ${lobby.difficulty || "SELECT"}`
              : "SELECT ROUNDS"
          }
          icon={
            lobby.gameType === "QUIZ" ? "speedometer-outline" : "timer-outline"
          }
          isOpen={activeTab === "settings"}
          onToggle={() =>
            setActiveTab(activeTab === "settings" ? null : "settings")
          }
        >
          {lobby.gameType === "QUIZ" ? (
            <View className="flex-row rounded-2xl bg-black/40 p-1.5">
              {/* PRE-CALCULATE THE STYLES OUTSIDE THE RENDER-TRAP */}
              {DIFFICULTY_OPTIONS.map((opt: any) => {
                const isSelected = lobby.difficulty === opt;

                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      // Use a stable reference
                      lobby.handleDifficultyChange(opt);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                    }}
                    // Keep className simple. Complex dynamic classes can sometimes confuse the interop engine
                    className={`flex-1 items-center rounded-xl py-2 ${isSelected ? "bg-indigo-600" : ""}`}
                  >
                    <Text
                      className={`font-main-bold ${isSelected ? "text-white" : "text-white/30"}`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <RoundSelector />
          )}
        </CollapsibleCard>
      </Animated.View>

      {/* --- AVATAR SELECTION MODAL --- */}
      <Modal
        visible={lobby.showAvatarGrid}
        transparent={true}
        animationType="slide"
        onRequestClose={() => lobby.setShowAvatarGrid(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="h-[80%] rounded-t-[32px] border-t border-white/10 bg-[#121212] p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-main-bold text-lg text-white">
                Select Avatar
              </Text>
              <Pressable
                onPress={() => lobby.setShowAvatarGrid(false)}
                className="p-1"
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>
            <View className="flex-1">
              <ImageGrid
                selectedImages={lobby.selectedImages}
                handleImageSelect={(imgId: any) => {
                  lobby.handleImageSelect(imgId);
                  lobby.setShowAvatarGrid(false);
                }}
                gameMode="ONLINE"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
