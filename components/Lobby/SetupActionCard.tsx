import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";

interface SetupActionCardProps {
  lobby: LobbyState;
  onOpenShare: () => void;
}

export const SetupActionCard: React.FC<SetupActionCardProps> = ({
  lobby,
  onOpenShare,
}) => {
  const joinedCount = lobby.players.filter((player) => !player.isBot).length;
  const canShare = Boolean(lobby.qrPayload) && !lobby.isLocalOnlyLobby;

  if (!lobby.isHost) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="overflow-hidden rounded-[30px]"
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[30px] border border-white/10 p-5"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
            Almost Ready
          </Text>
          <Text className="mt-3 font-main-bold text-xl text-white">
            Waiting for the host
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/60">
            You can still change your name and picture. The host picks the
            settings, coins and start time.
          </Text>
        </LinearGradient>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="overflow-hidden rounded-[30px]"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
          Match Start
        </Text>
        <Text className="mt-3 font-main-bold text-xl text-white">
          {joinedCount} player{joinedCount === 1 ? "" : "s"} ready
        </Text>
        <Text className="mt-2 text-sm leading-5 text-white/60">
          Pick the coins to start the match. Everyone keeps their final picture
          and name from this screen.
        </Text>

        {canShare ? (
          <Pressable
            onPress={onOpenShare}
            className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 active:bg-white/10"
          >
            <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
              Show Late Join QR
            </Text>
          </Pressable>
        ) : (
          <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <Text className="text-center text-sm leading-5 text-white/60">
              {lobby.isLocalOnlyLobby
                ? "Local room only right now. Allow permissions later if you want to invite friends."
                : "Share code is getting ready."}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => lobby.setIsBettingModalVisible(true)}
          disabled={lobby.connectionStatus !== "HOSTING"}
          className="mt-4 overflow-hidden rounded-[28px] active:scale-95"
        >
          <LinearGradient
            colors={
              lobby.connectionStatus === "HOSTING"
                ? ["#2563EB", "#4F46E5"]
                : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
            }
            className="rounded-[28px] border border-white/10 px-5 py-5"
          >
            <Text
              className={`text-center font-main-bold text-lg ${
                lobby.connectionStatus === "HOSTING"
                  ? "text-white"
                  : "text-white/45"
              }`}
            >
              Choose Pot & Start
            </Text>
            <Text
              className={`mt-1 text-center text-xs leading-5 ${
                lobby.connectionStatus === "HOSTING"
                  ? "text-white/75"
                  : "text-white/25"
              }`}
            >
              Host only
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </MotiView>
  );
};
