import React, { useEffect } from "react";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text } from "@/components/Text";

interface LateJoinQrModalProps {
  visible: boolean;
  onClose: () => void;
  qrPayload: string;
  roomCode: string | null;
  onCopyRoomCode: () => void;
  isHost: boolean;
  onScanSuccess?: (data: string) => void;
}

export const LateJoinQrModal: React.FC<LateJoinQrModalProps> = ({
  visible,
  onClose,
  qrPayload,
  roomCode,
  onCopyRoomCode,
  isHost,
  onScanSuccess,
}) => {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (visible && !isHost && !permission?.granted) {
      requestPermission();
    }
  }, [visible, isHost]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/95">
        {/* CLOSE AREA */}
        <Pressable
          onPress={onClose}
          className="flex-1 items-center justify-center px-6"
        >
          {/* CONTENT CARD */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full items-center"
          >
            {isHost ? (
              /* ─── HOST: SHOW QR ─── */
              <View className="items-center">
                <View className="rounded-[40px] bg-white p-6 shadow-2xl shadow-black/70">
                  <QRCode value={qrPayload} size={270} />
                </View>

                <Text className="mt-6 text-center text-sm text-white/70">
                  Host: Share this with your friends
                </Text>
              </View>
            ) : (
              /* ─── CLIENT: SCANNER ─── */
              <View className="w-full items-center">
                <View className="h-[350px] w-full overflow-hidden rounded-[40px] border border-white/10 bg-white/5">
                  {permission?.granted ? (
                    <CameraView
                      style={StyleSheet.absoluteFill}
                      onBarcodeScanned={({ data }) => {
                        if (data) {
                          onScanSuccess?.(data);
                          onClose();
                        }
                      }}
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center p-4">
                      <Text className="text-center text-white/50">
                        Camera access needed
                      </Text>
                    </View>
                  )}
                  {/* SCANNER OVERLAY */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-48 w-48 rounded-3xl border-2 border-white/30" />
                  </View>
                </View>

                <Text className="mt-6 text-center text-sm text-white/70">
                  Client: Scan the host's QR code
                </Text>
              </View>
            )}

            {/* SHARED ROOM CODE ACTION */}
            {roomCode && isHost && (
              <Pressable
                onPress={onCopyRoomCode}
                className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 active:bg-white/10"
              >
                <Text className="text-center font-main-bold text-xs uppercase tracking-[2px] text-white">
                  Copy Room Code: {roomCode}
                </Text>
              </Pressable>
            )}

            <Pressable onPress={onClose} className="mt-10">
              <Text className="text-xs uppercase tracking-widest text-white/30">
                Tap anywhere to close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
};
