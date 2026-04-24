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
    {/* TAP ANYWHERE TO CLOSE */}
    <Pressable
      onPress={onClose}
      className="flex-1 items-center justify-center bg-black/95 px-6"
    >
      {/* STOP PROPAGATION (so QR taps don’t close immediately) */}
      <Pressable onPress={(e) => e.stopPropagation()} className="items-center">
        {/* QR CARD */}
        <View className="rounded-[40px] bg-white p-6 shadow-2xl shadow-black/70">
          <QRCode value={qrPayload} size={270} />
        </View>

        {/* TEXT */}
        <Text className="mt-6 text-center text-sm text-white/70">
          Tap anywhere to close
        </Text>

        {/* ROOM CODE ACTION */}
        {roomCode && (
          <Pressable
            onPress={onCopyRoomCode}
            className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 active:bg-white/10"
          >
            <Text className="text-center font-main-bold text-xs uppercase tracking-[2px] text-white">
              Copy Room Code
            </Text>
          </Pressable>
        )}
      </Pressable>
    </Pressable>
  </Modal>
);
