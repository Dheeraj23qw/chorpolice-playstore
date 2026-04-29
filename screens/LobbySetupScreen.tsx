import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApIsolationModal } from "@/components/LobbyScreen/ApIsolationModal";
import { LateJoinQrModal } from "@/modal/LateJoinQrModal";
import { LobbyBackdrop } from "@/components/LobbyScreen/LobbyBackdrop";
import { LobbyHeader } from "@/components/LobbyScreen/LobbyHeader";
import { PlayerProfileCard } from "@/components/LobbyScreen/PlayerProfileCard";
import { PlayersList } from "@/components/LobbyScreen/PlayersList";
import { SetupActionCard } from "@/components/LobbyScreen/SetupActionCard";
import {
  HandshakeStatus,
  PermissionFallbackCard,
  HostStartErrorCard,
} from "@/components/LobbyScreen";
import { LobbyState } from "@/components/LobbyScreen/types";
import { Text } from "@/components/Text";
import { toast } from "@/components/feedback/toast";
import { playerImages } from "@/constants/playerData";
import { useLobbyLogic } from "@/hooks/useLobbyLogic";
import { useNetworkPermissions } from "@/hooks/useNetworkPermissions";
import { EntryModal } from "@/modal/EntryModal";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";
import { PermissionGuardian } from "@/components/PermissionGuardian";
import { checkAppUpdate } from "@/utils/versionCheck";
import { UpdateAppModal } from "@/modal/UpdateAppModal";
import { getDismissedUpdateVersion, setDismissedUpdateVersion } from "@/storage/appStorage";

type UIState = "normal" | "betting" | "share" | "apIsolation" | "help" | "permissions";

