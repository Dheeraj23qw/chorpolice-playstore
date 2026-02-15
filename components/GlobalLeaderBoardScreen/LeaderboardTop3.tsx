import React from "react";
import { View, StyleSheet } from "react-native";
import { Crown, Coins } from "lucide-react-native";
import { Text } from "@/components/Text";

type Player = {
  id: string;
  name: string;
  coins: number;
};

interface Props {
  topPlayers: Player[];
  getTier: (coins: number) => string;
}

// Single player card component
const TopPlayerCard = React.memo(
  ({ player, isFirst, getTier }: { player: Player; isFirst: boolean; getTier: (coins: number) => string }) => {
    return (
      <View style={[styles.cardContainer, { width: isFirst ? "36%" : "30%" }]}>
        <View style={[styles.avatarContainer, isFirst ? styles.firstAvatar : styles.otherAvatar]}>
          {isFirst ? <Crown size={30} color="white" /> : <Text style={styles.trophyIcon}>🏆</Text>}
        </View>

        <Text numberOfLines={1} style={styles.playerName}>
          {player.name}
        </Text>

        <View style={styles.coinsRow}>
          <Coins size={12} color="#facc15" />
          <Text style={styles.coinsText}>{player.coins.toLocaleString()}</Text>
        </View>

        <Text style={styles.tierText}>{getTier(player.coins)}</Text>
      </View>
    );
  }
);

export default React.memo(function LeaderboardTop3({ topPlayers, getTier }: Props) {
  return (
    <View style={styles.container}>
      {topPlayers.map((player, index) => (
        <TopPlayerCard key={player.id} player={player} isFirst={index === 0} getTier={getTier} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 32,
    marginBottom: 40,
  },
  cardContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  firstAvatar: {
    height: 80,
    width: 80,
    backgroundColor: "#4f46e5", // Indigo-600
    borderWidth: 2,
    borderColor: "#818cf8", // Indigo-400
  },
  otherAvatar: {
    height: 64,
    width: 64,
    backgroundColor: "#1e293b", // Slate-800
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  trophyIcon: {
    fontSize: 20,
  },
  playerName: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  coinsText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#facc15",
  },
  tierText: {
    marginTop: 4,
    fontSize: 10,
    color: "#94a3b8", // Slate-500
  },
});
