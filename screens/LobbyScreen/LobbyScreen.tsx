import React, { useEffect, useMemo, useCallback } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";

import {
  ApIsolationModal,
  LobbyBackdrop,
  LobbyHeader,
  PrimaryButton,
} from "@/components/LobbyScreen";

import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import VideoPlayerComponent from "@/components/IntroVideo";
import { LobbyContent } from "./LobbyContent";

const LobbyScreen = ({
  forcedMode,
  routeGameType,
  requireLanReady = false,
}: any) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { step, status, retry, errorMessage, openSettings } =
    useNetworkPermissions(requireLanReady);

  /* ---------------- STABLE LOBBY HOOK ---------------- */
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

  /* ---------------- SAFE NAVIGATION EFFECT ---------------- */
  useEffect(() => {
    if (lobby?.lobbyStage !== "setup") return;

    router.replace({
      pathname: "/lobby-setup",
      params: {
        gameType: lobby.gameType,
        isHost: String(lobby.isHost),
      },
    });
  }, [lobby?.lobbyStage, lobby?.gameType, lobby?.isHost, router]);

  /* ---------------- COPY FUNCTION (STABLE) ---------------- */
  const copyRoomCode = useCallback(async () => {
    if (!lobby?.roomCode) return;

    await Clipboard.setStringAsync(lobby.roomCode);
    toast.success("Room Code Copied", lobby.roomCode);
  }, [lobby?.roomCode]);

  /* ---------------- MEMOIZED CONTENT ---------------- */
  const lobbyContent = useMemo(() => {
    return (
      <LobbyContent
        lobby={lobby}
        requireLanReady={requireLanReady}
        status={status}
        step={step}
        errorMessage={errorMessage}
        retry={retry}
        openSettings={openSettings}
        copyRoomCode={copyRoomCode}
      />
    );
  }, [
    lobby,
    requireLanReady,
    status,
    step,
    errorMessage,
    retry,
    openSettings,
    copyRoomCode,
  ]);

  /* ---------------- TRANSITION STATE ---------------- */
  if (lobby.isTransitioning) {
    return <VideoPlayerComponent index={1} />;
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
          {/* HEADER */}
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

          {/* CONTENT */}
          {lobbyContent}
        </View>
      </ScrollView>

      {/* BOTTOM CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "black"]}
          className="absolute inset-0 -top-10"
        />

        {lobby.isHost ? (
          <PrimaryButton
            title="LET'S GO"
            subtitle="Setup names and tokens next."
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
              Stay here. The host will start the session soon.
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
