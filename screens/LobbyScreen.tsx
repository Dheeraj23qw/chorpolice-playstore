import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import VideoPlayerComponent from "@/components/IntroVideo";
import { ApIsolationModal } from "@/components/Lobby/ApIsolationModal";
import {
  HandshakeStatus,
  HandshakeStatusType,
} from "@/components/Lobby/HandshakeStatus";
import { HostInviteCard } from "@/components/Lobby/HostInviteCard";
import { HostStartErrorCard } from "@/components/Lobby/HostStartErrorCard";
import { LobbyBackdrop } from "@/components/Lobby/LobbyBackdrop";
import { LobbyHeader } from "@/components/Lobby/LobbyHeader";
import { PermissionFallbackCard } from "@/components/Lobby/PermissionFallbackCard";
import { PlayersList } from "@/components/Lobby/PlayersList";
import { PrimaryButton } from "@/components/Lobby/PrimaryButton";
import { RoomSummaryCard } from "@/components/Lobby/RoomSummaryCard";
import { LobbyState } from "@/components/Lobby/types";
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

  // Cast useLobbyLogic return to LobbyState for better type safety
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
  ) as LobbyState;

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
          <MotiView 
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mb-6"
          >
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
          </MotiView>

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
            <View>
              {lobby.isHost && (
                <HostInviteCard lobby={lobby} onCopyRoomCode={copyRoomCode} />
              )}

              <RoomSummaryCard lobby={lobby} />
              
              <PlayersList lobby={lobby} getAvatarSource={getAvatarSource} />
            </View>
          )}
        </View>
      </ScrollView>

      {!showNetworkGate && !showHostStartError && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)", "black"]}
            className="absolute inset-0 -top-10"
          />
          {lobby.isHost ? (
            <PrimaryButton
              title="LET'S GO"
              subtitle="Next you will choose names, pictures and coins before the match starts."
              onPress={lobby.handleOpenSetup}
              disabled={lobby.connectionStatus !== "HOSTING"}
            />
          ) : (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="overflow-hidden rounded-[28px]"
            >
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
            </MotiView>
          )}
        </View>
      )}

      <ApIsolationModal
        visible={lobby.showApIsolation}
        onClose={() => lobby.setShowApIsolation(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbyScreen;
