import React from "react";
import { View, Modal, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BlurView from "@/components/Shimmer"; // Using shimmer as a blur fallback or if blur is available
// Note: If BlurView is needed from Expo, I should check if it's in package.json.
// For now, I'll use standard RN View with semi-transparent background to stay safe.
import { Text } from "../Text";
import { rf, hp, wp } from "@/utils/responsive";

interface GameModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: string;
}

const GameModeModal: React.FC<GameModeModalProps> = ({ isVisible, onClose, gameType }) => {
  console.log("🎮 [GameModeModal] Rendered, isVisible:", isVisible, "gameType:", gameType);

  const handleSelection = (isHost: boolean) => {
    console.log(`[MODAL] Navigating to Lobby with params: isHost=${isHost}, gameType=${gameType}`);
    onClose();
    router.push({
      pathname: "/lobby",
      params: { 
        isHost: isHost ? "true" : "false",
        gameType: gameType
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
      <Pressable 
        className="flex-1 items-center justify-center bg-black/80" 
        onPress={onClose}
      >
        <View 
          className="w-[85%] overflow-hidden rounded-[40px] border border-white/10 bg-[#1A1A1A]"
          onStartShouldSetResponder={() => true} // Prevent closing when clicking inside
        >
          {/* Header */}
          <View className="items-center bg-purple-600/10 py-6">
            <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-purple-600/20">
              <Ionicons name="globe-outline" size={rf(4)} color="#A855F7" />
            </View>
            <Text className="font-main-bold text-2xl text-white">CHOOSE ROLE</Text>
            <Text className="font-main-regular mt-1 text-white/50">Local Multiplayer Session</Text>
          </View>

          <View className="p-6">
            {/* Host Button */}
            <Pressable
              onPress={() => handleSelection(true)}
              className="mb-4 flex-row items-center rounded-3xl border border-white/10 bg-white/5 p-5 active:bg-white/10"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20">
                <Ionicons name="wifi-outline" size={rf(3)} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text className="font-main-bold text-lg text-white">HOST GAME</Text>
                <Text className="font-main-regular text-sm text-white/40">Start a lobby for others to join</Text>
              </View>
              <Ionicons name="chevron-forward" size={rf(2)} color="white" />
            </Pressable>

            {/* Join Button */}
            <Pressable
              onPress={() => handleSelection(false)}
              className="flex-row items-center rounded-3xl border border-white/10 bg-white/5 p-5 active:bg-white/10"
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
                <Ionicons name="search-outline" size={rf(3)} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-main-bold text-lg text-white">JOIN GAME</Text>
                <Text className="font-main-regular text-sm text-white/40">Look for available lobbies nearby</Text>
              </View>
              <Ionicons name="chevron-forward" size={rf(2)} color="white" />
            </Pressable>
          </View>

          {/* Close Button */}
          <Pressable 
            onPress={onClose}
            className="mb-6 self-center"
          >
            <Text className="font-main-bold text-white/30 uppercase tracking-widest text-xs">Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default React.memo(GameModeModal);
