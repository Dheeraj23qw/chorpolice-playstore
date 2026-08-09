import React from "react";
import { Image, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { OfflinePlayer } from "@/redux/reducers/offlineSessionSlice";

interface OfflineLeaderboardModalProps {
  visible: boolean;
  players: OfflinePlayer[];
  scores: number[];
  onClose: () => void;
}

export const OfflineLeaderboardModal: React.FC<
  OfflineLeaderboardModalProps
> = ({ visible, players, scores, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/80">
        <Pressable className="flex-1" onPress={onClose} />
        <MotiView
          from={{ translateY: 600 }}
          animate={{ translateY: 0 }}
          className="rounded-t-[40px] border-t border-white/10 bg-[#0a0a0c]"
          style={{ marginTop: "auto" }}
        >
          <View className="p-8 pb-12">
          <View className="mb-8 flex-row items-center justify-between">
            <Text className="font-main-bold text-2xl text-white">
              Leaderboard
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          <View className="gap-y-4">
            {players.map((player, index) => (
              <View
                key={player.id}
                className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <View className="flex-row items-center">
                  <Image
                    source={playerImages[player.avatarId]?.src || playerImages[1].src}
                    className="mr-4 h-12 w-12 rounded-full"
                  />
                  <Text className="font-main-bold text-lg text-white">
                    {player.name || `Player ${index + 1}`}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-main-bold text-xl text-indigo-400">
                    {scores[index] || 0}
                  </Text>
                  <Text className="text-[10px] uppercase tracking-widest text-white/30">
                    Total Points
                  </Text>
                </View>
              </View>
            ))}
          </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
