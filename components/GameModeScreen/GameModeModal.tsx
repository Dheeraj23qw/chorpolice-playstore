import React from "react";
import { View, Modal, Pressable, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../Text";
import { rf } from "@/utils/responsive";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import WifiHint from "../WifiHint";

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
      {/* 1. FULL-SCREEN PRESSABLE WRAPPER (Handles outside clicks) */}
      <Pressable className="flex-1 bg-black/60" onPress={onClose}>
        <BlurView
          intensity={25}
          tint="dark"
          className="absolute h-full w-full"
        />

        {/* 2. ATMOSPHERIC GRADIENTS */}
        <LinearGradient
          colors={[
            "rgba(10, 0, 20, 0.4)",
            "transparent",
            "rgba(76, 29, 149, 0.2)",
            "rgba(0,0,0,0.9)",
          ]}
          locations={[0, 0.2, 0.6, 1]}
          className="absolute h-full w-full"
        />

        {/* 3. CENTER GLOW */}
        <LinearGradient
          colors={[
            "rgba(99, 102, 241, 0.2)",
            "rgba(59, 130, 246, 0.1)",
            "transparent",
          ]}
          className="absolute h-[700px] w-[700px] self-center rounded-full blur-3xl"
        />

        {/* 4. MODAL CONTENT CONTAINER */}
        <View className="flex-1 justify-center px-6">
          <WifiHint />

          {/* STOP PROPAGATION ON THE CARD ITSELF */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04]"
          >
            <BlurView intensity={80} tint="dark" className="p-8">
              {/* HEADER */}
              <View className="mb-8 items-center">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <Ionicons
                    name="game-controller-outline"
                    size={rf(4)}
                    color="#E5E7EB"
                  />
                </View>
                <Text className="mt-4 font-main-bold text-2xl text-white">
                  CHOOSE MODE
                </Text>
                <Text className="mt-1 text-sm text-white/40">
                  Play with friends or join others
                </Text>
              </View>

              {/* HOST BUTTON */}
              <TouchableOpacity
                onPress={() => handleSelection(true)}
                className="mb-4 overflow-hidden rounded-3xl"
              >
                <LinearGradient
                  colors={["#7C3AED33", "#7C3AED10"]}
                  className="flex-row items-center border border-purple-400/20 p-5"
                >
                  <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20">
                    <Ionicons
                      name="wifi-outline"
                      size={rf(3)}
                      color="#C084FC"
                    />
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
              </TouchableOpacity>

              {/* JOIN BUTTON */}
              <TouchableOpacity
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
              </TouchableOpacity>
            </BlurView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default React.memo(GameModeModal);
