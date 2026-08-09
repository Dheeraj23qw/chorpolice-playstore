import React from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { setPermissionReminderSuppressed } from "@/storage/appStorage";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onGrant: () => void;
  onContinue: () => void;
}

export const PermissionReminderModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onGrant,
  onContinue,
}) => {
  const handleNeverAsk = () => {
    setPermissionReminderSuppressed(true);
    onContinue();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <BlurView intensity={20} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        
        <AnimatePresence>
          {isVisible && (
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
              className="bg-[#0b0b18] rounded-[32px] border border-white/10 shadow-2xl"
              style={{ width: "100%" }}
            >
              <View className="p-8">
              <View className="items-center mb-6">
                <View className="bg-amber-500/20 p-4 rounded-full mb-4">
                  <MaterialCommunityIcons name="wifi-lock" size={40} color="#fbbf24" />
                </View>
                <Text className="font-main-bold text-2xl text-white text-center">
                  Host Multiplayer?
                </Text>
                <Text className="font-main-md text-sm text-white/50 text-center mt-2">
                  To host a game and play with friends, we need location and nearby device permissions to find people on your WiFi.
                </Text>
              </View>

              <TouchableOpacity
                onPress={onGrant}
                className="bg-indigo-600 h-14 rounded-2xl items-center justify-center active:scale-95 mb-3"
              >
                <Text className="font-main-bold text-white text-base uppercase tracking-widest">
                  Grant Permissions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onContinue}
                className="bg-white/5 h-14 rounded-2xl items-center justify-center active:scale-95 mb-3"
              >
                <Text className="font-main-md text-white/70 text-base">
                  Remind me later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNeverAsk}
                className="h-10 items-center justify-center"
              >
                <Text className="font-main-md text-white/30 text-xs uppercase tracking-widest">
                  Don&apos;t ask again
                </Text>
              </TouchableOpacity>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};
