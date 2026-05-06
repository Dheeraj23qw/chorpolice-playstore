import React, { memo } from "react";
import { View, Pressable, TextInput, Image } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { rf } from "@/utils/responsive";
import { getBotName } from "@/utils/nameGenerator";

interface OfflinePlayerCardProps {
  player: { name: string; avatarId: number };
  onNameChange: (name: string) => void;
  onAvatarPress: () => void;
  index: number;
}

const OfflinePlayerCardComponent: React.FC<OfflinePlayerCardProps> = ({
  player,
  onNameChange,
  onAvatarPress,
  index,
}) => {
  const avatarSource =
    playerImages[player.avatarId]?.src || playerImages[1].src;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100 }}
      className="overflow-hidden rounded-[32px] border border-white/10"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
        className="p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text
              style={{ fontSize: rf(0.9) }}
              className="uppercase tracking-[2px] text-indigo-300"
            >
              Player {index + 1}
            </Text>
            <TextInput
              value={player.name}
              onChangeText={onNameChange}
              placeholder={getBotName(index)}
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={{ fontSize: rf(1.8) }}
              className="mt-1 font-main-bold text-white"
            />
          </View>

          <Pressable onPress={onAvatarPress}>
            <View className="h-16 w-16 rounded-full border border-white/20 p-[1px]">
              <Image
                source={avatarSource}
                className="h-full w-full rounded-full"
              />
              <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-indigo-500 shadow-lg">
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </View>
          </Pressable>
        </View>
      </LinearGradient>
    </MotiView>
  );
};

export const OfflinePlayerCard = memo(OfflinePlayerCardComponent);
