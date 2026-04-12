import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/Text";

export const StartButton = ({ lobby }: any) => {
  return (
    <View className="absolute bottom-0 w-full px-6 pb-12 pt-10">
      {lobby.isHost ? (
        <Pressable
          disabled={lobby.players.length < 4}
          onPress={() => lobby.setIsBettingModalVisible(true)}
          className={`items-center rounded-2xl py-5 ${
            lobby.players.length >= 4
              ? "bg-purple-600"
              : "bg-white/5 opacity-50"
          }`}
        >
          <Text className="text-white">
            {lobby.players.length >= 4
              ? "START COMPETITION"
              : "WAITING FOR 4 PLAYERS"}
          </Text>
        </Pressable>
      ) : (
        <View className="items-center py-5">
          <Text className="text-white/30">Select a room from above</Text>
        </View>
      )}
    </View>
  );
};
