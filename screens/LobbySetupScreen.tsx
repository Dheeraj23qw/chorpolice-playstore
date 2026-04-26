import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  SafeAreaView,
} from "react-native";
import { AnimatePresence, MotiView } from "moti";

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
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";

type UIState = "normal" | "betting" | "share" | "apIsolation" | "help";

const LobbySetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lobby = useLobbyLogic(router, params) as LobbyState;

  const [uiState, setUiState] = useState<UIState>("normal");
  const isBlockingUI = uiState !== "normal";

  // --- Sync Betting Modal State ---
  useEffect(() => {
    if (lobby.isBettingModalVisible) setUiState("betting");
    else if (uiState === "betting") setUiState("normal");
  }, [lobby.isBettingModalVisible]);

  useEffect(() => {
    if (lobby.showApIsolation) setUiState("apIsolation");
  }, [lobby.showApIsolation]);

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.webp");
  }, []);

  const copyRoomCode = useCallback(async () => {
    if (!lobby.roomCode) return;
    await Clipboard.setStringAsync(lobby.roomCode);
    toast.success("Room Code Copied", lobby.roomCode);
  }, [lobby.roomCode]);

  return (
    <View className="flex-1 bg-black">
      <LobbyBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* FIXED HEADER */}
          <LobbyHeader
            onBack={lobby.isHost ? lobby.handleBackToRoom : lobby.handleBack}
            rightIcon="help-buoy-outline"
            onRightPress={() => setUiState("help")}
          />

          <View className="flex-1 px-6">
            {/* SCROLLABLE AREA */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
            >
              <AnimatePresence>
                {!isBlockingUI && (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <View className="mb-6">
                      <Text className="font-main-bold text-3xl text-white md:text-4xl">
                        {lobby.isHost ? "Make everyone ready" : "Lobby Setup"}
                      </Text>
                      <Text className="mt-2 text-sm text-white/50">
                        {lobby.isHost
                          ? "Customize your profile and wait for others to join."
                          : "Wait for the host to finalize game settings."}
                      </Text>
                    </View>

                    <PlayerProfileCard
                      lobby={lobby}
                      getAvatarSource={getAvatarSource}
                      showGameSettings={lobby.isHost}
                    />

                    <View className="mt-8">
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text className="font-main-bold text-lg text-white">
                          Players
                        </Text>
                        <View className="rounded-full bg-white/10 px-3 py-1">
                          <Text className="text-xs text-white/80">
                            {lobby.players.length}/4
                          </Text>
                        </View>
                      </View>
                      <PlayersList
                        lobby={lobby}
                        getAvatarSource={getAvatarSource}
                      />
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </ScrollView>

            {/* FIXED FOOTER ACTION CARD */}
            <View className="pb-6 pt-2">
              <SetupActionCard
                lobby={lobby}
                onOpenShare={() => setUiState("share")}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* MODALS */}
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
        isHost={lobby.isHost}
      />

      <ApIsolationModal
        visible={uiState === "apIsolation"}
        onClose={() => {
          lobby.setShowApIsolation(false);
          setUiState("normal");
        }}
        isHost={lobby.isHost}
      />

      <MultiplayerHelpModal
        visible={uiState === "help"}
        onClose={() => setUiState("normal")}
      />
    </View>
  );
};

export default LobbySetupScreen;
