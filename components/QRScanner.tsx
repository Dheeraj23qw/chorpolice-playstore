import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";
import {
  logPermissionDebug,
  warnPermissionDebug,
} from "@/utils/permissionDebug";

export const QRScanner = ({
  onScan,
}: {
  onScan: (payload: { ip?: string; port?: number }) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const hasAutoRequestedRef = useRef(false);

  // ✅ AUTO PERMISSION FLOW
  useEffect(() => {
    if (hasAutoRequestedRef.current || permission?.granted) return;

    if (permission?.canAskAgain === false) {
      hasAutoRequestedRef.current = true;
      return;
    }

    hasAutoRequestedRef.current = true;
    void requestPermission();
  }, [permission]);

  // ✅ RESET SCAN AFTER DELAY (important UX)
  useEffect(() => {
    if (!scanned) return;

    const t = setTimeout(() => setScanned(false), 2500);
    return () => clearTimeout(t);
  }, [scanned]);

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;

    try {
      const parsed = JSON.parse(data);
      if (!parsed?.ip) return;

      setScanned(true);

      // 🔥 success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onScan(parsed);
    } catch {
      if (__DEV__) console.warn("Invalid QR");
    }
  };

  // 🔒 LOADING
  if (!permission) {
    return (
      <View className="items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-sm text-white/70">
          Checking camera permission...
        </Text>
      </View>
    );
  }

  // ❌ NO PERMISSION
  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain !== false;

    return (
      <View className="items-center rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-center text-sm text-white/70">
          {canAskAgain
            ? "Allow camera to scan QR"
            : "Enable camera permission from settings"}
        </Text>

        <Pressable
          onPress={
            canAskAgain ? requestPermission : () => Linking.openSettings()
          }
          className="mt-4 rounded-xl bg-white/10 px-4 py-3"
        >
          <Text className="text-xs text-white">
            {canAskAgain ? "Allow Camera" : "Open Settings"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ✅ MAIN SCANNER
  return (
    <View className="h-80 overflow-hidden rounded-3xl border border-white/10">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* 🔲 SCAN FRAME */}
      <View className="absolute inset-0 items-center justify-center">
        <View className="h-52 w-52 rounded-2xl border-2 border-white/30" />
      </View>

      {/* 🔥 SCAN LINE ANIMATION */}
      <MotiView
        from={{ translateY: -100 }}
        animate={{ translateY: 100 }}
        transition={{
          loop: true,
          duration: 1500,
          type: "timing",
        }}
        className="absolute left-1/2 h-1 w-40 -translate-x-20 rounded-full bg-green-400/80"
      />

      {/* 🎯 SUCCESS OVERLAY */}
      {scanned && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 items-center justify-center bg-black/60"
        >
          <Text className="font-main-bold text-lg text-white">
            Connected ✅
          </Text>
        </MotiView>
      )}
    </View>
  );
};
