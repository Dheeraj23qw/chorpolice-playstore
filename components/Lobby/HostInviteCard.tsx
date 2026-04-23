import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";

interface HostInviteCardProps {
  lobby: LobbyState;
  onCopyRoomCode: () => void;
}

const QR_SIZE = 112;

export const HostInviteCard: React.FC<HostInviteCardProps> = ({
  lobby,
  onCopyRoomCode,
}) => {
  const roomCodeParts = (lobby.roomCode || "---- ----").split("-");

  if (lobby.isLocalOnlyLobby || !lobby.qrPayload) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-5 overflow-hidden rounded-[30px]"
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[30px] border border-white/10 p-5"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-amber-200">
            Ready Seats
          </Text>
          <Text className="mt-3 font-main-bold text-2xl text-white">
            Start right away
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/62">
            This room is ready for local play now. If you want to invite
            friends, allow Chor Police network permissions and stay on the same
            Wi-Fi or hotspot.
          </Text>
        </LinearGradient>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-5 overflow-hidden rounded-[30px]"
    >
      <View className="absolute inset-0 rounded-[30px] bg-indigo-500/10 blur-3xl" />

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.03)",
          "rgba(0,0,0,0.16)",
        ]}
        className="rounded-[30px] border border-white/10 p-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] uppercase tracking-[3px] text-emerald-200">
            Invite Friends
          </Text>
          <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
            <Text className="text-[10px] font-main-bold uppercase tracking-[2px] text-emerald-100">
              Scan Here
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-4">
          <View className="rounded-[24px] bg-white p-3">
            <QRCode value={lobby.qrPayload} size={QR_SIZE} />
          </View>

          <View className="flex-1">
            <Text className="font-main-bold text-2xl text-white">
              Join my room
            </Text>
            <Text className="mt-2 text-sm leading-5 text-white/62">
              Ask your friend to scan this code or type the room code below.
            </Text>

            <View className="mt-4 flex-row gap-2">
              {roomCodeParts.map((part: string, index: number) => (
                <View
                  key={`${part}-${index}`}
                  className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
                >
                  <Text className="text-center font-main-bold text-base tracking-[2px] text-white">
                    {part}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={onCopyRoomCode}
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 active:bg-white/10"
            >
              <Text className="text-center text-xs font-main-bold uppercase tracking-[2px] text-white">
                Copy Room Code
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
};
