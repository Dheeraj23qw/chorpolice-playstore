import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import { Pressable, View, Modal } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Users, Copy, Check, QrCode } from "lucide-react-native";

import { Text } from "@/components/Text";
import { LobbyState } from "./types";

interface HostInviteCardProps {
  lobby: LobbyState;
  onCopyRoomCode: () => void;
}

const QR_SIZE = 120;

export const HostInviteCard: React.FC<HostInviteCardProps> = ({
  lobby,
  onCopyRoomCode,
}) => {
  const [isQRFull, setIsQRFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const roomCodeParts = (lobby.roomCode || "---- ----").split("-");

  const handleCopy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onCopyRoomCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
          <View className="mt-5 flex-row items-center gap-5">
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
                  <View className="p-3">
                  <QRCode value={lobby.qrPayload} size={QR_SIZE} />
                  </View>
                </MotiView>
              </Pressable>

              <Text className="mt-2 text-[10px] text-white/40">
                Tap to enlarge
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View className="flex-1">
              <Text className="font-main-bold text-xl text-white">
                Join my room
              </Text>

              <Text className="mt-2 text-sm text-white/60">
                Scan the code or enter manually
              </Text>

              {/* ROOM CODE */}
              <View className="mt-4 flex-row gap-2">
                {roomCodeParts.map((part, index) => (
                  <MotiView
                    key={`${part}-${index}`}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 80 }}
                  >
                    <View className="flex-1">
                    <View className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                      <Text className="text-center font-main-bold text-base tracking-[2px] text-white">
                        {part}
                      </Text>
                    </View>
                    </View>
                  </MotiView>
                ))}
              </View>

              {/* COPY */}
              <Pressable onPress={handleCopy}>
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.96 : 1 }}
                    className="overflow-hidden rounded-2xl"
                  >
                    <View className="mt-3">
                    <LinearGradient
                      colors={["rgba(99,102,241,0.3)", "rgba(79,70,229,0.1)"]}
                      className="rounded-2xl border border-indigo-400/20"
                    >
                      <View className="flex-row items-center justify-center gap-2 px-4 py-3">
                        {copied ? (
                          <Check size={16} color="#6ee7b7" />
                        ) : (
                          <Copy size={16} color="#a5b4fc" />
                        )}
                        <Text className="text-center font-main-bold text-xs uppercase tracking-[2px] text-indigo-200">
                          {copied ? "Copied!" : "Copy Room Code"}
                        </Text>
                      </View>
                    </LinearGradient>
                    </View>
                  </MotiView>
                )}
              </Pressable>
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
                <QRCode value={lobby.qrPayload} size={260} />
              </View>

              <Text className="mt-4 text-sm text-white/70">
                Scan this QR to join
              </Text>

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
