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
import { EntryModal } from "@/modal/EntryModal";

type UIState = "normal" | "betting" | "share" | "apIsolation";

const LobbySetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const lobby = useLobbyLogic(router, params) as LobbyState;

  const [uiState, setUiState] = useState<UIState>("normal");

  /* ---------------- BLOCK UI FLAG ---------------- */
  const isBlockingUI = uiState !== "normal";

  /* ---------------- SYNC MODALS ---------------- */
  useEffect(() => {
    if (lobby.isBettingModalVisible) setUiState("betting");
    else if (uiState === "betting") setUiState("normal");
  }, [lobby.isBettingModalVisible]);

  useEffect(() => {
    if (lobby.showApIsolation) setUiState("apIsolation");
  }, [lobby.showApIsolation]);

  /* ---------------- AVATAR ---------------- */
  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.webp");
  }, []);

  /* ---------------- COPY ---------------- */
  const copyRoomCode = useCallback(async () => {
    if (!lobby.roomCode) return;
    await Clipboard.setStringAsync(lobby.roomCode);
    toast.success("Room Code Copied", lobby.roomCode);
  }, [lobby.roomCode]);

  /* ---------------- SUMMARY ---------------- */
  const setupSummary = useMemo(() => {
    return lobby.isHost
      ? "Everyone can change name and avatar."
      : "Update your profile while waiting for host.";
  }, [lobby.isHost]);

  /* ---------------- NAVIGATION ---------------- */
  useEffect(() => {
    if (lobby.lobbyStage !== "room") return;

    router.replace({
      pathname: "/lobby",
      params: {
        gameType: lobby.gameType,
        isHost: String(lobby.isHost),
      },
    } as any);
  }, [lobby.lobbyStage]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop />

      {/* HEADER (hidden when modal active) */}
      {!isBlockingUI && (
        <LobbyHeader
          onBack={lobby.isHost ? lobby.handleBackToRoom : lobby.handleBack}
        />
      )}

      {/* MAIN CONTENT */}
      <View className="flex-1 px-6">
        {/* TITLE */}
        {!isBlockingUI && (
          <View className="mb-5">
            <Text className="mt-2 font-main-bold text-4xl text-white">
              Make everyone ready
            </Text>

            <Text className="mt-2 text-sm leading-5 text-white/60">
              {setupSummary}
            </Text>
          </View>
        )}

        {/* PROFILE CARD */}
        {!isBlockingUI && (
          <PlayerProfileCard
            lobby={lobby}
            getAvatarSource={getAvatarSource}
            showGameSettings={lobby.isHost}
          />
        )}

        {/* PLAYER LIST + ACTION CARD */}
        {!isBlockingUI && (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
          >
            <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />

            <SetupActionCard
              lobby={lobby}
              onOpenShare={() => setUiState("share")}
            />
          </ScrollView>
        )}
      </View>

      {/* ---------------- MODALS ---------------- */}

      <EntryModal
        isVisible={uiState === "betting"}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => {
          lobby.setIsBettingModalVisible(false);
          setUiState("normal");
        }}
        playerCount={lobby.players.length}
      />

      <LateJoinQrModal
        visible={uiState === "share"}
        onClose={() => setUiState("normal")}
        qrPayload={lobby.qrPayload}
        roomCode={lobby.roomCode}
        onCopyRoomCode={copyRoomCode}
      />

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
