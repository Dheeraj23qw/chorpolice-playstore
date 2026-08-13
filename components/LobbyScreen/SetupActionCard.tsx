import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { LobbyState } from "./types";
import { PrimaryButton } from "./PrimaryButton";
import { LanDebugPanel } from "./LanDebugPanel";
import { HotspotTroubleshootingCard } from "./HotspotTroubleshootingCard";

interface SetupActionCardProps {
  lobby: LobbyState;
  onOpenShare: () => void;
  isInviteLoading?: boolean;
  networkStatus?: string;
  networkContext?: string;
  networkErrorMessage?: string | null;
  isSolo?: boolean;
  isLanModeRequested?: boolean;
}

export const SetupActionCard: React.FC<SetupActionCardProps> = ({
  lobby,
  onOpenShare,
  isInviteLoading = false,
  networkStatus,
  networkContext,
  networkErrorMessage,
  isSolo = false,
  isLanModeRequested = false,
}) => {
  const [showHotspotFix, setShowHotspotFix] = React.useState(false);
  const [showDebug, setShowDebug] = React.useState(false);

  React.useEffect(() => {
    if (
      isInviteLoading ||
      (lobby.connectionStatus === "HOSTING" && !lobby.hostIp)
    ) {
      const timer = setTimeout(() => setShowHotspotFix(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowHotspotFix(false);
    }
  }, [isInviteLoading, lobby.connectionStatus, lobby.hostIp]);
  const playerNames = lobby.players.map((p) => p.name.trim().toLowerCase());
  const hasDuplicateNames = new Set(playerNames).size !== playerNames.length;
  const playerAvatars = lobby.players.map((p) => p.avatarId);
  const hasDuplicateAvatars =
    new Set(playerAvatars).size !== playerAvatars.length;

  const humanCount = lobby.players.filter((p) => !p.isBot).length;
  const permissionsOk =
    isSolo || networkStatus === "granted" || !isLanModeRequested;
  const connectionOk =
    isSolo ||
    lobby.connectionStatus === "HOSTING" ||
    lobby.connectionStatus === "IDLE";

  const isBlockedByDuplicates = hasDuplicateNames || hasDuplicateAvatars;
  const canStart =
    connectionOk &&
    !isBlockedByDuplicates &&
    (isSolo || humanCount >= 2) &&
    permissionsOk;

  // Is the host still bootstrapping (IP not yet resolved)?
  const isHotspotInitializing =
    lobby.connectionStatus === "HOSTING" && !lobby.hostIp && !lobby.roomCode;

  const getSubtitle = () => {
    if (!isSolo && humanCount < 2) return "add 1 more human..";
    if (hasDuplicateNames) return "All players must have unique names";
    if (hasDuplicateAvatars) return "All players must have unique avatars";
    if (!isSolo && isLanModeRequested && networkStatus !== "granted")
      return "Grant all permissions to start";
    return "Ready to play";
  };

  const canShare = lobby.isHost && !isSolo;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="overflow-hidden rounded-[32px]"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
        className="border border-white/10"
      >
        <View className="p-6">
          {lobby.isHost && (
            <View className="gap-4">
              {/* Invite / Share Section */}
              {canShare && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onOpenShare();
                  }}
                  disabled={isInviteLoading}
                >
                  {({ pressed }) => {
                    // Show spinner when: parent is polling for IP, OR hotspot interface not yet ready
                    const showSpinner =
                      isInviteLoading || isHotspotInitializing;
                    const label =
                      isInviteLoading || isHotspotInitializing
                        ? "Preparing local room..."
                        : "Invite Players";
                    return (
                      <MotiView
                        animate={{
                          scale: pressed && !showSpinner ? 0.98 : 1,
                          opacity: showSpinner ? 0.7 : 1,
                        }}
                        className="rounded-2xl border border-blue-500/30 bg-blue-500/10"
                      >
                        <View className="flex-row items-center justify-center gap-2 py-4">
                          {showSpinner ? (
                            <ActivityIndicator size="small" color="#93c5fd" />
                          ) : (
                            <Ionicons
                              name="share-outline"
                              size={rf(2)}
                              color="#93c5fd"
                            />
                          )}
                          <Text
                            style={{ fontSize: rf(1.5) }}
                            className={`font-main-bold uppercase tracking-[2px] ${showSpinner ? "text-blue-300/60" : "text-blue-200"}`}
                          >
                            {label}
                          </Text>
                        </View>
                      </MotiView>
                    );
                  }}
                </Pressable>
              )}
              {/* 🚀 LAN GUIDANCE: Only shown if Invite was clicked but IP/Server not ready */}
              {lobby.isHost &&
                !isSolo &&
                (isInviteLoading ||
                  isHotspotInitializing ||
                  (networkStatus && networkStatus !== "granted")) && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden rounded-xl border border-white/5 bg-white/5"
                  >
                    <View className="p-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name={
                            networkStatus === "denied"
                              ? "lock-closed-outline"
                              : "wifi-outline"
                          }
                          size={rf(1.6)}
                          color={
                            networkStatus === "denied" ? "#ef4444" : "#93c5fd"
                          }
                        />
                        <Text
                          style={{ fontSize: rf(1.3) }}
                          className="flex-1 font-main-md text-white/70"
                        >
                          {networkStatus === "denied"
                            ? "Permission required for LAN play."
                            : "Searching for network... Please make sure your hotspot or WiFi is ON."}
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                )}

              {/* Start Game Section */}
              <PrimaryButton
                title="Start Match"
                subtitle={getSubtitle()}
                disabled={!canStart}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  lobby.setIsBettingModalVisible(true);
                }}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </MotiView>
  );
};
