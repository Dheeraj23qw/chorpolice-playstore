import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { OfflineRulesModal } from "@/modal/OfflineRulesModal";
import { MultiplayerHelpModal } from "@/modal/MultiplayerHelpModal";
import {
  getLobbyHelpShown,
  setLobbyHelpShown,
  getSoloTutorialShown,
  setSoloTutorialShown,
} from "@/storage/appStorage";
import { rf } from "@/utils/responsive";
import { FloatingDebugToggle } from "@/components/LobbyScreen/FloatingDebugToggle";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";

type UIState =
  "normal" | "betting" | "share" | "apIsolation" | "help" | "permissions" | "connectionHelp";

const LobbySetupScreen = ({ forcedMode, routeGameType }: any) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isSolo = params.solo === "1" || params.solo === "true";

  useEffect(() => {
    console.log(`[LOBBY_TRACE] LobbySetupScreen component rendering/mounting: forcedMode=${forcedMode}, routeGameType=${routeGameType}, isSolo=${isSolo}, params=${JSON.stringify(params)}`);
  }, [forcedMode, routeGameType, isSolo, params]);

  const [isLanModeRequested, setIsLanModeRequested] = useState(false);

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

  // Keep Android/device back semantically identical to the visible lobby Back
  // button. Without this listener, the root handler only called router.back(),
  // leaving the active LAN session in Redux and the network layer alive.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          lobby.handleBack();
          return true;
        },
      );

      return () => subscription.remove();
    }, [lobby.handleBack]),
  );

  const [uiState, setUiState] = useState<UIState>("normal");
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(!lobby.isHost);
  const [showDebug, setShowDebug] = useState(false);

  const isBlockingUI = uiState !== "normal";

  useEffect(() => {
    if (lobby.isBettingModalVisible) setUiState("betting");
    else if (uiState === "betting") setUiState("normal");
  }, [lobby.isBettingModalVisible]);

  useEffect(() => {
    if (lobby.showApIsolation) setUiState("apIsolation");
  }, [lobby.showApIsolation]);

  // ── Toast message when joiner fully connects ──────────────────
  const prevConnectionStatusRef = React.useRef(lobby.connectionStatus);
  useEffect(() => {
    const prev = prevConnectionStatusRef.current;
    prevConnectionStatusRef.current = lobby.connectionStatus;

    if (
      prev === "CONNECTING" &&
      lobby.connectionStatus === "CONNECTED" &&
      !lobby.isHost
    ) {
      toast.success("Connected! 🎉", "You have fully joined the lobby.");
    }
  }, [lobby.connectionStatus, lobby.isHost]);

  const getAvatarSource = useCallback((avatarId: number) => {
    const imgData = playerImages[avatarId];
    return imgData
      ? imgData.src
      : require("@/assets/images/chorsipahi/kid1.webp");
  }, []);

  const [isInviteLoading, setIsInviteLoading] = useState(false);

  // ✅ FIX: Use a ref so async callbacks always read the LIVE qrPayload,
  // not the stale value captured when handleOpenInvite was created.
  const qrPayloadRef = useRef(lobby.qrPayload);
  useEffect(() => {
    qrPayloadRef.current = lobby.qrPayload;
  }, [lobby.qrPayload]);

  const handleOpenInvite = useCallback(async () => {
    if (isInviteLoading) return;

    if (!isLanModeRequested) {
      console.log("[LobbySetup] 🚀 User requested LAN mode via Invite click.");
      setIsLanModeRequested(true);
    }

    console.log(
      `[LobbySetup] 🎯 Invite tapped: ` +
        `qrPayload=${qrPayloadRef.current ? "YES" : "EMPTY"}, ` +
        `isHost=${lobby.isHost}`,
    );

    if (qrPayloadRef.current) {
      console.log(`[LobbySetup] ✅ QR payload ready → opening share modal`);
      setUiState("share");
      return;
    }

    console.log(
      `[LobbySetup] ⏳ No QR payload yet → starting 8s poll + retrying host bootstrap`,
    );
    setIsInviteLoading(true);
    toast.info("Setting up...", "Preparing your room for friends.");

    lobby.handleRetryHosting();

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
          console.log(
            `[LobbySetup] ❌ QR poll timeout after 8s (${pollTicks} ticks)`,
          );
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });

    setIsInviteLoading(false);

    if (qrPayloadRef.current) {
      console.log(`[LobbySetup] ✅ Opening share modal (QR resolved)`);
      setUiState("share");
    } else {
      toast.error(
        "Couldn't create room",
        "Please turn on your Hotspot or connect to WiFi and try again.",
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
                        onReportPress={
                          isSolo ? undefined : () => router.push("/report-bug")
                        }
                        rightIcon={
                          isSolo ? "book-outline" : "help-buoy-outline"
                        }
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
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 40,
              }}
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
        isHost={lobby.isHost}
        onHelpPress={() => setUiState("connectionHelp")}
        onStartMatch={() => {
          setUiState("normal");
          lobby.setIsBettingModalVisible(true);
        }}
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
        <OfflineRulesModal
          visible={uiState === "help"}
          onClose={() => {
            setLobbyHelpShown(true);
            setUiState("normal");
          }}
        />
      )}

      <MultiplayerHelpModal
        visible={uiState === "connectionHelp"}
        onClose={() => setUiState("share")}
      />

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
