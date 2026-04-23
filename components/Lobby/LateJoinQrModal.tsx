import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Text } from "@/components/Text";

interface LateJoinQrModalProps {
  visible: boolean;
  onClose: () => void;
  qrPayload: string;
  roomCode: string | null;
  onCopyRoomCode: () => void;
}

export const LateJoinQrModal: React.FC<LateJoinQrModalProps> = ({
  visible,
  onClose,
  qrPayload,
  roomCode,
  onCopyRoomCode,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      <View className="w-full max-w-sm overflow-hidden rounded-[32px]">
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
          className="rounded-[32px] border border-white/10 p-6"
        >
          <Text className="text-[10px] uppercase tracking-[3px] text-emerald-200">
            Late Join QR
          </Text>
          <Text className="mt-3 font-main-bold text-2xl text-white">
            One more friend can still join
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/60">
            Let them scan this code, then come back and start the match.
          </Text>

          <View className="mt-5 items-center rounded-[26px] bg-white p-4">
            <QRCode value={qrPayload} size={160} />
          </View>

          {roomCode ? (
            <Pressable
              onPress={onCopyRoomCode}
              className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 active:bg-white/10"
            >
              <Text className="text-center font-main-bold uppercase tracking-[2px] text-white">
                Copy Room Code
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={onClose}
            className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 active:bg-white/10"
          >
            <Text className="text-center font-main-bold uppercase tracking-[2px] text-white/80">
              Close
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  </Modal>
);
