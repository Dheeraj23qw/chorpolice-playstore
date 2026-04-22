import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { Text } from "@/components/Text";

export const QRScanner = ({
  onScan,
}: {
  onScan: (payload: { ip?: string; port?: number }) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) {
      return;
    }

    try {
      const parsed = JSON.parse(data);
      if (!parsed?.ip) {
        return;
      }

      setScanned(true);
      onScan(parsed);
    } catch {
      if (__DEV__) {
        console.warn("[LAN] Invalid QR payload scanned");
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View className="items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-center text-sm text-white/70">
          Camera permission is required to scan the host QR code.
        </Text>
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
