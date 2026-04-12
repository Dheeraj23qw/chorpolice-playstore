import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { Text } from "@/components/Text";

import { alertStore } from "./alertStore";
import { AlertPayload } from "./types";

const getColor = (type?: string) => {
  switch (type) {
    case "success":
      return "bg-green-600 border-green-400";
    case "error":
      return "bg-red-600 border-red-400";
    default:
      return "bg-purple-600 border-purple-400";
  }
};

export const GlobalAlert = () => {
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    alertStore.subscribe((data) => {
      setAlert(data);

      setTimeout(() => {
        setAlert(null);
      }, data.duration || 2000);
    });
  }, []);

  if (!alert) return null;

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOut}
      className="absolute bottom-36 z-50 self-center"
    >
      <View className={`rounded-2xl border px-6 py-3 ${getColor(alert.type)}`}>
        <Text className="text-center font-main-bold text-sm text-white">
          {alert.message}
        </Text>
      </View>
    </Animated.View>
  );
};
