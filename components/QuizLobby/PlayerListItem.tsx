import React from "react";
import { View, Image, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";

export const PlayerListItem = ({
  item,
  index,
  lobby,
  getAvatarSource,
}: any) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      className="mb-3 flex-row items-center rounded-2xl bg-white/5 p-4"
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-white/10">
        {lobby.isHost ? (
          <Image
            source={getAvatarSource(item.avatarId)}
            className="h-10 w-10"
          />
        ) : (
          <Ionicons name="globe-outline" size={20} color="white" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-white">
          {lobby.isHost ? item.name : item.deviceName}
        </Text>
        <Text className="text-[10px] text-white/30">
          {lobby.isHost ? "Player" : item.ip}
        </Text>
      </View>

      {!lobby.isHost && (
        <Pressable
          onPress={() => lobby.handleJoin(item)}
          className="rounded-xl bg-purple-600 px-4 py-2"
        >
          <Text className="text-xs text-white">JOIN</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
