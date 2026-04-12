import React from "react";
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

const LobbyScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lobby = useLobbyLogic(router, params);

  const getAvatarSource = (avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#09090b]"
    >
      {/* 🧪 Debug */}
      <DebugOverlay />

      {/* 🌌 Background */}
      <View className="absolute h-full w-full">
        <Image
          source={require("@/assets/images/bg/image.png")}
          className="absolute h-full w-full opacity-30"
          resizeMode="cover"
        />
        <View className="absolute h-full w-full bg-[#09090b]/80" />
      </View>

      {/* 🔝 Header */}
      <LobbyHeader onBack={() => router.back()} />

      {/* 📦 Main Content */}
      <View className="flex-1 px-6">
        <PlayerProfileCard lobby={lobby} getAvatarSource={getAvatarSource} />

        {!lobby.showAvatarGrid ? (
          <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />
        ) : (
          <View className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4">
            <ImageGrid
              selectedImages={lobby.selectedImages}
              handleImageSelect={(id) => lobby.handleAvatarSelect(id)}
              gameMode="ONLINE"
            />
          </View>
        )}
      </View>

      {/* 🚀 Start Button */}
      <StartButton lobby={lobby} />

      {/* 💰 Betting Modal */}
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
