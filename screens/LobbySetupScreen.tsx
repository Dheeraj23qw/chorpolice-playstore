import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { ApIsolationModal } from "@/components/LobbyScreen/ApIsolationModal";
import { LateJoinQrModal } from "@/modal/LateJoinQrModal";
import { LobbyBackdrop } from "@/components/LobbyScreen/LobbyBackdrop";
import { LobbyHeader } from "@/components/LobbyScreen/LobbyHeader";
import { PlayerProfileCard } from "@/components/LobbyScreen/PlayerProfileCard";
import { PlayersList } from "@/components/LobbyScreen/PlayersList";
import { SetupActionCard } from "@/components/LobbyScreen/SetupActionCard";
import { LobbyState } from "@/components/LobbyScreen/types";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { BettingModal } from "@/modal/BettingModal";

type UIState = "normal" | "betting" | "share" | "apIsolation";

const LobbySetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [uiState, setUiState] = useState<UIState>("normal");

  const lobby = useLobbyLogic(router, params) as LobbyState;

  // 🔥 Sync external modal triggers (important)
  useEffect(() => {
    if (lobby.isBettingModalVisible) {
      setUiState("betting");
    } else if (uiState === "betting") {
      setUiState("normal");
    }
  }, [lobby.isBettingModalVisible]);

  useEffect(() => {
    if (lobby.showApIsolation) {
      setUiState("apIsolation");
    }
  }, [lobby.showApIsolation]);

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.png");
  }, []);

  const copyRoomCode = useCallback(async () => {
    if (!lobby.roomCode) return;
    await Clipboard.setStringAsync(lobby.roomCode);
    toast.success("Room Code Copied", lobby.roomCode);
  }, [lobby.roomCode]);

  const setupSummary = useMemo(() => {
    return lobby.isHost
      ? "Everyone can change their name and picture here. Only the host can chose Rounds and start."
      : "Change your name and picture here. The host will pick the settings and start the match.";
  }, [lobby.isHost]);

  const isBlockingUI = uiState !== "normal";

  useEffect(() => {
    if (lobby.lobbyStage !== "room") return;

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

      {/* 🔒 MAIN UI (hidden when any modal is active) */}
      {!isBlockingUI && (
        <>
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
                onOpenShare={() => setUiState("share")}
              />
            </View>
          </ScrollView>
        </>
      )}

      {/* 🎯 BETTING MODAL */}
      <BettingModal
        isVisible={uiState === "betting"}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => {
          lobby.setIsBettingModalVisible(false);
          setUiState("normal");
        }}
        playerCount={lobby.players.length}
      />

      {/* 🎯 SHARE MODAL */}
      <LateJoinQrModal
        visible={uiState === "share"}
        onClose={() => setUiState("normal")}
        qrPayload={lobby.qrPayload}
        roomCode={lobby.roomCode}
        onCopyRoomCode={copyRoomCode}
      />

      {/* 🎯 AP ISOLATION MODAL */}
      <ApIsolationModal
        visible={uiState === "apIsolation"}
        onClose={() => {
          lobby.setShowApIsolation(false);
          setUiState("normal");
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbySetupScreen;
