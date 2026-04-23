import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { ApIsolationModal } from "@/components/Lobby/ApIsolationModal";
import { LobbyBackdrop } from "@/components/Lobby/LobbyBackdrop";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { PlayerProfileCard } from "@/components/Lobby/PlayerProfileCard";
import { PlayersList } from "@/components/Lobby/PlayersList";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { BettingModal } from "@/modal/BettingModal";

const LateJoinQrModal = ({
  visible,
  onClose,
  qrPayload,
  roomCode,
  onCopyRoomCode,
}: {
  visible: boolean;
  onClose: () => void;
  qrPayload: string;
  roomCode: string | null;
  onCopyRoomCode: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      <View className="w-full max-w-sm overflow-hidden rounded-[32px]">
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[32px] border border-white/10 p-6"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-emerald-200">
            Late Join QR
          </Text>
          <Text className="mt-3 font-main-bold text-2xl text-white">
            One more friend can still join
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/60">
            Let them scan this code, then come back and start the match.
          </Text>

          <View className="mt-5 items-center rounded-[26px] bg-white p-4">
            <QRCode value={qrPayload} size={160} />
          </View>

          {roomCode ? (
            <Pressable
              onPress={onCopyRoomCode}
              className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
                Copy Room Code
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onClose}
            className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
          >
            <Text className="text-center font-main-bold uppercase tracking-[2px] text-white/80">
              Close
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  </Modal>
);

const SetupActionCard = ({
  lobby,
  onOpenShare,
}: {
  lobby: any;
  onOpenShare: () => void;
}) => {
  const joinedCount = lobby.players.filter((player: any) => !player.isBot).length;
  const canShare = Boolean(lobby.qrPayload) && !lobby.isLocalOnlyLobby;

  if (!lobby.isHost) {
    return (
      <View className="overflow-hidden rounded-[30px]">
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[30px] border border-white/10 p-5"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
            Almost Ready
          </Text>
          <Text className="mt-3 font-main-bold text-xl text-white">
            Waiting for the host
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/60">
            You can still change your name and picture. The host picks the
            settings, coins and start time.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-[30px]">
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
          Match Start
        </Text>
        <Text className="mt-3 font-main-bold text-xl text-white">
          {joinedCount} player{joinedCount === 1 ? "" : "s"} ready
        </Text>
        <Text className="mt-2 text-sm leading-5 text-white/60">
          Pick the coins to start the match. Everyone keeps their final picture
          and name from this screen.
        </Text>

        {canShare ? (
          <Pressable
            onPress={onOpenShare}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
          >
            <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
              Show Late Join QR
            </Text>
          </Pressable>
        ) : (
          <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <Text className="text-center text-sm leading-5 text-white/60">
              {lobby.isLocalOnlyLobby
                ? "Local room only right now. Allow permissions later if you want to invite friends."
                : "Share code is getting ready."}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => lobby.setIsBettingModalVisible(true)}
          disabled={lobby.connectionStatus !== "HOSTING"}
          className="mt-4 overflow-hidden rounded-[28px]"
        >
          <LinearGradient
            colors={
              lobby.connectionStatus === "HOSTING"
                ? ["#2563EB", "#4F46E5"]
                : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
            }
            className="rounded-[28px] border border-white/10 px-5 py-5"
          >
            <Text
              className={`text-center font-main-bold text-lg ${
                lobby.connectionStatus === "HOSTING"
                  ? "text-white"
                  : "text-white/45"
              }`}
            >
              Choose Pot & Start
            </Text>
            <Text
              className={`mt-1 text-center text-xs leading-5 ${
                lobby.connectionStatus === "HOSTING"
                  ? "text-white/75"
                  : "text-white/25"
              }`}
            >
              Host only
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
};

const LobbySetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const lobby = useLobbyLogic(router, params);

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
