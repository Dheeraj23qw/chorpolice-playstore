import React from "react";
import { View, Modal, Pressable, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { rf } from "@/utils/responsive";
import { Text } from "../components/Text";
import WifiHint from "../components/WifiHint";

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
        gameType,
      },
    });
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center bg-black/92 px-6"
        onPress={onClose}
      >
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.96)",
            "rgba(10, 10, 18, 0.94)",
            "rgba(0, 0, 0, 0.98)",
          ]}
          className="absolute h-full w-full"
        />

        <View className="mb-5">
          <WifiHint />
        </View>

        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full overflow-hidden rounded-[40px] border border-white/10 bg-[#07070d]"
        >
          <BlurView intensity={60} tint="dark" className="p-8">
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
      </Pressable>
    </Modal>
  );
};

export default React.memo(GameModeModal);
