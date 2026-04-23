import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
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
import { LobbyBackdrop } from "@/components/Lobby/LobbyBackdrop";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { PlayersList } from "@/components/Lobby/PlayersList";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";

type LobbyScreenProps = {
  forcedMode?: "host" | "client";
  routeGameType?: string;
  requireLanReady?: boolean;
};

const QR_SIZE = 112;

const PrimaryButton = ({
  title,
  subtitle,
  onPress,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className="overflow-hidden rounded-[28px]"
  >
    <LinearGradient
      colors={
        disabled
          ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
          : ["#2563EB", "#4F46E5"]
      }
      className="rounded-[28px] border border-white/10 px-5 py-5"
    >
      <Text
        className={`text-center font-main-bold text-lg tracking-[1px] ${
          disabled ? "text-white/45" : "text-white"
        }`}
      >
        {title}
      </Text>
      <Text
        className={`mt-1 text-center text-xs leading-5 ${
          disabled ? "text-white/25" : "text-white/75"
        }`}
      >
        {subtitle}
      </Text>
    </LinearGradient>
  </Pressable>
);

const HostInviteCard = ({
  lobby,
  onCopyRoomCode,
}: {
  lobby: any;
  onCopyRoomCode: () => void;
}) => {
  const roomCodeParts = (lobby.roomCode || "---- ----").split("-");

  if (lobby.isLocalOnlyLobby || !lobby.qrPayload) {
    return (
      <View className="mb-5 overflow-hidden rounded-[30px]">
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[30px] border border-white/10 p-5"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-amber-200">
            Ready Seats
          </Text>
          <Text className="mt-3 font-main-bold text-2xl text-white">
            Start right away
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/62">
            This room is ready for local play now. If you want to invite
            friends, allow Chor Police network permissions and stay on the same
            Wi-Fi or hotspot.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="mb-5 overflow-hidden rounded-[30px]">
      <View className="absolute inset-0 rounded-[30px] bg-indigo-500/10 blur-3xl" />

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.03)",
          "rgba(0,0,0,0.16)",
        ]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-emerald-200">
            Invite Friends
          </Text>
          <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-emerald-100">
              Scan Here
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-4">
          <View className="rounded-[24px] bg-white p-3">
            <QRCode value={lobby.qrPayload} size={QR_SIZE} />
          </View>

          <View className="flex-1">
            <Text className="font-main-bold text-2xl text-white">
              Join my room
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/62">
              Ask your friend to scan this code or type the room code below.
            </Text>

            <View className="mt-4 flex-row gap-2">
              {roomCodeParts.map((part: string, index: number) => (
                <View
                  key={`${part}-${index}`}
                  className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
                >
                  <Text className="text-center font-main-bold text-base tracking-[2px] text-white">
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
        </View>
      </LinearGradient>
    </View>
  );
};

const RoomSummaryCard = ({ lobby }: { lobby: any }) => {
  const joinedCount = lobby.players.filter((player: any) => !player.isBot).length;
  const openSeats = Math.max(0, lobby.maxPlayers - joinedCount);

  return (
    <View className="mb-5 overflow-hidden rounded-[28px]">
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        className="rounded-[28px] border border-white/10 p-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
            Room Story
          </Text>
          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-white/65">
              {lobby.isHost ? "Host" : "Player"}
            </Text>
          </View>
        </View>

        <Text className="mt-3 font-main-bold text-xl text-white">
          {openSeats === 0
            ? "Everybody is ready"
            : `${openSeats} seat${openSeats === 1 ? "" : "s"} still open`}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-white/60">
          {lobby.isHost
            ? "Tap Let's Go when you want to move everyone to the final setup screen."
            : "Wait here. The host will move everyone to the final setup screen."}
        </Text>
        <Text className="mt-3 text-xs uppercase tracking-[2px] text-white/35">
          {joinedCount} joined • {lobby.maxPlayers} seats ready
        </Text>
      </LinearGradient>
    </View>
  );
};

const PermissionFallbackCard = ({
  isHost,
  onPrimary,
  onSecondary,
  primaryLabel,
  message,
}: {
  isHost: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  message: string;
}) => (
  <View className="mx-1 overflow-hidden rounded-[30px]">
    <LinearGradient
      colors={["rgba(239,68,68,0.18)", "rgba(15,23,42,0.2)"]}
      className="rounded-[30px] border border-red-400/20 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-red-200">
        Permission Needed
      </Text>
      <Text className="mt-3 font-main-bold text-2xl text-white">
        Let Chor Police connect
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>
      <Text className="mt-2 text-sm leading-5 text-white/55">
        If you want to play with friends, make sure you allow Chor Police this
        permission.
      </Text>

      <Pressable onPress={onPrimary} className="mt-5 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          className="rounded-2xl px-4 py-4"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            {primaryLabel}
          </Text>
        </LinearGradient>
      </Pressable>

      {isHost && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            Play With Ready Seats
          </Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  </View>
);

const HostStartErrorCard = ({
  message,
  onRetry,
  onUseReadySeats,
  retrying = false,
}: {
  message: string;
  onRetry: () => void;
  onUseReadySeats?: () => void;
  retrying?: boolean;
}) => (
  <View className="mx-1 overflow-hidden rounded-[30px]">
    <LinearGradient
      colors={["rgba(245,158,11,0.18)", "rgba(15,23,42,0.2)"]}
      className="rounded-[30px] border border-amber-400/20 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-amber-200">
        Room Problem
      </Text>
      <Text className="mt-3 font-main-bold text-2xl text-white">
        Could not open the room
      </Text>
      <Text className="mt-2 text-sm leading-5 text-white/65">{message}</Text>
      <Text className="mt-2 text-sm leading-5 text-white/55">
        Try hosting again. If you only want to play on this phone for now, you
        can still continue with ready seats.
      </Text>

      <Pressable
        onPress={onRetry}
        disabled={retrying}
        className="mt-5 overflow-hidden rounded-2xl"
      >
        <LinearGradient
          colors={
            retrying
              ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
              : ["#2563EB", "#1D4ED8"]
          }
          className="rounded-2xl px-4 py-4"
        >
          <Text
            className={`text-center font-main-bold uppercase tracking-[2px] ${
              retrying ? "text-white/45" : "text-white"
            }`}
          >
            {retrying ? "Trying Again..." : "Try Hosting Again"}
          </Text>
        </LinearGradient>
      </Pressable>

      {onUseReadySeats ? (
        <Pressable
          onPress={onUseReadySeats}
          className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
        >
          <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
            Play With Ready Seats
          </Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  </View>
);

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  forcedMode,
  routeGameType,
  requireLanReady = false,
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    step: networkStep,
    status: networkStatus,
    retry: retryNetwork,
    errorMessage: networkErrorMessage,
    openSettings,
  } = useNetworkPermissions(requireLanReady);
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
    !requireLanReady || networkStatus === "granted",
  );

  const showNetworkGate =
    requireLanReady &&
    networkStatus !== "granted" &&
    !lobby.isLocalOnlyLobby &&
    lobby.connectionStatus !== "HOSTING";
  const showHostStartError =
    lobby.isHost &&
    lobby.connectionStatus === "ERROR" &&
    Boolean(lobby.errorMessage) &&
    !showNetworkGate;
  const uiStep = networkStep === "idle" ? "checking_wifi" : networkStep;
  const uiStatus =
    networkStatus === "pending"
      ? "loading"
      : (networkStatus as HandshakeStatusType);

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

  const permissionPrimaryLabel = useMemo(() => {
    return uiStatus === "denied" ? "Open Settings" : "Try Again";
  }, [uiStatus]);

  const permissionPrimaryAction = useCallback(() => {
    if (uiStatus === "denied") {
      void openSettings();
      return;
    }

    void retryNetwork();
  }, [openSettings, retryNetwork, uiStatus]);

  useEffect(() => {
    if (lobby.lobbyStage !== "setup") {
      return;
    }

    router.replace({
      pathname: "/lobby-setup",
      params: {
        gameType: lobby.gameType,
        isHost: String(lobby.isHost),
      },
    } as any);
  }, [lobby.gameType, lobby.isHost, lobby.lobbyStage, router]);

  if (lobby.isTransitioning) {
    return (
      <VideoPlayerComponent
        videoIndex={1}
        onVideoEnd={() => {
          // Navigation happens from the packet listener.
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <LobbyBackdrop />

      <LobbyHeader onBack={lobby.handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 164 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <View className="mb-5">
            <Text className="text-[11px] uppercase tracking-[3px] text-white/35">
              {lobby.isHost ? "Host Room" : "Joined Room"}
            </Text>
            <Text className="mt-2 font-main-bold text-4xl text-white">
              {lobby.isHost ? "Invite and play" : "Wait for Let's Go"}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/60">
              {lobby.isHost
                ? "Keep this screen simple for kids: invite friends first, then move everyone to the final setup screen."
                : "You are in the room. When the host taps Let's Go, everyone moves to the final setup screen."}
            </Text>
          </View>

          {showNetworkGate ? (
            uiStatus === "loading" ? (
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
              <PermissionFallbackCard
                isHost={Boolean(lobby.isHost)}
                onPrimary={permissionPrimaryAction}
                onSecondary={
                  lobby.isHost ? lobby.handleContinueWithReadySeats : undefined
                }
                primaryLabel={permissionPrimaryLabel}
                message={
                  networkErrorMessage ||
                  "Nearby Wi-Fi and location permission help Chor Police find and host local rooms."
                }
              />
            )
          ) : showHostStartError ? (
            <HostStartErrorCard
              message={
                lobby.errorMessage ||
                "The local room server did not start. Please try again."
              }
              onRetry={lobby.handleRetryHosting}
              retrying={lobby.isBootstrappingHost}
              onUseReadySeats={
                lobby.isHost ? lobby.handleContinueWithReadySeats : undefined
              }
            />
          ) : (
            <>
              {lobby.isHost ? (
                <HostInviteCard lobby={lobby} onCopyRoomCode={copyRoomCode} />
              ) : null}

              <RoomSummaryCard lobby={lobby} />
              <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />
            </>
          )}
        </View>
      </ScrollView>

      {!showNetworkGate && !showHostStartError ? (
        <View className="px-6 pb-8">
          {lobby.isHost ? (
            <PrimaryButton
              title="LET'S GO"
              subtitle="Next you will choose names, pictures and coins before the match starts."
              onPress={lobby.handleOpenSetup}
              disabled={lobby.connectionStatus !== "HOSTING"}
            />
          ) : (
            <View className="overflow-hidden rounded-[28px]">
              <LinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                className="rounded-[28px] border border-white/10 px-5 py-5"
              >
                <Text className="text-center font-main-bold text-lg text-white">
                  Waiting for the host
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-white/65">
                  Stay here. The host will move everyone to the final setup
                  screen.
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      ) : null}

      <ApIsolationModal
        visible={lobby.showApIsolation}
        onClose={() => lobby.setShowApIsolation(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbyScreen;
