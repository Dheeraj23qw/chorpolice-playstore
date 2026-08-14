import React, { useEffect } from "react";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { LanTroubleshootingCard } from "@/components/LobbyScreen/LanTroubleshootingCard";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";
import { HotspotTroubleshootingCard } from "@/components/LobbyScreen/HotspotTroubleshootingCard";
import * as Clipboard from "expo-clipboard";
import { toast } from "@/components/feedback/toast";
import { rf } from "@/utils/responsive";

interface LateJoinQrModalProps {
  visible: boolean;
  onClose: () => void;
  qrPayload: string;
  roomCode: string | null;
  onCopyRoomCode: () => void;
  isHost: boolean;
  onScanSuccess?: (data: string) => void;
  onHelpPress?: () => void;
}

export const LateJoinQrModal: React.FC<LateJoinQrModalProps> = ({
  visible,
  onClose,
  qrPayload,
  roomCode,
  onCopyRoomCode,
  isHost,
  onScanSuccess,
  onHelpPress,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showTroubleshooting, setShowTroubleshooting] = React.useState(false);
  const [showHotspotFix, setShowHotspotFix] = React.useState(false);
  const [showDebug, setShowDebug] = React.useState(false);
  const [scanned, setScanned] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (visible && !isHost && !permission?.granted) {
      requestPermission();
    }

    if (visible) {
      setScanned(false);
      setCopied(false);
      setShowDebug(false);
      const t1 = setTimeout(() => setShowTroubleshooting(true), 5000);
      const t2 = setTimeout(() => setShowHotspotFix(true), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setShowTroubleshooting(false);
      setShowHotspotFix(false);
      setShowDebug(false);
    }
  }, [visible, isHost]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomCode || "");
    setCopied(true);
    toast.success("Copied!", "Room code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/90 px-5">
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full">
          {/* HEADER */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text style={{ fontSize: rf(2) }} className="font-main-bold text-white">
                {isHost ? "🔥 Room Ready" : "📸 Scan QR"}
              </Text>
              <Text style={{ fontSize: rf(1.05) }} className="mt-1 font-main-md text-white/50">
                {isHost ? "Share with your squad" : "Point at host's QR code"}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              {onHelpPress && (
                <Pressable
                  onPress={onHelpPress}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5"
                >
                  <Text className="font-main-bold text-sm text-white">Help</Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-2xl bg-white/10"
              >
                <Ionicons name="close" size={22} color="white" />
              </Pressable>
            </View>
          </View>

          {isHost ? (
            /* ─── HOST: SHOW QR ─── */
            <View className="items-center">
              {/* QR Card */}
              <View className="rounded-[36px] border border-white/10 bg-white p-5 shadow-2xl shadow-indigo-500/20">
                {qrPayload ? (
                  <QRCode value={qrPayload} size={220} />
                ) : (
                  <View style={{ width: 220, height: 220 }} className="items-center justify-center">
                    <Text className="text-black font-main-bold text-lg">GENERATING...</Text>
                  </View>
                )}
              </View>

              {/* Room Code */}
              <View className="mt-6 items-center">
                <View className="rounded-[28px] border border-white/10 bg-white/5 px-8 py-4">
                  <Text className="text-[10px] uppercase tracking-[3px] text-white/40">Room Code</Text>
                  <Text className="font-main-bold text-4xl text-white mt-1 tracking-wider">{roomCode || "---"}</Text>
                </View>

                <Pressable
                  onPress={handleCopy}
                  className="mt-4 flex-row items-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 px-6 py-3"
                >
                  <Ionicons
                    name={copied ? "checkmark-circle" : "copy-outline"}
                    size={20}
                    color={copied ? "#34D399" : "#A5B4FC"}
                  />
                  <Text className="ml-2 font-main-bold text-sm text-indigo-200">
                    {copied ? "Copied!" : "Copy Code"}
                  </Text>
                </Pressable>
              </View>

              {showTroubleshooting && <LanTroubleshootingCard />}
              {showHotspotFix && <HotspotTroubleshootingCard />}
            </View>
          ) : (
            /* ─── CLIENT: SCANNER ─── */
            <View className="w-full items-center">
              <View className="h-[320px] w-full overflow-hidden rounded-[36px] border border-white/10 bg-white/5">
                {permission?.granted ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    onBarcodeScanned={({ data }) => {
                      if (data && !scanned) {
                        setScanned(true);
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
                  <View className="h-44 w-44 rounded-3xl border-2 border-white/30" />
                </View>

                {/* Success Overlay */}
                {scanned && (
                  <View className="absolute inset-0 items-center justify-center bg-black/60">
                    <Text className="font-main-bold text-2xl text-white">Connected ✅</Text>
                  </View>
                )}
              </View>

              <Text className="mt-5 text-center text-sm text-white/60">
                Scan the host&apos;s QR code
              </Text>

              {showTroubleshooting && <LanTroubleshootingCard />}
              {showDebug && <LanDebugPanel />}
            </View>
          )}

          {/* Close hint */}
          <Pressable onPress={onClose} className="mt-8">
            <Text className="text-xs uppercase tracking-widest text-white/30">
              Tap outside to close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
