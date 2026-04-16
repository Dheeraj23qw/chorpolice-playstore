import React, { useState } from "react";
import { View, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { playerImages } from "@/constants/playerData";
import { DebugOverlay } from "@/components/DebugOverlay";
import { BettingModal } from "@/modal/BettingModal";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { LobbyHeader } from "@/components/QuizLobby/LobbyHeader";
import { PlayerProfileCard } from "@/components/QuizLobby/PlayerProfileCard";
import { PlayersList } from "@/components/QuizLobby/PlayersList";
import { StartButton } from "@/components/QuizLobby/StartButton";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const LobbyScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lobby = useLobbyLogic(router, params);

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  };

  const isModalOpen = lobby.isBettingModalVisible;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      {/* 🧪 Debug */}
      <DebugOverlay />

      {/* 🌌 BACKGROUND (ALWAYS VISIBLE) */}
      {/* 🌌 BACKGROUND (PREMIUM) */}
      <View className="absolute h-full w-full">
        {/* IMAGE */}
        <Image
          source={require("@/assets/images/bg/image.png")}
          className="absolute h-full w-full"
          resizeMode="cover"
        />

        {/* 🌫️ LIGHT BLUR (keep subtle) */}
        <BlurView
          intensity={18}
          tint="dark"
          className="absolute h-full w-full"
        />

        {/* 🎯 TOP → BOTTOM CINEMATIC FADE */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.55)", // top strong
            "rgba(0,0,0,0.30)", // mid soften
            "rgba(0,0,0,0.12)", // light
            "rgba(0,0,0,0.05)", // almost gone
            "transparent", // bottom clean
          ]}
          locations={[0, 0.25, 0.5, 0.7, 1]}
          className="absolute h-full w-full"
        />

        {/* 🔥 CENTER FOCUS GLOW (this is what you were missing) */}
        <LinearGradient
          colors={[
            "rgba(124,58,237,0.18)",
            "rgba(37,99,235,0.14)",
            "transparent",
          ]}
          className="absolute h-[650px] w-[650px] self-center rounded-full blur-3xl"
        />

        {/* 🌑 BOTTOM DEPTH (very subtle, not black) */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          className="absolute bottom-0 h-[25%] w-full"
        />
      </View>
      {/* ❗ UI hidden only */}
      {!isModalOpen && (
        <>
          {/* 🔝 Header */}
          <LobbyHeader onBack={() => router.back()} />

          {/* 📦 CONTENT */}
          <View className="flex-1 px-6">
            <PlayerProfileCard
              lobby={lobby}
              getAvatarSource={getAvatarSource}
              onSettingsToggle={setIsSettingsOpen}
            />
            {/* Players */}
            <View
              className={
                lobby.showAvatarGrid || isSettingsOpen ? "hidden" : "flex-1"
              }
            >
              <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />
            </View>

            {/* Avatar Grid */}
            <View
              className={
                !lobby.showAvatarGrid
                  ? "hidden"
                  : "flex-1 rounded-3xl border border-white/10 bg-white/5 p-4"
              }
            >
              <ImageGrid
                selectedImages={lobby.selectedImages}
                handleImageSelect={(id) => {
                  lobby.handleAvatarSelect(id);
                  lobby.setShowAvatarGrid(false);
                }}
                gameMode="ONLINE"
              />
            </View>
          </View>

          {/* 🚀 Start */}
          <StartButton lobby={lobby} />
        </>
      )}

      {/* 💰 MODAL */}
      <BettingModal
        isVisible={lobby.isBettingModalVisible}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => lobby.setIsBettingModalVisible(false)}
        playerCount={lobby.players.length}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbyScreen;
