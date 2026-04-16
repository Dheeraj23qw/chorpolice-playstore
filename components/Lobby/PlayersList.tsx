import React from "react";
import { View, FlatList } from "react-native";
import { Text } from "@/components/Text";
import { PlayerListItem } from "./PlayerListItem";

export const PlayersList = ({ lobby, getAvatarSource }: any) => {
  const data = lobby.isHost ? lobby.players : lobby.allHosts;

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id || item.ip}
        renderItem={({ item, index }) => (
          <PlayerListItem
            item={item}
            index={index}
            lobby={lobby}
            getAvatarSource={getAvatarSource}
          />
        )}
      />
    </View>
  );
};
