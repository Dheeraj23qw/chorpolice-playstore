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
  betAmount: number;
  winnerId: string | null;
}

export const StandingsDropdown = ({
  standings,
  getAvatarSource,
  isOpen,
  onToggle,
  betAmount,
  winnerId,
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

            const rawMatchEarning = item.playerId === winnerId ? betAmount * 3 : -betAmount;
            const matchEarning = Object.is(rawMatchEarning, -0) ? 0 : rawMatchEarning;

            return (
              <View
                key={item.playerId}
                className={`mb-3 flex-row items-center justify-between rounded-2xl border p-3 ${
                  isTop
                    ? "border-indigo-500/30 bg-indigo-500/10"
                    : "border-white/5 bg-white/5"
                }`}
              >
                {/* LEFT — rank + circular avatar + name */}
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
                    className="ml-2 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-white/10"
                  >
                    <Image
                      source={getAvatarSource(item.avatarId)}
                      style={{ width: wp(10), height: wp(10) }}
                      resizeMode="cover"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className={`font-main-bold text-sm ${
                        isTop ? "text-indigo-400" : "text-white"
                      }`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-[8px] uppercase tracking-widest text-white/20">
                      {index === 0 ? "Grand Champion" : `Rank #${index + 1}`}
                    </Text>
                  </View>
                </View>

                {/* CORRECT COLUMN */}
                <View className="items-center px-2">
                  <Text className="font-main-bold text-base text-white">
                    {item.correctCount}
                  </Text>
                  <Text className="text-[8px] uppercase text-white/20">
                    Correct
                  </Text>
                </View>

                {/* MATCH EARNING COLUMN */}
                {betAmount > 0 && (
                  <View className="items-center pl-2 ml-2 border-l border-white/10">
                    <Text
                      className={`font-main-bold text-base ${
                        matchEarning > 0
                          ? "text-emerald-400"
                          : matchEarning < 0
                            ? "text-red-400"
                            : "text-white/50"
                      }`}
                    >
                      {matchEarning > 0 ? "+" : ""}
                      {matchEarning.toLocaleString()}
                    </Text>
                    <Text className="text-[8px] uppercase text-white/20">
                      Match
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
