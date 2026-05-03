import React, { useEffect } from "react";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text } from "@/components/Text";
import { LanTroubleshootingCard } from "@/components/LobbyScreen/LanTroubleshootingCard";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";
import { HotspotTroubleshootingCard } from "@/components/LobbyScreen/HotspotTroubleshootingCard";

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
  const [showTroubleshooting, setShowTroubleshooting] = React.useState(false);
  const [showHotspotFix, setShowHotspotFix] = React.useState(false);
  const [showDebug, setShowDebug] = React.useState(false);

  useEffect(() => {
    if (visible && !isHost && !permission?.granted) {
      requestPermission();
    }
    
    if (visible) {
      const t1 = setTimeout(() => setShowTroubleshooting(true), 5000);
      const t2 = setTimeout(() => setShowHotspotFix(true), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setShowTroubleshooting(false);
      setShowHotspotFix(false);
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
              <View className="items-center w-full">
                <Text className="mb-4 text-xs font-main-bold uppercase tracking-[2px] text-indigo-400">
                  {qrPayload ? "Room ready" : "Preparing local room..."}
                </Text>
                
                <View className="rounded-[40px] bg-white p-6 shadow-2xl shadow-black/70">
                  {qrPayload ? (
                    <QRCode value={qrPayload} size={250} />
                  ) : (
                    <View style={{ width: 250, height: 250 }} className="items-center justify-center">
                      <Text className="text-black font-main-bold">GENERATING...</Text>
                    </View>
                  )}
                </View>

                <View className="mt-8 items-center gap-2">
                   <View className="items-center rounded-[30px] border border-white/10 bg-white/5 px-8 py-4">
                      <Text className="text-[10px] uppercase tracking-[3px] text-white/40">Room Code</Text>
                      <Text className="font-main-bold text-3xl text-white mt-1">{roomCode || "---"}</Text>
                   </View>
                   
                   <Text className="mt-6 text-center text-xs text-white/50 px-8">
                     Ask friends to connect to your hotspot and scan the QR code.
                   </Text>
                </View>

                {showTroubleshooting && <LanTroubleshootingCard />}
                
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

                {showTroubleshooting && <LanTroubleshootingCard />}
              </View>
            )}

            <Pressable onPress={onClose} className="mt-12">
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
