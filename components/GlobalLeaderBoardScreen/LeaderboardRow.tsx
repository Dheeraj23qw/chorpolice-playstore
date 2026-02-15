import React from "react";
import { View, StyleSheet } from "react-native";
import { Coins, TrendingUp, TrendingDown, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/Text";

interface Player {
  id: string;
  name: string;
  coins: number;
}

interface Props {
  rank: number;
  player: Player;
  movement: number;
  isCurrentUser?: boolean;
}

// Movement indicator component
const MovementIndicator = React.memo(({ movement }: { movement: number }) => {
  if (movement > 0) {
    return (
      <View style={styles.movementRow}>
        <TrendingUp size={10} color="#22c55e" />
        <Text style={[styles.movementText, { color: "#22c55e" }]}>+{movement}</Text>
      </View>
    );
  } else if (movement < 0) {
    return (
      <View style={styles.movementRow}>
        <TrendingDown size={10} color="#ef4444" />
        <Text style={[styles.movementText, { color: "#ef4444" }]}>{movement}</Text>
      </View>
    );
  } else {
    return <Text style={styles.noChangeText}>No change</Text>;
  }
});

const LeaderboardRow = ({ rank, player, movement, isCurrentUser }: Props) => {
  return (
    <View style={[styles.container, isCurrentUser ? styles.currentUser : styles.otherUser]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      {/* Player Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.playerName}>{player.name}</Text>
        <MovementIndicator movement={movement} />
      </View>

      {/* Coins */}
      <View style={styles.coinsContainer}>
        <View style={styles.coinsRow}>
          <Coins size={12} color="#facc15" />
          <Text style={styles.coinsText}>{player.coins.toLocaleString()}</Text>
        </View>
        <Text style={styles.coinsLabel}>COINS</Text>
      </View>

      <ChevronRight size={14} color="#334155" />
    </View>
  );
};

export default React.memo(LeaderboardRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  currentUser: {
    backgroundColor: "rgba(79, 70, 229, 0.1)", // Indigo-600/10
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)", // Indigo-500/30
  },
  otherUser: {
    backgroundColor: "rgba(30, 41, 59, 0.6)", // Slate-900/60
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    color: "#94a3b8", // Slate-400
    fontWeight: "700",
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  playerName: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  movementText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: "700",
  },
  noChangeText: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
  },
  coinsContainer: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsText: {
    marginLeft: 4,
    fontWeight: "700",
    fontSize: 14,
    color: "white",
  },
  coinsLabel: {
    fontSize: 9,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginTop: 2,
  },
});
