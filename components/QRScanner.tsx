import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

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

  useEffect(() => {
    logPermissionDebug("QRScanner", "Camera permission snapshot changed", permission);

    if (hasAutoRequestedRef.current || permission?.granted) {
      return;
    }

    if (permission?.canAskAgain === false) {
      hasAutoRequestedRef.current = true;
      warnPermissionDebug(
        "QRScanner",
        "Camera permission is blocked and cannot be auto-requested again",
        permission,
      );
      return;
    }

    hasAutoRequestedRef.current = true;
    void (async () => {
      logPermissionDebug("QRScanner", "Auto-requesting camera permission");
      const result = await requestPermission();
      logPermissionDebug("QRScanner", "Auto-request result", result);
    })();
  }, [permission, requestPermission]);

  const handleRequestPermission = () => {
    hasAutoRequestedRef.current = true;
    void (async () => {
      logPermissionDebug("QRScanner", "Manual camera permission request started");
      const result = await requestPermission();
      logPermissionDebug("QRScanner", "Manual camera permission request result", result);
    })();
  };

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) {
      return;
    }

    try {
      const parsed = JSON.parse(data);
      if (!parsed?.ip) {
        warnPermissionDebug("QRScanner", "Scanned QR payload was missing host IP", {
          parsed,
        });
        return;
      }

      logPermissionDebug("QRScanner", "QR payload parsed successfully", parsed);
      setScanned(true);
      onScan(parsed);
    } catch {
      warnPermissionDebug("QRScanner", "Invalid QR payload scanned", {
        dataPreview: data.slice(0, 120),
      });
      if (__DEV__) {
        console.warn("[LAN] Invalid QR payload scanned");
      }
    }
  };

  if (!permission) {
    return (
      <View className="items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-center text-sm text-white/70">
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain !== false;

    return (
      <View className="items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-center text-sm leading-5 text-white/70">
          {canAskAgain
            ? "Camera permission is required to scan the host QR code."
            : "Camera permission is blocked for this app. Enable it in Settings to scan the host QR code."}
        </Text>

        <Pressable
          onPress={
            canAskAgain
              ? handleRequestPermission
              : () => {
                  logPermissionDebug("QRScanner", "Opening app settings for camera permission");
                  Linking.openSettings();
                }
          }
          className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
        >
          <Text className="font-main-bold text-xs uppercase tracking-[2px] text-white">
            {canAskAgain ? "Allow Camera" : "Open Settings"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="h-80 overflow-hidden rounded-3xl border border-white/10">
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
    </View>
  );
};
