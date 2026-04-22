import * as Clipboard from "expo-clipboard";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import VideoPlayerComponent from "@/components/IntroVideo";
import { ApIsolationModal } from "@/components/Lobby/ApIsolationModal";
import {
  HandshakeStatus,
  HandshakeStatusType,
} from "@/components/Lobby/HandshakeStatus";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { PlayerProfileCard } from "@/components/Lobby/PlayerProfileCard";
import { PlayersList } from "@/components/Lobby/PlayersList";
import { StartButton } from "@/components/Lobby/StartButton";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import { BettingModal } from "@/modal/BettingModal";

type LobbyScreenProps = {
  forcedMode?: "host" | "client";
  routeGameType?: string;
  requireLanReady?: boolean;
};

const HostConnectionCard = ({
  lobby,
  onCopyRoomCode,
  onCopyIp,
}: {
  lobby: any;
  onCopyRoomCode: () => void;
  onCopyIp: () => void;
}) => {
  const roomCodeParts = (lobby.roomCode || "---- ----").split("-");

  return (
    <View className="mb-5 overflow-hidden rounded-[34px]">
      <View className="absolute inset-0 rounded-[34px] bg-indigo-500/15 blur-3xl" />

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.03)",
          "rgba(0,0,0,0.18)",
        ]}
        className="rounded-[34px] border border-white/10 p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="rounded-full border border-emerald-400/25 bg-emerald-400/15 px-3 py-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-emerald-200">
              LAN Ready
            </Text>
          </View>

          <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
            Host Lobby
          </Text>
        </View>

        <Text className="mt-4 font-main-bold text-2xl text-white">
          Invite your friend
        </Text>
        <Text className="mt-2 text-sm leading-5 text-white/62">
          Tell your friend to tap Join, then scan this QR or type the room code
          on the same Wi-Fi.
        </Text>
        <Text className="mt-2 text-xs leading-5 text-white/45">
          No friend nearby? Start anytime and bots will keep empty seats filled.
        </Text>

        <View className="mt-5 flex-row gap-4">
          <View className="items-center rounded-[28px] border border-white/10 bg-white p-4">
            {lobby.qrPayload ? (
              <QRCode value={lobby.qrPayload} size={148} />
            ) : (
              <View className="h-[148px] w-[148px] items-center justify-center">
                <Text className="text-center text-xs text-black/60">
                  Preparing host QR...
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 justify-between">
            <View className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
                Room Code
              </Text>
              <View className="mt-3 flex-row gap-2">
                {roomCodeParts.map((part: string, index: number) => (
                  <View
                    key={`${part}-${index}`}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
                  >
                    <Text className="text-center font-main-bold text-xl tracking-[2px] text-white">
                      {part}
                    </Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={onCopyRoomCode}
                className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <Text className="text-center text-xs font-main-bold uppercase tracking-[2px] text-white">
                  Copy Room Code
                </Text>
              </Pressable>
            </View>

            <View className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
              <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
                Host IP
              </Text>
              <Text className="mt-2 font-main-bold text-base text-white">
                {lobby.hostIp || "Resolving..."}
              </Text>
              <Pressable
                onPress={onCopyIp}
                className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <Text className="text-center text-xs font-main-bold uppercase tracking-[2px] text-white">
                  Copy IP
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const StatusCard = ({ lobby }: { lobby: any }) => {
  const humanCount = lobby.players.filter((player: any) => !player.isBot).length;
  const statusTone = lobby.errorMessage
    ? {
        pillClass: "border-red-400/25 bg-red-400/15",
        pillText: "text-red-200",
        title: "Connection issue",
        body: lobby.errorMessage,
      }
    : lobby.isHost
      ? {
          pillClass: "border-emerald-400/25 bg-emerald-400/15",
          pillText: "text-emerald-200",
          title: `${humanCount}/4 real players connected`,
          body: "Bots stay ready in open slots and are replaced automatically when friends join.",
        }
      : lobby.connectionStatus === "CONNECTED"
        ? {
            pillClass: "border-emerald-400/25 bg-emerald-400/15",
            pillText: "text-emerald-200",
            title: "Connected to host",
            body: "You are in the room. Your seat is already synced in the lobby.",
          }
        : lobby.connectionStatus === "CONNECTING"
          ? {
              pillClass: "border-amber-400/25 bg-amber-400/15",
              pillText: "text-amber-200",
              title: "Connecting to host",
              body: "Hold on while we complete the LAN handshake.",
            }
          : {
              pillClass: "border-white/10 bg-white/5",
              pillText: "text-white/70",
              title: "Waiting for connection",
              body: "Once the host accepts you, the bot slot will turn into your seat.",
            };

  return (
    <View className="mb-5 overflow-hidden rounded-[28px]">
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        className="rounded-[28px] border border-white/10 p-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
            Room Status
          </Text>
          <View className={`rounded-full px-3 py-1 ${statusTone.pillClass}`}>
            <Text
              className={`text-[10px] font-main-bold uppercase tracking-[2px] ${statusTone.pillText}`}
            >
              {lobby.isHost ? "Host" : lobby.connectionStatus}
            </Text>
          </View>
        </View>

        <Text className="mt-3 font-main-bold text-white">{statusTone.title}</Text>
        <Text className="mt-2 text-sm leading-5 text-white/60">
          {statusTone.body}
        </Text>
      </LinearGradient>
    </View>
  );
};

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  forcedMode,
  routeGameType,
  requireLanReady = false,
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    step: networkStep,
    status: networkStatus,
    retry: retryNetwork,
    errorMessage: networkErrorMessage,
    openSettings,
  } = useNetworkPermissions(requireLanReady);
  const isLanReady = !requireLanReady || networkStatus === "granted";
  const showNetworkGate = requireLanReady && !isLanReady;
  const uiStep = networkStep === "idle" ? "checking_wifi" : networkStep;
  const uiStatus =
    networkStatus === "pending"
      ? "loading"
      : (networkStatus as HandshakeStatusType);

  const lobby = useLobbyLogic(
    router,
    {
      ...params,
      gameType: routeGameType || params.gameType,
      isHost:
        forcedMode === "host"
          ? "true"
          : forcedMode === "client"
            ? "false"
            : params.isHost,
    },
    forcedMode,
    isLanReady,
  );

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

  const copyHostIp = useCallback(async () => {
    if (!lobby.hostIp) {
      return;
    }

    await Clipboard.setStringAsync(lobby.hostIp);
    toast.success("Host IP Copied", lobby.hostIp);
  }, [lobby.hostIp]);

  const playerCountSummary = useMemo(() => {
    const realPlayers = lobby.players.filter((player: any) => !player.isBot).length;
    return `${realPlayers} real player${realPlayers === 1 ? "" : "s"} in room`;
  }, [lobby.players]);

  if (lobby.isTransitioning) {
    return (
      <VideoPlayerComponent
        videoIndex={1}
        onVideoEnd={() => {
          const path =
            lobby.gameType === "QUIZ" ? "/think-count-quiz" : "/chor-police-mp";
          router.push({
            pathname: path,
            params: {
              playerId: lobby.localPlayerId,
              isHost: String(lobby.isHost),
            },
          } as any);
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <View className="absolute inset-0">
        <Image
          source={require("@/assets/images/bg/image.png")}
          className="h-full w-full"
          resizeMode="cover"
        />
        <BlurView intensity={18} tint="dark" className="absolute inset-0" />
        <LinearGradient
          colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.35)", "transparent"]}
          className="absolute inset-0"
        />
      </View>

      <LobbyHeader onBack={lobby.handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <PlayerProfileCard
            lobby={lobby}
            getAvatarSource={getAvatarSource}
            onSettingsToggle={setIsSettingsOpen}
          />

          {showNetworkGate ? (
            <HandshakeStatus
              step={uiStep as any}
              status={uiStatus}
              discoveredCount={0}
              errorMessage={networkErrorMessage}
              wifiSSID="Secure LAN"
              onRetry={retryNetwork}
              onOpenSettings={openSettings}
              isHost={Boolean(lobby.isHost)}
            />
          ) : (
            <>
              {lobby.isHost ? (
                <HostConnectionCard
                  lobby={lobby}
                  onCopyRoomCode={copyRoomCode}
                  onCopyIp={copyHostIp}
                />
              ) : null}

              <StatusCard lobby={lobby} />

              <View className="mb-4">
                <Text className="text-center text-[11px] uppercase tracking-[2px] text-white/30">
                  {playerCountSummary}
                </Text>
              </View>

              <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />
            </>
          )}
        </View>
      </ScrollView>

      {!showNetworkGate && !lobby.showAvatarGrid && !isSettingsOpen ? (
        <View className="px-6 pb-8">
          <StartButton lobby={lobby} />
        </View>
      ) : null}

      <BettingModal
        isVisible={lobby.isBettingModalVisible}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => lobby.setIsBettingModalVisible(false)}
        playerCount={lobby.players.length}
      />

      <ApIsolationModal
        visible={lobby.showApIsolation}
        onClose={() => lobby.setShowApIsolation(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbyScreen;
