import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, AppState } from "react-native";
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
import { OfflineRulesModal } from "@/modal/OfflineRulesModal";
import { PermissionGuardian } from "@/components/PermissionGuardian";
import { checkAppUpdate } from "@/utils/versionCheck";
import { UpdateAppModal } from "@/modal/UpdateAppModal";
import {
  getUpdateDismissCount,
  incrementUpdateDismissCount,
  getLobbyHelpShown,
  setLobbyHelpShown,
  getSoloTutorialShown,
  setSoloTutorialShown,
} from "@/storage/appStorage";
import { rf } from "@/utils/responsive";
import { NetworkStatusBanner } from "@/components/LobbyScreen/NetworkStatusBanner";
import { FloatingDebugToggle } from "@/components/LobbyScreen/FloatingDebugToggle";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";

type UIState = "normal" | "betting" | "share" | "apIsolation" | "help" | "permissions";

const LobbySetupScreen = ({
  forcedMode,
  routeGameType,
}: any) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // SOLO: entered from single-player → hide all multiplayer UI/permissions.
  const isSolo = params.solo === "1" || params.solo === "true";

  const [isLanModeRequested, setIsLanModeRequested] = useState(false);

  const { step, status, retry, errorMessage, openSettings, networkContext } =
    useNetworkPermissions({ 
      enabled: isLanModeRequested && !isSolo,
      requireWifiIpAddress: true,
      requireAndroidWifiPermissions: true
    });

  // ✅ HOTSPOT FIX: Re-check network whenever screen is focused (ONLY if LAN is active)
  useFocusEffect(
    useCallback(() => {
      if (isLanModeRequested) {
        console.log("[LobbySetup] 🎯 Screen focused, re-checking network status...");
        void retry(true);
      }
    }, [retry, isLanModeRequested])
  );

  // ✅ APP RESUME FIX: Also re-check when app returns from background (e.g. from hotspot settings)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && isLanModeRequested) {
        console.log("[LobbySetup] 🚀 App resumed, re-triggering network detection...");
        void retry(true);
      }
    });
    return () => subscription.remove();
  }, [retry, isLanModeRequested]);

  const lobby = useLobbyLogic(
    router,
    {
      ...params,
      gameType: routeGameType || params.gameType,
      isHost: forcedMode ? String(forcedMode === "host") : params.isHost,
    },
    forcedMode,
    isLanModeRequested, // Only start LAN logic if requested
    isSolo, // Solo mode: no LAN broadcasts, no betting, silent bot joins
  ) as LobbyState;

  const [uiState, setUiState] = useState<UIState>("normal");
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(false);
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(!lobby.isHost);
  const [showDebug, setShowDebug] = useState(false);
  


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
  
  // ✨ FIRST TIME HELP: Auto-show help (solo tutorial) if not shown before
  useEffect(() => {
    if (isSolo) {
      if (!getSoloTutorialShown()) {
        setUiState("help");
      }
    } else if (!getLobbyHelpShown()) {
      setUiState("help");
    }
  }, [isSolo]);


  // ── Toast messages for every network state transition ──────────────────
  const prevStatusRef = React.useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === status) return; // no change

    console.log(
      `[LobbySetup] 📶 Status transition: ${prev} → ${status} (networkCtx=${networkContext})`,
    );

    if (status === "granted" && prev !== "pending") {
      // Only show if recovering from an error state (not initial grant)
      if (prev === "no_wifi" || prev === "denied" || prev === "error") {
        toast.success(
          networkContext === "hotspot_host"
            ? "Room is active 📡"
            : "Ready to play! ✓",
          networkContext === "hotspot_host"
            ? "Your room is open. Ask friends to join!"
            : "Everything is set. You can now invite friends."
        );
      }
    } else if (status === "no_wifi" && networkContext === "none") {
      toast.error(
        "No Network",
        lobby.isHost
          ? "Enable your Mobile Hotspot — no internet needed."
          : "Connect to the host's WiFi or Hotspot."
      );
    } else if (status === "denied") {
      toast.error(
        "Permission Needed",
        "Location permission is required to find nearby players."
      );
    }
  }, [status, networkContext]);

  // ── Toast message when joiner fully connects ──────────────────
  const prevConnectionStatusRef = React.useRef(lobby.connectionStatus);
  useEffect(() => {
    const prev = prevConnectionStatusRef.current;
    prevConnectionStatusRef.current = lobby.connectionStatus;
    
    if (prev === "CONNECTING" && lobby.connectionStatus === "CONNECTED" && !lobby.isHost) {
      toast.success("Connected! 🎉", "You have fully joined the lobby.");
    }
  }, [lobby.connectionStatus, lobby.isHost]);

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
      isLanModeRequested &&
      status !== "granted" &&
      !lobby.isLocalOnlyLobby &&
      lobby.connectionStatus !== "HOSTING";
    const permissionPending = status === "pending";
    const hostError =
      lobby.isHost &&
      lobby.connectionStatus === "ERROR" &&
      !!lobby.errorMessage;

    return { permissionBlocked, permissionPending, hostError };
  }, [status, isLanModeRequested, lobby.isLocalOnlyLobby, lobby.connectionStatus, lobby.isHost, lobby.errorMessage]);

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

  const [isInviteLoading, setIsInviteLoading] = useState(false);

  // ✅ FIX: Use a ref so async callbacks always read the LIVE qrPayload,
  // not the stale value captured when handleOpenInvite was created.
  const qrPayloadRef = useRef(lobby.qrPayload);
  useEffect(() => {
    qrPayloadRef.current = lobby.qrPayload;
  }, [lobby.qrPayload]);

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const networkContextRef = useRef(networkContext);
  useEffect(() => {
    networkContextRef.current = networkContext;
  }, [networkContext]);

  const handleOpenInvite = useCallback(async () => {
    if (isInviteLoading) return;

    // 🚀 NEW: Activate LAN mode on demand if not already active
    if (!isLanModeRequested) {
      console.log("[LobbySetup] 🚀 User requested LAN mode via Invite click.");
      setIsLanModeRequested(true);
      // The useNetworkPermissions hook will now start its flow automatically.
      // We'll wait for it in the polling block below.
    }

    console.log(
      `[LobbySetup] 🎯 Invite tapped: status=${statusRef.current}, ` +
      `qrPayload=${qrPayloadRef.current ? "YES" : "EMPTY"}, ` +
      `networkCtx=${networkContextRef.current}, isHost=${lobby.isHost}`,
    );

    // 1️⃣ Check for app update first
    if (lobby.isHost) {
      const update = await checkAppUpdate();
      const dismissCount = getUpdateDismissCount(update.latestVersion);
      if (update.isAvailable && dismissCount < 2) {
        console.log(`[LobbySetup] 📦 Update available (${dismissCount}/2 dismissed): ${update.latestVersion}`);
        setUpdateInfo({ url: update.updateUrl, version: update.latestVersion });
        setShowUpdateModal(true);
        return;
      }
    }

    // 2️⃣ Read LIVE permission status from ref (not stale closure)
    if (statusRef.current !== "granted") {
      console.log(`[LobbySetup] 🔒 Permissions not granted (${statusRef.current}) → showing PermissionGuardian`);
      setUiState("permissions");
      return;
    }

    // 3️⃣ Already have a QR payload → open share immediately (read from ref)
    if (qrPayloadRef.current) {
      console.log(`[LobbySetup] ✅ QR payload ready → opening share modal`);
      setUiState("share");
      return;
    }

    // 4️⃣ No QR yet — hotspot may still be initializing. Poll for IP.
    console.log(`[LobbySetup] ⏳ No QR payload yet → starting 8s poll + retrying host bootstrap`);
    setIsInviteLoading(true);
    toast.info("Setting up...", "Preparing your room for friends.");

    // Re-trigger hosting in case it failed silently
    lobby.handleRetryHosting();

    // Poll for up to 8 seconds (every 500ms), reading LIVE ref value each tick.
    let resolved = false;
    let pollTicks = 0;
    await new Promise<void>((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        pollTicks++;
        if (qrPayloadRef.current && !resolved) {
          resolved = true;
          console.log(`[LobbySetup] ✅ QR appeared after ${pollTicks * 500}ms`);
          clearInterval(interval);
          resolve();
          return;
        }
        if (Date.now() - startTime >= 8000) {
          console.log(`[LobbySetup] ❌ QR poll timeout after 8s (${pollTicks} ticks)`);
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });

    setIsInviteLoading(false);

    // 5️⃣ Check ref again after polling
    if (qrPayloadRef.current) {
      console.log(`[LobbySetup] ✅ Opening share modal (QR resolved)`);
      setUiState("share");
    } else {
      const ctx = networkContextRef.current;
      console.log(`[LobbySetup] ❌ No QR after 8s. networkCtx=${ctx}`);
      toast.error(
        "Couldn't create room",
        ctx === "none"
          ? "Please turn on your Hotspot or connect to WiFi and try again."
          : "Something went wrong while setting up the room. Please retry.",
        5000,
      );
    }
  }, [isInviteLoading, lobby.isHost, lobby.handleRetryHosting]);

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
          pointerEvents={isBlockingUI ? "none" : "auto"}
          style={{ flex: 1 }}
        >
          <View className="flex-1">
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
                      onReportPress={isSolo ? undefined : () => router.push("/report-bug")}
                      rightIcon={isSolo ? "book-outline" : "help-buoy-outline"}
                      rightLabel={isSolo ? "Rules" : undefined}
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
                contentContainerStyle={{ paddingTop: 28, paddingBottom: 20 }}
              >
                {/* 🚀 NETWORK BANNER — shown only when LAN is active */}
                {isLanModeRequested && (
                  <View className="mb-4">
                    <NetworkStatusBanner 
                      status={status} 
                      networkContext={networkContext}
                      errorMessage={errorMessage}
                      isHost={lobby.isHost}
                      onRetry={() => retry(true)}
                      onOpenSettings={openSettings}
                    />
                  </View>
                )}
                  <AnimatePresence>
                    {!isPlayersListOpen && (
                      <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <View className="mb-6">
                      <Text 
                        style={{ fontSize: rf(3.5) }}
                        className="font-main-bold text-white"
                      >
                        {lobby.isHost ? "Lobby Setup" : "Lobby Setup"}
                      </Text>
                      </View>
                    </MotiView>
                  )}
                </AnimatePresence>

                {/* 🚀 GRACEFUL: No longer blocking the UI.
                    We let the user see the lobby. They will only be prompted when they click "Invite Players". */}
                  <>
                    {/* For joiners: always show profile card regardless of list state.
                        For host: hide it when the players list is expanded. */}
                    <AnimatePresence>
                      {(!isPlayersListOpen || !lobby.isHost) && (
                        <MotiView>
                          <View className="mb-8">
                          <PlayerProfileCard
                            lobby={lobby}
                            getAvatarSource={getAvatarSource}
                            showGameSettings={lobby.isHost}
                          />
                          </View>
                        </MotiView>
                      )}
                    </AnimatePresence>
 
                    <PlayersList
                      lobby={lobby}
                      getAvatarSource={getAvatarSource}
                      onOpenChange={setIsPlayersListOpen}
                    />
                  </>
                </ScrollView>

              {lobby.isHost && (
                <View className="pb-6 pt-2">
                  <SetupActionCard
                    lobby={lobby}
                    onOpenShare={handleOpenInvite}
                    isInviteLoading={isInviteLoading}
                    networkStatus={isLanModeRequested ? status : undefined}
                    networkContext={networkContext}
                    networkErrorMessage={errorMessage}
                    isSolo={isSolo}
                  />
                </View>
              )}
            </View>
          </SafeAreaView>
          </View>
        </MotiView>

        {/* 🔥 NEW: overlay (no logic touched) */}
        <AnimatePresence>
          {isBlockingUI && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 200 }}
              pointerEvents="none"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
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
        minPlayerCoins={(lobby as any).minPlayerCoins ?? 0}
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

      {isSolo ? (
        <OfflineRulesModal
          visible={uiState === "help"}
          onClose={() => {
            setSoloTutorialShown(true);
            setUiState("normal");
          }}
        />
      ) : (
        <MultiplayerHelpModal
          visible={uiState === "help"}
          onClose={() => {
            setLobbyHelpShown(true);
            setUiState("normal");
          }}
        />
      )}


      <UpdateAppModal
        isVisible={showUpdateModal}
        onClose={() => {
          // If the user manually closes/skips, respect it for this version
          incrementUpdateDismissCount(updateInfo.version);
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
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
          >
            <View className="flex-1">
             <PermissionGuardian 
                onAllGranted={() => {
                  console.log(`[LobbySetup] 🔓 PermissionGuardian → all granted. Syncing status + retrying host bootstrap.`);
                  setAllPermissionsGranted(true);
                  // ✅ FIX: Call retry() so useNetworkPermissions syncs to "granted".
                  // Without this, status stays "denied" even after the user grants,
                  // causing the next Invite tap to show the permission screen again.
                  void retry();
                  lobby.handleRetryHosting();
                  setUiState("share");
                }} 
                onSkip={() => {
                  console.log(`[LobbySetup] ⏭️ PermissionGuardian → user skipped permissions`);
                  setUiState("normal");
                }}
                title="Invite Friends"
                description="We need Location permissions to generate a room code and help your friends find you."
              />
            </View>
          </MotiView>
        )}
      </AnimatePresence>
      
      {/* 🛠 DEBUG OVERLAY (Dev Only) */}
      {__DEV__ && (
        <>
          <FloatingDebugToggle 
            isOpen={showDebug} 
            onToggle={() => setShowDebug(!showDebug)} 
          />
          
          <AnimatePresence>
            {showDebug && (
              <MotiView
                from={{ opacity: 0, translateY: 100 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 100 }}
              >
                <View className="absolute bottom-20 left-6 right-6 z-[998]">
                <LanDebugPanel />
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </>
      )}
    </View>
  );
};

export default LobbySetupScreen;