const LobbySetupScreen = ({
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
  ) as LobbyState;

  const [uiState, setUiState] = useState<UIState>("normal");
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(false);
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(!lobby.isHost);
  
  // App Update State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ url: "", version: "" });

  const isBlockingUI = uiState !== "normal";

  useEffect(() => {
    if (lobby.isBettingModalVisible) setUiState("betting");
    else if (uiState === "betting") setUiState("normal");
  }, [lobby.isBettingModalVisible]);

  useEffect(() => {
    if (lobby.showApIsolation) setUiState("apIsolation");
  }, [lobby.showApIsolation]);

  useEffect(() => {
    if (lobby.isHost && status === "denied" && !lobby.isLocalOnlyLobby) {
      lobby.handleContinueWithReadySeats();
    }
  }, [
    lobby.isHost,
    status,
    lobby.isLocalOnlyLobby,
    lobby.handleContinueWithReadySeats,
  ]);

  const ui = useMemo(() => {
    const permissionBlocked =
      requireLanReady &&
      status !== "granted" &&
      !lobby.isLocalOnlyLobby &&
      lobby.connectionStatus !== "HOSTING";
    const permissionPending = status === "pending";
    const hostError =
      lobby.isHost &&
      lobby.connectionStatus === "ERROR" &&
      !!lobby.errorMessage;

    return { permissionBlocked, permissionPending, hostError };
  }, [requireLanReady, status, lobby]);

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

  const handleOpenInvite = useCallback(async () => {
    // 🚀 NEW: Check for app update first if host
    if (lobby.isHost) {
      const update = await checkAppUpdate();
      const dismissedVersion = getDismissedUpdateVersion();

      if (update.isAvailable && update.latestVersion !== dismissedVersion) {
        setUpdateInfo({ url: update.updateUrl, version: update.latestVersion });
        setShowUpdateModal(true);
        return;
      }
    }

    if (status !== "granted") {
      setUiState("permissions");
    } else if (!lobby.qrPayload) {
      // If we have permissions but no QR yet, try to bootstrap the host again
      lobby.handleRetryHosting();
      setUiState("share");
    } else {
      setUiState("share");
    }
  }, [status, lobby.isHost]);

  return (
    <View className="flex-1 bg-black">
      <LobbyBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <MotiView
          animate={{
            opacity: isBlockingUI ? 0.2 : 1,
            scale: isBlockingUI ? 0.95 : 1,
          }}
          transition={{ type: "timing", duration: 250 }}
          className="flex-1"
          pointerEvents={isBlockingUI ? "none" : "auto"}
        >
          <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
            <View className="h-16 justify-center">
              <AnimatePresence>
                {!isPlayersListOpen && (
                  <MotiView
                    key="full-header"
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                  >
                    <LobbyHeader
                      onBack={lobby.handleBack}
                      onReportPress={() => router.push("/report-bug")}
                      rightIcon="help-buoy-outline"
                      onRightPress={() => setUiState("help")}
                    />
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            <View className="flex-1 px-6">
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
              >
                <AnimatePresence>
                  {!isPlayersListOpen && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <Text className="font-main-bold text-3xl text-white">
                        {lobby.isHost ? "Make everyone ready" : "Lobby Setup"}
                      </Text>
                      <Text className="mt-2 text-sm text-white/50">
                        {lobby.isHost
                          ? "Customize your profile and wait for others to join."
                          : "Wait for the host to finalize game settings."}
                      </Text>
                    </MotiView>
                  )}
                </AnimatePresence>

                {ui.permissionBlocked && !lobby.isHost ? (
                  ui.permissionPending ? (
                    <HandshakeStatus
                      step={step === "idle" ? "checking_wifi" : step}
                      status="loading"
                      discoveredCount={0}
                      errorMessage={errorMessage}
                      isHost={lobby.isHost}
                      onRetry={retry}
                      onOpenSettings={openSettings}
                      wifiSSID="Secure LAN"
                    />
                  ) : (
                    <PermissionFallbackCard
                      isHost={lobby.isHost}
                      onPrimary={status === "denied" ? openSettings : retry}
                      onSecondary={
                        lobby.isHost
                          ? lobby.handleContinueWithReadySeats
                          : undefined
                      }
                      primaryLabel={
                        status === "denied" ? "Open Settings" : "Try Again"
                      }
                      message={
                        errorMessage ||
                        "Permissions needed for local discovery."
                      }
                    />
                  )
                ) : ui.hostError ? (
                  <HostStartErrorCard
                    message={lobby.errorMessage!}
                    onRetry={lobby.handleRetryHosting}
                    retrying={lobby.isBootstrappingHost}
                    onUseReadySeats={lobby.handleContinueWithReadySeats}
                  />
                ) : (
                  <>
                    {/* For joiners: always show profile card regardless of list state.
                        For host: hide it when the players list is expanded. */}
                    <AnimatePresence>
                      {(!isPlayersListOpen || !lobby.isHost) && (
                        <MotiView className="mb-8">
                          <PlayerProfileCard
                            lobby={lobby}
                            getAvatarSource={getAvatarSource}
                            showGameSettings={lobby.isHost}
                          />
                        </MotiView>
                      )}
                    </AnimatePresence>

                    <PlayersList
                      lobby={lobby}
                      getAvatarSource={getAvatarSource}
                      onOpenChange={setIsPlayersListOpen}
                    />
                  </>
                )}
              </ScrollView>

              {lobby.isHost && (
                <View className="pb-6 pt-2">
                  <SetupActionCard
                    lobby={lobby}
                    onOpenShare={handleOpenInvite}
                  />
                </View>
              )}
            </View>
          </SafeAreaView>
        </MotiView>

        {/* 🔥 NEW: overlay (no logic touched) */}
        <AnimatePresence>
          {isBlockingUI && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 200 }}
              className="absolute inset-0 z-40"
              pointerEvents="none"
            >
              <View className="absolute inset-0 bg-black/60" />
            </MotiView>
          )}
        </AnimatePresence>
      </KeyboardAvoidingView>

      {/* MODALS (unchanged) */}
      <EntryModal
        isVisible={uiState === "betting"}
        onConfirm={lobby.handleConfirmStake}
        onClose={() => {
          lobby.setIsBettingModalVisible(false);
          setUiState("normal");
        }}
        playerCount={lobby.players.length}
        minPlayerCoins={lobby.minPlayerCoins}
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

      <UpdateAppModal
        isVisible={showUpdateModal}
        onClose={() => {
          // If the user manually closes/skips, respect it for this version
          setDismissedUpdateVersion(updateInfo.version);
          setShowUpdateModal(false);
        }}
        updateUrl={updateInfo.url}
        latestVersion={updateInfo.version}
      />

      <AnimatePresence>
        {uiState === "permissions" && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100]"
          >
             <PermissionGuardian 
                onAllGranted={() => {
                  setAllPermissionsGranted(true);
                  lobby.handleRetryHosting(); // 🚀 Re-trigger hosting now that we have permissions
                  setUiState("share");
                }} 
                onSkip={() => {
                  setAllPermissionsGranted(true);
                  setUiState("share");
                }}
                title="Invite Friends"
                description="We need Location permissions to generate a room code and help your friends find you."
              />
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

export default LobbySetupScreen;
