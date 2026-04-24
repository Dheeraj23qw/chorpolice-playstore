import React, { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import { MotiView } from "moti";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";
import { useDispatch } from "react-redux";
import { closeModalUI, openModalUI } from "@/redux/reducers/uiStateSlice";

interface Props {
  visible: boolean;
  value: string;
  onClose: () => void;
}

export const QRFullscreenModal = ({ visible, value, onClose }: Props) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/90"
        onPress={onClose}
      >
        {/* STOP PROPAGATION */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="items-center"
          >
            {/* QR */}
            <View className="rounded-[32px] bg-white p-6">
              <QRCode value={value} size={260} />
            </View>

            {/* TEXT */}
            <Text className="mt-4 text-sm text-white/70">
              Scan this QR to join
            </Text>

            {/* CLOSE */}
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              className="absolute -top-12 right-0 h-10 w-10 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
