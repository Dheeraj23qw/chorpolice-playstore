import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { wp } from "@/utils/responsive";

interface StandingsDropdownProps {
  standings: any[];
  getAvatarSource: (id: number) => any;
  isOpen: boolean;
  onToggle: (value: boolean) => void;
}

export const StandingsDropdown = ({
  standings,
  getAvatarSource,
  isOpen,
  onToggle,
}: StandingsDropdownProps) => {
  if (!standings || standings.length === 0) return null;

  return (
    <View className="mt-8">
      {/* HEADER */}
      <TouchableOpacity
        onPress={() => onToggle(!isOpen)}
        className="mb-4 flex-row items-center justify-between px-2"
        activeOpacity={0.7}
      >
        <Text className="font-main-bold text-lg text-white">
          Final Standings
        </Text>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#818cf8"
        />
      </TouchableOpacity>

      {/* LIST */}
      {isOpen && (
        <View>
          {standings.map((item, index) => {
            const isTop = index === 0;

            const medal =
              index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : index === 2
                    ? "🥉"
                    : null;

            return (
              <View
                key={item.playerId}
                className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${
                  isTop
                    ? "border-indigo-500/30 bg-indigo-500/10"
                    : "border-white/5 bg-white/5"
                }`}
              >
                {/* LEFT */}
                <View className="flex-1 flex-row items-center">
                  <View className="w-8 items-center">
                    {medal ? (
                      <Text style={{ fontSize: 18 }}>{medal}</Text>
                    ) : (
                      <Text className="font-main-bold text-xs text-white/25">
                        #{index + 1}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{ width: wp(10), height: wp(10) }}
                    className="ml-2 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-white/10"
                  >
                    <Image
                      source={getAvatarSource(item.avatarId)}
                      style={{ width: wp(8), height: wp(8) }}
                      resizeMode="contain"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className={`font-main-bold text-sm ${
                        isTop ? "text-indigo-400" : "text-white"
                      }`}
                    >
                      {item.name}
                    </Text>

                    <Text className="text-[8px] uppercase tracking-widest text-white/20">
                      {index === 0 ? "Grand Champion" : `Rank #${index + 1}`}
                    </Text>
                  </View>
                </View>

                {/* RIGHT */}
                <View className="items-end">
                  <Text className="font-main-bold text-lg text-white">
                    {item.correctCount}
                  </Text>
                  <Text className="text-[8px] uppercase text-white/20">
                    Correct
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
