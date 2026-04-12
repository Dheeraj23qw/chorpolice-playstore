import React from "react";
import { View, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../Text";
import { rf } from "@/utils/responsive";

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
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Darkened Overlay */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 backdrop-blur-sm"
        onPress={onClose}
      >
        {/* Main Glass Container */}
        <View
          className="w-[85%] overflow-hidden rounded-[40px] border border-white/10 bg-[#121212]/90 shadow-2xl"
          onStartShouldSetResponder={() => true}
        >
          {/* Glass Header with subtle gradient feel */}
          <View className="items-center border-b border-white/5 bg-white/5 py-8">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-purple-500/30 to-blue-500/30">
              <Ionicons name="globe-outline" size={rf(4)} color="#E5E7EB" />
            </View>
            <Text className="font-main-bold text-2xl tracking-tight text-white">
              CHOOSE ROLE
            </Text>
          </View>

          <View className="p-6">
            {/* Host Button */}
            <Pressable
              onPress={() => handleSelection(true)}
              className="mb-4 flex-row items-center rounded-3xl border border-white/5 bg-white/[0.03] p-5 active:bg-white/[0.08]"
            >
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                <Ionicons name="wifi-outline" size={rf(3)} color="#C084FC" />
              </View>
              <View className="flex-1">
                <Text className="font-main-bold text-lg text-white">
                  HOST GAME
                </Text>
                <Text className="font-main-regular text-sm text-white/40">
                  Create a new lobby
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={rf(2)}
                color="rgba(255,255,255,0.5)"
              />
            </Pressable>

            {/* Join Button */}
            <Pressable
              onPress={() => handleSelection(false)}
              className="flex-row items-center rounded-3xl border border-white/5 bg-white/[0.03] p-5 active:bg-white/[0.08]"
            >
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                <Ionicons name="search-outline" size={rf(3)} color="#60A5FA" />
              </View>
              <View className="flex-1">
                <Text className="font-main-bold text-lg text-white">
                  JOIN GAME
                </Text>
                <Text className="font-main-regular text-sm text-white/40">
                  Search nearby lobbies
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={rf(2)}
                color="rgba(255,255,255,0.5)"
              />
            </Pressable>
          </View>

          <Pressable onPress={onClose} className="mb-8 self-center">
            <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/20">
              Close Menu
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default React.memo(GameModeModal);
