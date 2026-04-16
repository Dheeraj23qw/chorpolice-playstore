import React from "react";
import { View, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../Text";
import { rf } from "@/utils/responsive";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface GameModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: string;
}

const GameModeModal: React.FC<GameModeModalProps> = ({
  isVisible,
  onClose,
  gameType,
}) => {
  const handleSelection = (isHost: boolean) => {
    onClose();
    router.push({
      pathname: "/lobby",
      params: {
        isHost: isHost ? "true" : "false",
        gameType: gameType,
      },
    });
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      {/* CLICKABLE BACKGROUND */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center"
      >
        {/* 🔹 LIGHT BLUR (keeps your night background visible) */}
        <BlurView
          intensity={30}
          tint="dark"
          className="absolute h-full w-full"
        />

        {/* 🔹 TOP SHADE */}
        <LinearGradient
          colors={["rgba(0,0,0,0.25)", "transparent"]}
          className="absolute top-0 h-[25%] w-full"
        />

        {/* 🔥 CENTER GLOW (main highlight focus) */}
        <LinearGradient
          colors={[
            "rgba(124,58,237,0.28)",
            "rgba(37,99,235,0.22)",
            "transparent",
          ]}
          className="absolute h-[600px] w-[600px] rounded-full blur-3xl"
        />

        {/* 🔹 BOTTOM SHADE */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.15)"]}
          className="absolute bottom-0 h-[15%] w-full"
        />

        {/* 🧊 GLASS CARD */}
        <Pressable
          onPress={() => {}}
          className="w-[85%] overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.06]"
        >
          <BlurView intensity={70} tint="dark" className="p-6">
            {/* HEADER */}
            <View className="mb-6 items-center">
              <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <Ionicons
                  name="game-controller-outline"
                  size={rf(4)}
                  color="#E5E7EB"
                />
              </View>

              <Text className="font-main-bold text-2xl text-white">
                CHOOSE MODE
              </Text>

              <Text className="mt-1 text-sm text-white/40">
                Play with friends or join others
              </Text>
            </View>

            {/* HOST BUTTON */}
            <Pressable
              onPress={() => handleSelection(true)}
              className="mb-4 overflow-hidden rounded-3xl"
            >
              <LinearGradient
                colors={["#7C3AED33", "#7C3AED10"]}
                className="flex-row items-center border border-purple-400/20 p-5"
              >
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20">
                  <Ionicons name="wifi-outline" size={rf(3)} color="#C084FC" />
                </View>

                <View className="flex-1">
                  <Text className="font-main-bold text-lg text-white">
                    HOST GAME
                  </Text>
                  <Text className="text-sm text-white/40">
                    Create your own lobby
                  </Text>
                </View>

                <Ionicons name="arrow-forward" size={rf(2)} color="#C084FC" />
              </LinearGradient>
            </Pressable>

            {/* JOIN BUTTON */}
            <Pressable
              onPress={() => handleSelection(false)}
              className="overflow-hidden rounded-3xl"
            >
              <LinearGradient
                colors={["#2563EB33", "#2563EB10"]}
                className="flex-row items-center border border-blue-400/20 p-5"
              >
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
                  <Ionicons
                    name="search-outline"
                    size={rf(3)}
                    color="#60A5FA"
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-main-bold text-lg text-white">
                    JOIN GAME
                  </Text>
                  <Text className="text-sm text-white/40">
                    Find nearby players
                  </Text>
                </View>

                <Ionicons name="arrow-forward" size={rf(2)} color="#60A5FA" />
              </LinearGradient>
            </Pressable>

            {/* CLOSE TEXT */}
            <View className="mt-6 items-center">
              <Text className="text-xs uppercase tracking-widest text-white/30">
                Tap outside to close
              </Text>
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default React.memo(GameModeModal);
