import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import { OfflinePlayer } from "@/redux/reducers/offlineSessionSlice";
import { OfflinePlayerCard } from "./OfflinePlayerCard";

interface OfflineSetupPlayerListCardProps {
  isOpen: boolean;
  players: OfflinePlayer[];
  onToggle: () => void;
  onNameChange: (index: number, name: string) => void;
  onAvatarPress: (index: number) => void;
}

export const OfflineSetupPlayerListCard: React.FC<
  OfflineSetupPlayerListCardProps
> = ({ isOpen, players, onToggle, onNameChange, onAvatarPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onToggle}
      className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-white/10"
    >
      <BlurView
        intensity={18}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(99,102,241,0.16)", "rgba(255,255,255,0.03)"]}
        className="absolute inset-0"
      />

      <View className="flex-row items-center px-5 py-4">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Ionicons name="people-outline" size={24} color="white" />
        </View>

        <View className="flex-1 pr-3">
          <Text
            style={{ fontSize: rf(1.25) }}
            className="font-main-bold text-white"
          >
            Player List
          </Text>
          <Text
            style={{ fontSize: rf(1.0) }}
            className="mt-1 font-main-bold text-white/45"
          >
            {isOpen ? "Edit names and avatars" : "Tap to open player setup"}
          </Text>
        </View>

        <View className="mr-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
          <Text
            style={{ fontSize: rf(0.92) }}
            className="font-main-bold text-white/75"
          >
            {players.length} Seats
          </Text>
        </View>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={22}
          color="white"
        />
      </View>

      {isOpen && (
        <View className="border-t border-white/10 px-4 pb-4 pt-4">
          <View className="gap-y-4">
            {players.map((player, index) => (
              <OfflinePlayerCard
                key={player.id}
                player={player}
                index={index}
                onNameChange={(name) => onNameChange(index, name)}
                onAvatarPress={() => onAvatarPress(index)}
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
