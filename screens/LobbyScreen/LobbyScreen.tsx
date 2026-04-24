import React, { useCallback, useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";

import {
  ApIsolationModal,
  HandshakeStatus,
  HostInviteCard,
  HostStartErrorCard,
  LobbyBackdrop,
  LobbyHeader,
  PermissionFallbackCard,
  PlayersList,
  PrimaryButton,
} from "@/components/LobbyScreen";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import VideoPlayerComponent from "@/components/IntroVideo";

const LobbyScreen = ({
  forcedMode,
  routeGameType,
  requireLanReady = false,
}: any) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { step, status, retry, errorMessage, openSettings } =
    useNetworkPermissions(requireLanReady);

  const lobby = useLobbyLogic(
    router,
    {
      ...params,
      gameType: routeGameType || params.gameType,
      isHost: forcedMode ? String(forcedMode === "host") : params.isHost,
    },
    forcedMode,
    !requireLanReady || status === "granted",
  );

  useEffect(() => {
    if (lobby.lobbyStage === "setup") {
      router.replace({
        pathname: "/lobby-setup",
        params: { gameType: lobby.gameType, isHost: String(lobby.isHost) },
      } as any);
    }
  }, [lobby.lobbyStage]);

  const copyRoomCode = async () => {
    if (lobby.roomCode) {
      await Clipboard.setStringAsync(lobby.roomCode);
      toast.success("Room Code Copied", lobby.roomCode);
    }
  };

  const renderContent = () => {
    if (
      requireLanReady &&
      status !== "granted" &&
      !lobby.isLocalOnlyLobby &&
      lobby.connectionStatus !== "HOSTING"
    ) {
      return status === "pending" ? (
        <HandshakeStatus
          step={step === "idle" ? "checking_wifi" : step}
          status="loading"
          discoveredCount={0}
          errorMessage={errorMessage}
          isHost={!!lobby.isHost}
          onRetry={retry}
          onOpenSettings={openSettings}
          wifiSSID="Secure LAN"
        />
      ) : (
        <PermissionFallbackCard
          isHost={!!lobby.isHost}
          onPrimary={status === "denied" ? openSettings : retry}
          onSecondary={
            lobby.isHost ? lobby.handleContinueWithReadySeats : undefined
          }
          primaryLabel={status === "denied" ? "Open Settings" : "Try Again"}
          message={
            errorMessage ||
            "Nearby Wi-Fi and location permission help find local rooms."
          }
        />
      );
    }

    if (
      lobby.isHost &&
      lobby.connectionStatus === "ERROR" &&
      lobby.errorMessage
    ) {
      return (
        <HostStartErrorCard
          message={lobby.errorMessage}
          onRetry={lobby.handleRetryHosting}
          retrying={lobby.isBootstrappingHost}
          onUseReadySeats={lobby.handleContinueWithReadySeats}
        />
      );
    }

    return (
      <View>
        {lobby.isHost && (
          <HostInviteCard lobby={lobby} onCopyRoomCode={copyRoomCode} />
        )}
        <PlayersList
          lobby={lobby}
          getAvatarSource={(id: number) =>
            playerImages[id]?.src ||
            require("@/assets/images/chorsipahi/kid1.png")
          }
        />
      </View>
    );
  };

  if (lobby.isTransitioning) return <VideoPlayerComponent index={1} />;

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
                ? "Invite friends first, then move everyone to setup."
                : "Wait for the host to tap Let's Go."}
            </Text>
          </MotiView>
          {renderContent()}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "black"]}
          className="absolute inset-0 -top-10"
        />
        {lobby.isHost ? (
          <PrimaryButton
            title="LET'S GO"
            subtitle="Setup names and coins next."
            onPress={lobby.handleOpenSetup}
            disabled={lobby.connectionStatus !== "HOSTING"}
          />
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <Text className="text-center font-main-bold text-lg text-white">
              Waiting for the host
            </Text>
            <Text className="mt-1 text-center text-xs text-white/65">
              Stay here. The host will start the setup soon.
            </Text>
          </MotiView>
        )}
      </View>

      <ApIsolationModal
        visible={lobby.showApIsolation}
        onClose={() => lobby.setShowApIsolation(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LobbyScreen;
