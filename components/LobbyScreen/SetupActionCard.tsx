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

interface SetupActionCardProps {
  lobby: LobbyState;
  onOpenShare: () => void;
  isInviteLoading?: boolean;
}

export const SetupActionCard: React.FC<SetupActionCardProps> = ({
  lobby,
  onOpenShare,
  isInviteLoading = false,
}) => {
  const playerNames = lobby.players.map((p) => p.name.trim().toLowerCase());
  const hasDuplicateNames = new Set(playerNames).size !== playerNames.length;
  const playerAvatars = lobby.players.map((p) => p.avatarId);
  const hasDuplicateAvatars =
    new Set(playerAvatars).size !== playerAvatars.length;

  const isBlockedByDuplicates = hasDuplicateNames || hasDuplicateAvatars;
  const canStart =
    lobby.connectionStatus === "HOSTING" &&
    !isBlockedByDuplicates &&
    lobby.players.length > 1;

  // Is the host still bootstrapping (IP not yet resolved)?
  const isHotspotInitializing =
    lobby.connectionStatus === "HOSTING" &&
    !lobby.hostIp &&
    !lobby.roomCode;

  const getSubtitle = () => {
    if (lobby.connectionStatus === "ERROR") return "Connection Error — tap retry";
    if (lobby.connectionStatus === "IDLE" || lobby.connectionStatus === "CONNECTING")
      return "Setting up room...";
    if (isHotspotInitializing) return "Detecting network interface...";
    if (lobby.players.length <= 1) return "Need at least 2 players";
    if (hasDuplicateNames) return "All players must have unique names";
    if (hasDuplicateAvatars) return "All players must have unique avatars";
    return "Ready to play";
  };

  const canShare = lobby.isHost;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="overflow-hidden rounded-[32px]"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
        className="border border-white/10 p-6"
      >
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
                  const showSpinner = isInviteLoading || isHotspotInitializing;
                  const label = isInviteLoading
                    ? "Detecting Network..."
                    : isHotspotInitializing
                    ? "Initializing Hotspot..."
                    : "Invite Players";
                  return (
                    <MotiView
                      animate={{ scale: pressed && !showSpinner ? 0.98 : 1, opacity: showSpinner ? 0.7 : 1 }}
                      className="flex-row items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 py-4"
                    >
                      {showSpinner ? (
                        <ActivityIndicator size="small" color="#93c5fd" />
                      ) : (
                        <Ionicons name="share-outline" size={rf(2)} color="#93c5fd" />
                      )}
                      <Text
                        style={{ fontSize: rf(1.5) }}
                        className={`font-main-bold uppercase tracking-[2px] ${showSpinner ? "text-blue-300/60" : "text-blue-200"}`}
                      >
                        {label}
                      </Text>
                    </MotiView>
                  );
                }}
              </Pressable>
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
      </LinearGradient>
    </MotiView>
  );
};
