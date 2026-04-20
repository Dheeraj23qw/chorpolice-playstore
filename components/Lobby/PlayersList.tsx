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
        ListEmptyComponent={
          !lobby.isHost ? (
            <View className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <Text className="font-main-bold text-base text-white">
                No host found yet
              </Text>
              <Text className="mt-2 text-sm leading-5 text-white/70">
                Make sure both phones are on the same WiFi and the host screen is already open.
              </Text>
              <Text className="mt-3 text-xs text-white/50">
                Your IP: {lobby.localIp || "unknown"}
              </Text>
              <Text className="mt-1 text-xs text-white/40">
                If this stays empty, check the debug overlay / console for LAN discovery logs.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};
