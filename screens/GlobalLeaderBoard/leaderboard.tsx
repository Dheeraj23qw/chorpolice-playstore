import React, { useMemo, useRef } from "react";
import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";
import ScreenWrapper from "@/components/screenwrapper";
import { RootState } from "@/redux/store";
import LeaderboardTop3 from "@/components/GlobalLeaderBoardScreen/LeaderboardTop3";
import LeaderboardRow from "@/components/GlobalLeaderBoardScreen/LeaderboardRow";
import UserSummaryCard from "@/components/GlobalLeaderBoardScreen/UserSummaryCard";

const CURRENT_USER_ID = "you";
const TOTAL_PLAYERS = 12438;
const MAX_COINS = 100000;

type Player = {
  id: string;
  name: string;
  coins: number;
  movement: number;
};

function generateServerPlayers(userCoins: number): Player[] {
  const players: Player[] = [];
  for (let i = 1; i <= 50; i++) {
    players.push({
      id: String(i),
      name: `Player ${i}`,
      coins: MAX_COINS - Math.floor(Math.random() * MAX_COINS),
      movement: Math.floor(Math.random() * 5) - 2,
    });
  }
  players.push({ id: CURRENT_USER_ID, name: "You", coins: userCoins, movement: 0 });
  return players;
}

export default function LeaderboardScreen() {
  const coins = useSelector((state: RootState) => state.wallet.coins);
  const previousRankRef = useRef<number | null>(null);

  const sortedPlayers = useMemo(() => {
    const players = generateServerPlayers(coins);
    return players.sort((a, b) => b.coins - a.coins);
  }, [coins]);

  const currentUserRank = sortedPlayers.findIndex((p) => p.id === CURRENT_USER_ID) + 1;

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

  const renderItem = ({ item, index }: { item: Player; index: number }) => (
    <LeaderboardRow
      rank={index + 1}
      player={item}
      movement={item.id === CURRENT_USER_ID ? userMovement : item.movement}
      isCurrentUser={item.id === CURRENT_USER_ID}
    />
  );

  return (
    <ScreenWrapper title="Global Leaderboard" variant="dark">
      <FlatList
        data={sortedPlayers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 16, paddingHorizontal: 20, backgroundColor: "#0f172a" }}
        ListHeaderComponent={
          <>
            <LeaderboardTop3 topPlayers={sortedPlayers.slice(0, 3)} getTier={getTier} />
            <UserSummaryCard rank={currentUserRank} coins={coins} getTier={getTier} totalPlayers={TOTAL_PLAYERS} />
          </>
        }
        initialNumToRender={10} // render first 10 items only
        maxToRenderPerBatch={10} // batch size for virtualization
        windowSize={5} // viewport multiplier
        removeClippedSubviews={true} // improve memory usage
      />
    </ScreenWrapper>
  );
}
