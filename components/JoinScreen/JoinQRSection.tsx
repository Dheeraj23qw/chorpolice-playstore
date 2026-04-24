import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { QRScanner } from "@/components/QRScanner";

export const JoinQRSection = ({ session, onScan }: any) => (
  <View className="overflow-hidden rounded-[30px]">
    <LinearGradient
      colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
      className="rounded-[30px] border border-white/10 p-5"
    >
      <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
        Scan QR
      </Text>

      <View className="mt-4">
        <QRScanner
          key={`${session.connectionStatus}-${session.errorMessage || "idle"}`}
          onScan={onScan}
        />
      </View>
    </LinearGradient>
  </View>
);
