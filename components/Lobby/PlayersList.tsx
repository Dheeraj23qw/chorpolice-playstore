import React from "react";
import { View } from "react-native";

import { Text } from "@/components/Text";

import { PlayerListItem } from "./PlayerListItem";

export const PlayersList = ({ lobby, getAvatarSource }: any) => (
  <View className="mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4">
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
        Player Slots
      </Text>
      <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
        Always 4 Seats
      </Text>
    </View>

    {lobby.players.length > 0 ? (
      <View>
        {lobby.players.map((item: any, index: number) => (
          <PlayerListItem
            key={item.id}
            item={item}
            index={index}
            lobby={lobby}
            getAvatarSource={getAvatarSource}
          />
        ))}
      </View>
    ) : (
      <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="font-main-bold text-white">Waiting for lobby data</Text>
        <Text className="mt-2 text-sm text-white/60">
          The host will appear here as soon as the LAN session is ready.
        </Text>
      </View>
    )}
  </View>
);
