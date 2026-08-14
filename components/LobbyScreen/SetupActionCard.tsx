import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Users, Share2 } from "lucide-react-native";

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
  isSolo?: boolean;
}

export const SetupActionCard: React.FC<SetupActionCardProps> = ({
  lobby,
  onOpenShare,
  isInviteLoading = false,
  isSolo = false,
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
  const connectionOk =
    isSolo ||
    lobby.connectionStatus === "HOSTING" ||
    lobby.connectionStatus === "IDLE";

  const isBlockedByDuplicates = hasDuplicateNames || hasDuplicateAvatars;
  const canStart =
    connectionOk &&
    !isBlockedByDuplicates &&
    (isSolo || humanCount >= 2);

  const isHotspotInitializing =
    lobby.connectionStatus === "HOSTING" && !lobby.hostIp && !lobby.roomCode;

  const getSubtitle = () => {
    if (!isSolo && humanCount < 2) return "add 1 more human..";
    if (hasDuplicateNames) return "All players must have unique names";
    if (hasDuplicateAvatars) return "All players must have unique avatars";
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
              {canShare && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onOpenShare();
                  }}
                  disabled={isInviteLoading}
                >
                  {({ pressed }) => {
                    const showSpinner =
                      isInviteLoading || isHotspotInitializing;
                    const label =
                      isInviteLoading || isHotspotInitializing
                        ? "Preparing local room..."
                        : "Invite Players";
                    return (
                      <MotiView
                        animate={{
                          scale: pressed && !showSpinner ? 0.97 : 1,
                          opacity: showSpinner ? 0.7 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 15,
                          stiffness: 200,
                        }}
                        className="overflow-hidden rounded-[28px]"
                      >
                        {!showSpinner && (
                          <View className="absolute inset-0 rounded-[28px] bg-emerald-500/30 blur-xl" />
                        )}

                        <LinearGradient
                          colors={
                            showSpinner
                              ? ["rgba(16,185,129,0.2)", "rgba(5,150,105,0.1)"]
                              : [
                                  "rgba(16,185,129,0.35)",
                                  "rgba(5,150,105,0.2)",
                                  "rgba(0,0,0,0.25)",
                                ]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="rounded-[28px] border border-emerald-400/30"
                        >
                          <View className="flex-row items-center justify-center gap-3 py-4 px-6">
                            {showSpinner ? (
                              <ActivityIndicator size="small" color="#6ee7b7" />
                            ) : (
                              <View className="items-center justify-center rounded-full bg-emerald-500/20 p-2">
                                <Users size={rf(2.2)} color="#6ee7b7" />
                              </View>
                            )}
                            <View className="flex-row items-center gap-2">
                              <Text
                                style={{ fontSize: rf(1.6) }}
                                className={`font-main-bold uppercase tracking-[3px] ${
                                  showSpinner
                                    ? "text-emerald-300/60"
                                    : "text-emerald-100"
                                }`}
                              >
                                {label}
                              </Text>
                              {!showSpinner && (
                                <Share2
                                  size={rf(1.4)}
                                  color="#6ee7b7"
                                  strokeWidth={2.5}
                                />
                              )}
                            </View>
                          </View>
                        </LinearGradient>
                      </MotiView>
                    );
                  }}
                </Pressable>
              )}
              {lobby.isHost &&
                !isSolo &&
                (isInviteLoading ||
                  isHotspotInitializing) && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden rounded-xl border border-white/5 bg-white/5"
                  >
                    <View className="p-3">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name="wifi-outline"
                          size={rf(1.6)}
                          color="#93c5fd"
                        />
                        <Text
                          style={{ fontSize: rf(1.3) }}
                          className="flex-1 font-main-md text-white/70"
                        >
                          Searching for network... Please make sure your hotspot or WiFi is ON.
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                )}

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
