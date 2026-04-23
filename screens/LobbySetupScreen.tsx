import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { ApIsolationModal } from "@/components/Lobby/ApIsolationModal";
import { LateJoinQrModal } from "@/components/Lobby/LateJoinQrModal";
import { LobbyBackdrop } from "@/components/Lobby/LobbyBackdrop";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { PlayerProfileCard } from "@/components/Lobby/PlayerProfileCard";
import { PlayersList } from "@/components/Lobby/PlayersList";
import { SetupActionCard } from "@/components/Lobby/SetupActionCard";
import { LobbyState } from "@/components/Lobby/types";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { BettingModal } from "@/modal/BettingModal";

const LobbySetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const lobby = useLobbyLogic(router, params) as LobbyState;

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  }, []);

  const copyRoomCode = useCallback(async () => {
    if (!lobby.roomCode) {
      return;
    }

    await Clipboard.setStringAsync(lobby.roomCode);
    toast.success("Room Code Copied", lobby.roomCode);
  }, [lobby.roomCode]);

  const setupSummary = useMemo(() => {
    return lobby.isHost
      ? "Everyone can change their name and picture here. Only the host can pick settings and start."
      : "Change your name and picture here. The host will pick the settings and start the match.";
  }, [lobby.isHost]);

  useEffect(() => {
    if (lobby.lobbyStage !== "room") {
      return;
    }

    router.replace({
      pathname: "/lobby",
      params: {
        gameType: lobby.gameType,
        isHost: String(lobby.isHost),
      },
    } as any);
  }, [lobby.gameType, lobby.isHost, lobby.lobbyStage, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop />

      <LobbyHeader
        onBack={lobby.isHost ? lobby.handleBackToRoom : lobby.handleBack}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <View className="mb-5">
            <Text className="text-[10px] uppercase tracking-[3px] text-blue-200">
              Final Setup
            </Text>
            <Text className="mt-2 font-main-bold text-4xl text-white">
              Make everybody ready
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/60">
              {setupSummary}
            </Text>
          </View>

          <PlayerProfileCard
            lobby={lobby}
            getAvatarSource={getAvatarSource}
            showGameSettings={lobby.isHost}
          />

          <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />

          <SetupActionCard
            lobby={lobby}
            onOpenShare={() => setIsShareOpen(true)}
          />
        </View>
      </ScrollView>

      <BettingModal
        isVisible={lobby.isBettingModalVisible}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => lobby.setIsBettingModalVisible(false)}
        playerCount={lobby.players.length}
      />

      <LateJoinQrModal
        visible={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        qrPayload={lobby.qrPayload}
        roomCode={lobby.roomCode}
        onCopyRoomCode={copyRoomCode}
      />

      <ApIsolationModal
        visible={lobby.showApIsolation}
        onClose={() => lobby.setShowApIsolation(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbySetupScreen;
