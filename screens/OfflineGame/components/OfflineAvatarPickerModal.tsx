import React from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { hp, rf } from "@/utils/responsive";

interface OfflineAvatarPickerModalProps {
  visible: boolean;
  editingPlayerName: string;
  selectedAvatarIds: number[];
  isAvatarTaken: (id: number) => boolean;
  onClose: () => void;
  onSelect: (avatarId: number) => void;
}

export const OfflineAvatarPickerModal: React.FC<
  OfflineAvatarPickerModalProps
> = ({
  visible,
  editingPlayerName,
  selectedAvatarIds,
  isAvatarTaken,
  onClose,
  onSelect,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80">
        <BlurView
          intensity={18}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <Pressable className="flex-1" onPress={onClose} />

        <MotiView
          from={{ translateY: 560, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 260 }}
          style={{ height: hp(70) }}
          className="overflow-hidden rounded-t-[36px] border border-white/10 bg-[#090B14]"
        >
          <View className="mt-auto flex-1">
          <LinearGradient
            colors={[
              "rgba(99,102,241,0.20)",
              "rgba(255,255,255,0.03)",
              "rgba(9,11,20,1)",
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View className="items-center pt-3">
            <View className="h-1.5 w-14 rounded-full bg-white/20" />
          </View>

          <View className="px-6 pb-4 pt-5">
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text
                  style={{ fontSize: rf(1.9) }}
                  className="font-main-bold text-white"
                >
                  {editingPlayerName}
                </Text>
                <Text
                  style={{ fontSize: rf(1.02), lineHeight: rf(1.7) }}
                  className="mt-1 font-main-md text-white/45"
                >
                  Pick an avatar. If another player already has it, the two
                  avatars will swap.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.84}
                onPress={onClose}
                className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
              >
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 px-2 pb-5">
            <ImageGrid
              selectedImages={selectedAvatarIds}
              handleImageSelect={onSelect}
              gameMode="ONLINE"
              isTaken={isAvatarTaken}
            />
          </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
