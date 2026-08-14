import React, { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { MotiText, MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { Text } from "@/components/Text";
import { LanTroubleshootingCard } from "@/components/LobbyScreen/LanTroubleshootingCard";
import { LanDebugPanel } from "@/components/LobbyScreen/LanDebugPanel";
import { HotspotTroubleshootingCard } from "@/components/LobbyScreen/HotspotTroubleshootingCard";
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
  const [isScanning, setIsScanning] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setCopied(false);
      setShowDebug(false);
      setIsScanning(false);

      const troubleshootingTimer = setTimeout(() => {
        setShowTroubleshooting(true);
      }, 5000);

      const hotspotTimer = setTimeout(() => {
        setShowHotspotFix(true);
      }, 5000);

      return () => {
        clearTimeout(troubleshootingTimer);
        clearTimeout(hotspotTimer);
      };
    }

    setShowTroubleshooting(false);
    setShowHotspotFix(false);
    setShowDebug(false);
  }, [visible]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomCode || "");

    setCopied(true);

    toast.success("Copied!", "Room code copied to clipboard");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleScanPress = async () => {
    if (isScanning) return;

    if (!permission?.granted) {
      setIsScanning(true);
      const result = await requestPermission();
      setIsScanning(false);

      if (!result.granted) {
        toast.error("Camera Required", "Camera permission is needed to scan QR codes.");
        return;
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-5">
        <View pointerEvents="none" className="absolute inset-0 bg-black/85" />

        <Pressable className="absolute inset-0" onPress={onClose} />

        <MotiView
          from={{
            opacity: 0,
            scale: 0.92,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            translateY: 10,
          }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 170,
          }}
          className="w-full max-w-[430px]"
          style={{
            shadowColor: "#6366F1",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.28,
            shadowRadius: 30,
            elevation: 25,
          }}
        >
          <View
            className="overflow-hidden rounded-[38px] border border-indigo-400/25 bg-indigo-500/[0.04] p-[1px]"
            style={{
              shadowColor: "#6366F1",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.38,
              shadowRadius: 22,
              elevation: 18,
            }}
          >
            <BlurView
              intensity={95}
              tint="dark"
              className="overflow-hidden rounded-[37px]"
            >
              <View className="rounded-[37px] bg-[#0B0B14]/90">
                <View className="w-full flex-row items-center justify-between border-b border-white/[0.07] px-5 py-5">
                  <View className="mr-4 flex-1">
                    <MotiText
                      from={{
                        opacity: 0,
                        translateY: 6,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                      }}
                      transition={{
                        type: "timing",
                        duration: 250,
                      }}
                      style={{ fontSize: rf(1.8) }}
                      className="font-main-bold tracking-tight text-white"
                    >
                      {isHost ? "Room Ready" : "Scan to Join"}
                    </MotiText>

                    <Text
                      style={{ fontSize: rf(1) }}
                      className="mt-1 font-main-md text-white/45"
                    >
                      {isHost
                        ? "Invite your squad to the lobby"
                        : "Point your camera at the host's QR"}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {onHelpPress && (
                      <Pressable
                        onPress={onHelpPress}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 active:bg-white/10"
                      >
                        <Text className="font-main-bold text-xs text-zinc-300">
                          Help
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={onClose}
                      className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] active:bg-white/10"
                    >
                      <Ionicons name="close" size={19} color="#D4D4D8" />
                    </Pressable>
                  </View>
                </View>

                <View className="w-full px-5 pb-6 pt-5">
                  {isHost ? (
                    <View className="items-center">
                      <View className="mb-4 flex-row items-center">
                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10">
                          <Ionicons
                            name="qr-code-outline"
                            size={16}
                            color="#818CF8"
                          />
                        </View>

                        <Text className="ml-2 font-main-bold text-[11px] uppercase tracking-[2px] text-zinc-500">
                          Scan to Join
                        </Text>
                      </View>

                      <View
                        className="rounded-[28px] border border-white/10 bg-white p-4"
                        style={{
                          shadowColor: "#FFFFFF",
                          shadowOffset: {
                            width: 0,
                            height: 0,
                          },
                          shadowOpacity: 0.12,
                          shadowRadius: 15,
                          elevation: 8,
                        }}
                      >
                        {qrPayload ? (
                          <QRCode
                            value={qrPayload}
                            size={160}
                            quietZone={8}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                          />
                        ) : (
                          <View className="h-40 w-40 items-center justify-center">
                            <Ionicons
                              name="sync-outline"
                              size={26}
                              color="#71717A"
                            />

                            <Text className="mt-3 font-main-bold text-[10px] uppercase tracking-[2px] text-zinc-400">
                              Generating
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="mt-5 w-full overflow-hidden rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.05]">
                        <View className="items-center px-5 pb-3 pt-4">
                          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-zinc-500">
                            Room Code
                          </Text>

                          <Text className="mt-1 font-main-bold text-3xl tracking-[6px] text-white">
                            {roomCode || "---"}
                          </Text>
                        </View>

                        <Pressable
                          onPress={handleCopy}
                          className={`flex-row items-center justify-center border-t py-3 ${
                            copied
                              ? "border-emerald-500/20 bg-emerald-500/10"
                              : "border-white/[0.06] bg-white/[0.03]"
                          }`}
                        >
                          <Ionicons
                            name={copied ? "checkmark-circle" : "copy-outline"}
                            size={17}
                            color={copied ? "#34D399" : "#A1A1AA"}
                          />

                          <Text
                            className={`ml-2 font-main-bold text-sm ${
                              copied ? "text-emerald-400" : "text-zinc-400"
                            }`}
                          >
                            {copied ? "Copied" : "Copy Code"}
                          </Text>
                        </Pressable>
                      </View>

                      <View className="mt-4 w-full">
                        {showTroubleshooting && <LanTroubleshootingCard />}

                        {showHotspotFix && (
                          <View className="mt-3">
                            <HotspotTroubleshootingCard />
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View className="items-center">
                      <View className="h-[320px] w-full overflow-hidden rounded-[28px] border border-white/15 bg-black">
                        {permission?.granted ? (
                          <CameraView
                            className="absolute inset-0"
                            facing="back"
                            onBarcodeScanned={({ data }) => {
                              if (data && !scanned) {
                                setScanned(true);

                                onScanSuccess?.(data);

                                setTimeout(onClose, 800);
                              }
                            }}
                          />
                        ) : (
                          <View className="flex-1 items-center justify-center px-8">
                            <Pressable
                              onPress={handleScanPress}
                              disabled={isScanning}
                              className="items-center"
                            >
                              <View className="h-16 w-16 items-center justify-center rounded-full bg-white/[0.05]">
                                <Ionicons
                                  name="camera-outline"
                                  size={32}
                                  color="#71717A"
                                />
                              </View>

                              <Text className="mt-4 text-center font-main-md text-sm leading-5 text-zinc-400">
                                Camera access is required to scan the room QR.
                              </Text>

                              <View className="mt-4 rounded-xl bg-indigo-500/20 px-5 py-2.5 border border-indigo-400/30">
                                <Text className="font-main-bold text-sm text-indigo-200">
                                  {isScanning ? "Requesting..." : "Tap to enable camera"}
                                </Text>
                              </View>
                            </Pressable>
                          </View>
                        )}

                        <View
                          pointerEvents="none"
                          className="absolute inset-0 bg-black/10"
                        />

                        <View
                          pointerEvents="none"
                          className="absolute inset-0 items-center justify-center"
                        >
                          <View className="h-48 w-48 rounded-[28px] border-[1.5px] border-white/50 bg-white/[0.03]" />

                          {!scanned && permission?.granted && (
                            <MotiView
                              from={{
                                translateY: -80,
                                opacity: 0.3,
                              }}
                              animate={{
                                translateY: 80,
                                opacity: 1,
                              }}
                              transition={{
                                type: "timing",
                                duration: 1800,
                                loop: true,
                              }}
                              className="absolute h-[2px] w-40 bg-indigo-400"
                              style={{
                                shadowColor: "#818CF8",
                                shadowOffset: {
                                  width: 0,
                                  height: 0,
                                },
                                shadowOpacity: 0.9,
                                shadowRadius: 8,
                                elevation: 5,
                              }}
                            />
                          )}
                        </View>

                        {!scanned && permission?.granted && (
                          <View className="absolute bottom-5 left-0 right-0 items-center">
                            <View className="rounded-full border border-white/10 bg-black/50 px-4 py-2">
                              <Text className="font-main-bold text-[10px] uppercase tracking-[2px] text-white/60">
                                Align QR inside frame
                              </Text>
                            </View>
                          </View>
                        )}

                        {scanned && (
                          <MotiView
                            from={{
                              opacity: 0,
                              scale: 0.8,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            transition={{
                              type: "spring",
                              damping: 15,
                            }}
                            className="absolute inset-0 items-center justify-center bg-emerald-950/70"
                          >
                            <View
                              className="h-16 w-16 items-center justify-center rounded-full bg-emerald-500"
                              style={{
                                shadowColor: "#34D399",
                                shadowOffset: {
                                  width: 0,
                                  height: 0,
                                },
                                shadowOpacity: 0.55,
                                shadowRadius: 18,
                                elevation: 10,
                              }}
                            >
                              <Ionicons
                                name="checkmark"
                                size={32}
                                color="white"
                              />
                            </View>

                            <Text className="mt-3 font-main-bold text-lg tracking-wide text-white">
                              Connected
                            </Text>
                          </MotiView>
                        )}
                      </View>

                      {!scanned && permission?.granted && (
                        <View className="mt-4 flex-row items-center">
                          <Ionicons
                            name="scan-outline"
                            size={15}
                            color="#71717A"
                          />

                          <Text className="font-main-medium ml-2 text-[11px] text-white/35">
                            Scan the QR code shown on the host's device
                          </Text>
                        </View>
                      )}

                      <View className="mt-4 w-full">
                        {showTroubleshooting && <LanTroubleshootingCard />}

                        {showDebug && (
                          <View className="mt-3">
                            <LanDebugPanel />
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </BlurView>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
