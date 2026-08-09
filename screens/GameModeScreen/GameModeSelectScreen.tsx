import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { GameModeRow } from "@/components/GameModeScreen/GameModeRow";
import { GameModeType } from "@/constants/gamemode";
import GameModeModal from "@/modal/GameModeModal";

interface GameModeSelectScreenProps {
  title: string;
  subtitle: string;
  modes: GameModeType[];
}

export const GameModeSelectScreen: React.FC<GameModeSelectScreenProps> = ({
  title,
  subtitle,
  modes,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameModeType | null>(null);

  const handleOpen = (item: GameModeType) => {
    if (item.id.endsWith("_online")) {
      setSelectedGame(item);
    } else {
      router.push(item.route);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/84" />
      <LinearGradient
        colors={[
          "rgba(15,23,42,0.62)",
          "rgba(79,70,229,0.12)",
          "rgba(0,0,0,0.92)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 260 }}
          className="flex-1"
        >
          {/* HEADER */}
          <View className="px-5 pt-2">
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10"
            >
              <BlurView
                intensity={18}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="mt-6">
              <Text className="font-main-bold text-3xl tracking-tight text-white">
                {title}
              </Text>
              <Text className="mt-2 text-[11px] uppercase tracking-widest text-white/40">
                {subtitle}
              </Text>
            </View>
          </View>

          {/* MODES LIST */}
          <View className="flex-1 px-5 pt-8">
            <View className="gap-y-4">
              {modes.map((item) => (
                <GameModeRow
                  key={item.id}
                  item={item}
                  onPress={() => handleOpen(item)}
                />
              ))}
            </View>
          </View>
        </MotiView>
      </SafeAreaView>

      {/* HOST / JOIN CHOICE FOR ONLINE MODES */}
      <GameModeModal
        isVisible={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        gameType={selectedGame?.gameType || selectedGame?.id || ""}
      />
    </View>
  );
};

export default React.memo(GameModeSelectScreen);
