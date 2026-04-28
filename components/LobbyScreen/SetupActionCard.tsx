import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";
import { PrimaryButton } from "./PrimaryButton";

interface SetupActionCardProps {
  lobby: LobbyState;
  onOpenShare: () => void;
}

export const SetupActionCard: React.FC<SetupActionCardProps> = ({
  lobby,
  onOpenShare,
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

  const getSubtitle = () => {
    if (lobby.connectionStatus === "ERROR") return "Connection Error";
    if (lobby.connectionStatus !== "HOSTING") return "Waiting for host...";
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
            {/* Invite Section */}
            {canShare && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onOpenShare();
                }}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.98 : 1 }}
                    className="flex-row items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 py-4"
                  >
                    <Ionicons name="share-outline" size={18} color="#93c5fd" />
                    <Text className="font-main-bold uppercase tracking-[2px] text-blue-200">
                      Invite Players
                    </Text>
                  </MotiView>
                )}
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
