import React, { useMemo, useRef } from "react";
import { View, ScrollView } from "react-native";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Coins,
} from "lucide-react-native";
import { useSelector } from "react-redux";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { RootState } from "@/redux/store";

type Player = {
  id: string;
  name: string;
  coins: number;
  movement: number;
};

const CURRENT_USER_ID = "you";

/* ================= REALISTIC SERVER SIMULATION ================= */

const TOTAL_PLAYERS = 12438;
const MAX_COINS = 100000;

function generateServerPlayers(userCoins: number): Player[] {
  const players: Player[] = [];

  for (let i = 1; i <= 50; i++) {
    const randomCoins =
      MAX_COINS - Math.floor(Math.random() * MAX_COINS);

    players.push({
      id: String(i),
      name: `Player ${i}`,
      coins: randomCoins,
      movement: Math.floor(Math.random() * 5) - 2,
    });
  }

  // Inject user
  players.push({
    id: CURRENT_USER_ID,
    name: "You",
    coins: userCoins,
    movement: 0,
  });

  return players;
}

export default function LeaderboardScreen() {
  const coins = useSelector((state: RootState) => state.wallet.coins);

  const previousRankRef = useRef<number | null>(null);

  /* ================= GENERATE + SORT ================= */
  const sortedPlayers = useMemo(() => {
    const players = generateServerPlayers(coins);

    return players.sort((a, b) => b.coins - a.coins);
  }, [coins]);

  const currentUserRank =
    sortedPlayers.findIndex((p) => p.id === CURRENT_USER_ID) + 1;

  /* ================= MOVEMENT CALCULATION ================= */
  let userMovement = 0;
  if (previousRankRef.current !== null) {
    userMovement = previousRankRef.current - currentUserRank;
  }
  previousRankRef.current = currentUserRank;

  const getTier = (coins: number) => {
    if (coins > 90000) return "Diamond";
    if (coins > 75000) return "Platinum";
    if (coins > 60000) return "Gold";
    if (coins > 40000) return "Silver";
    return "Bronze";
  };

  return (
    <ScreenWrapper title="Global Leaderboard" variant="dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12 pt-4 bg-slate-950 px-5"
      >
        {/* ================= TOP 3 ================= */}
        <View className="flex-row items-end justify-between mt-8 mb-10">
          {sortedPlayers.slice(0, 3).map((player, index) => (
            <View
              key={player.id}
              className={`items-center ${
                index === 0 ? "w-[36%]" : "w-[30%]"
              }`}
            >
              <View
                className={`mb-3 items-center justify-center rounded-[28px] ${
                  index === 0
                    ? "h-20 w-20 bg-indigo-600 border-2 border-indigo-400"
                    : "h-16 w-16 bg-slate-800 border border-white/10"
                }`}
              >
                {index === 0 ? (
                  <Crown size={30} color="white" />
                ) : (
                  <Text className="text-xl">🏆</Text>
                )}
              </View>

              <Text
                numberOfLines={1}
                className="text-white font-main-bold text-xs"
              >
                {player.name}
              </Text>

              <View className="flex-row items-center mt-1">
                <Coins size={12} color="#facc15" />
                <Text className="ml-1 text-amber-400 text-xs font-main-bold">
                  {player.coins.toLocaleString()}
                </Text>
              </View>

              <Text className="text-[10px] text-slate-500 mt-1">
                {getTier(player.coins)}
              </Text>
            </View>
          ))}
        </View>

        {/* ================= FULL LIST ================= */}
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.id === CURRENT_USER_ID;

          const movement =
            isCurrentUser ? userMovement : player.movement;

          return (
            <View
              key={player.id}
              className={`flex-row items-center rounded-[24px] p-4 mb-3 ${
                isCurrentUser
                  ? "bg-indigo-600/10 border border-indigo-500/30"
                  : "bg-slate-900/60 border border-white/5"
              }`}
            >
              {/* Rank */}
              <View className="w-10 items-center">
                <Text className="text-slate-400 font-main-bold text-sm">
                  #{index + 1}
                </Text>
              </View>

              {/* Info */}
              <View className="flex-1 ml-2">
                <Text className="font-main-bold text-sm text-white">
                  {player.name}
                </Text>

                <View className="flex-row items-center mt-1">
                  {movement > 0 ? (
                    <>
                      <TrendingUp size={10} color="#22c55e" />
                      <Text className="text-emerald-500 text-[10px] ml-1">
                        +{movement}
                      </Text>
                    </>
                  ) : movement < 0 ? (
                    <>
                      <TrendingDown size={10} color="#ef4444" />
                      <Text className="text-red-500 text-[10px] ml-1">
                        {movement}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-slate-500 text-[10px]">
                      No change
                    </Text>
                  )}
                </View>
              </View>

              {/* Coins */}
              <View className="items-end mr-3">
                <View className="flex-row items-center">
                  <Coins size={12} color="#facc15" />
                  <Text className="ml-1 text-white font-main-bold text-sm">
                    {player.coins.toLocaleString()}
                  </Text>
                </View>
                <Text className="text-[9px] text-slate-600 uppercase">
                  COINS
                </Text>
              </View>

              <ChevronRight size={14} color="#334155" />
            </View>
          );
        })}

        {/* ================= USER SUMMARY ================= */}
        <View className="mt-10 rounded-[32px] bg-slate-900 p-6 border border-white/5">
          <Text className="text-slate-400 text-xs uppercase tracking-widest">
            Your Current Standing
          </Text>

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-white font-main-bold text-lg">
              Rank #{currentUserRank}
            </Text>

            <Text className="text-indigo-400 font-main-bold text-sm">
              {getTier(coins)} Tier
            </Text>
          </View>

          <Text className="text-slate-500 text-xs mt-2">
            Competing against {TOTAL_PLAYERS.toLocaleString()} global players
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
