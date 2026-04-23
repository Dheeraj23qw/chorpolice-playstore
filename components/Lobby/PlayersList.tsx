import React from "react";
import { View } from "react-native";

import { Text } from "@/components/Text";
import { PlayerListItem } from "./PlayerListItem";
import { LobbyState } from "./types";

interface PlayersListProps {
  lobby: LobbyState;
  getAvatarSource: (avatarId: number) => any;
}

export const PlayersList: React.FC<PlayersListProps> = ({ 
  lobby, 
  getAvatarSource 
}) => (
  <View className="mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4">
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-[10px] uppercase tracking-[3px] text-white/35">
        Who Is In
      </Text>
      <Text className="text-[10px] uppercase tracking-[2px] text-white/35">
        {lobby.maxPlayers} Seats Ready
      </Text>
    </View>

    {lobby.players.length > 0 ? (
      <View>
        {lobby.players.map((item, index) => (
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
        <Text className="font-main-bold text-white">Getting the room ready</Text>
        <Text className="mt-2 text-sm text-white/60">
          Everyone joining the room will appear here in a moment.
        </Text>
      </View>
    )}
  </View>
);
