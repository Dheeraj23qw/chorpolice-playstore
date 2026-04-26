import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";

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
  const hasDuplicateAvatars = new Set(playerAvatars).size !== playerAvatars.length;

  const isBlockedByDuplicates = hasDuplicateNames || hasDuplicateAvatars;

  const canStart =
    lobby.connectionStatus === "HOSTING" && !isBlockedByDuplicates;

  const getSubtitle = () => {
    if (lobby.connectionStatus === "ERROR") return "Connection Error";
    if (lobby.connectionStatus !== "HOSTING") return "Waiting for host...";
    if (hasDuplicateNames) return "All players must have unique names";
    if (hasDuplicateAvatars) return "All players must have unique avatars";
    return "Begin match instantly";
  };

  const canShare = !!lobby.qrPayload && !lobby.isLocalOnlyLobby;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    lobby.setIsBettingModalVisible(true);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenShare();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", damping: 16 }}
      className="overflow-hidden rounded-[30px]"
    >
      <View className="absolute inset-0 rounded-[30px] bg-indigo-500/10 blur-2xl" />

      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
              Lobby Status
            </Text>

            <Text className="mt-1 font-main-bold text-xl text-white">
              {lobby.players.length} Players Ready
            </Text>
          </View>

          <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
            <Text className="text-[10px] uppercase tracking-[2px] text-emerald-200">
              Ready
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text className="mt-3 text-sm leading-5 text-white/60">
          Start the game anytime. One player is enough, or wait for friends.
        </Text>

        {/* SHARE/INVITE BUTTON (Host Only) */}
        {canShare && lobby.isHost && (
          <Pressable onPress={handleShare}>
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed ? 0.97 : 1 }}
                className="mt-4 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["rgba(59,130,246,0.25)", "rgba(37,99,235,0.1)"]}
                  className="rounded-2xl border border-blue-400/20 px-4 py-4"
                >
                  <Text className="text-center font-main-bold uppercase tracking-[2px] text-blue-200">
                    Invite Players
                  </Text>
                </LinearGradient>
              </MotiView>
            )}
          </Pressable>
        )}

        {/* START BUTTON (Host Only) */}
        {lobby.isHost && (
          <View className="mt-5">
            <PrimaryButton
              title="Start Game"
              subtitle={getSubtitle()}
              disabled={!canStart}
              onPress={handleStart}
            />
          </View>
        )}
      </LinearGradient>
    </MotiView>
  );
};
