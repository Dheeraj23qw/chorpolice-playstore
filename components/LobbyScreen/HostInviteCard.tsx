import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import { Pressable, View, Modal } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Users, QrCode } from "lucide-react-native";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";

interface HostInviteCardProps {
  lobby: LobbyState;
}

const QR_SIZE = 180;

export const HostInviteCard: React.FC<HostInviteCardProps> = ({
  lobby,
}) => {
  const [isQRFull, setIsQRFull] = useState(false);

  /* ---------------- LOCAL MODE ---------------- */
  if (lobby.isLocalOnlyLobby || !lobby.qrPayload) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20, height: 0 }}
        className="overflow-hidden rounded-[30px]"
      >
        <View className="mb-5">
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[30px] border border-white/10"
        >
          <View className="p-5">
          <Text className="text-white/62 text-sm leading-5">
            Room is ready for local play. Enable permissions to invite friends.
          </Text>
          </View>
        </LinearGradient>
        </View>
      </MotiView>
    );
  }

  return (
    <>
      {/* ---------------- MAIN CARD ---------------- */}
      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.96 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        exit={{ opacity: 0, translateY: -20, scale: 0.96, height: 0 }}
        transition={{ type: "spring", damping: 16 }}
        className="overflow-hidden rounded-[30px]"
      >
        <View className="mb-5">
        <View className="absolute inset-0 rounded-[30px] bg-indigo-500/10 blur-xl" />

        <LinearGradient
          colors={[
            "rgba(255,255,255,0.08)",
            "rgba(255,255,255,0.03)",
            "rgba(0,0,0,0.16)",
          ]}
          className="rounded-[30px] border border-white/10"
        >
          <View className="p-5">
          {/* HEADER */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-1.5">
                <Users size={14} color="#6ee7b7" />
              </View>
              <Text className="text-[10px] uppercase tracking-[3px] text-emerald-200">
                Invite Friends
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1">
              <QrCode size={12} color="#a5b4fc" />
              <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-indigo-200">
                Scan
              </Text>
            </View>
          </View>

          {/* CONTENT */}
          <View className="mt-5 items-center">
            {/* QR */}
            <View className="items-center">
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsQRFull(true);
                }}
              >
                <MotiView
                  from={{ scale: 0.95 }}
                  animate={{ scale: 1.05 }}
                  transition={{
                    loop: true,
                    duration: 2000,
                    type: "timing",
                  }}
                  className="rounded-[24px] bg-white shadow-lg shadow-indigo-500/20"
                >
                  <View className="p-4">
                  <QRCode value={lobby.qrPayload} size={QR_SIZE} />
                  </View>
                </MotiView>
              </Pressable>

              <Text className="mt-3 text-xs text-white/50">
                Tap to enlarge
              </Text>
            </View>
          </View>
          </View>
        </LinearGradient>
        </View>
      </MotiView>

      {/* ---------------- FULLSCREEN QR ---------------- */}
      <Modal visible={isQRFull} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/90"
          onPress={() => setIsQRFull(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <MotiView
              from={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <View className="items-center">
              <View className="rounded-[32px] bg-white p-6 shadow-2xl shadow-indigo-500/30">
                <QRCode value={lobby.qrPayload} size={300} />
              </View>

              <Pressable
                onPress={() => setIsQRFull(false)}
                className="absolute -top-12 right-0 h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <Ionicons name="close" size={22} color="white" />
              </Pressable>
              </View>
            </MotiView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
