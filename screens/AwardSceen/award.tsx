import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { responsiveHeight } from "react-native-responsive-dimensions";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { styles } from "@/screens/AwardSceen/_CSS/mainCSS";

const RewardScreen: React.FC = () => {
  const rewards = [
    {
      id: 1,
      title: "Golden Trophy",
      unlocked: false,
      description: "Win 5 games",
    },
    {
      id: 2,
      title: "Silver Medal",
      unlocked: true,
      description: "Score 1000 points",
    },
    {
      id: 3,
      title: "Bronze Shield",
      unlocked: false,
      description: "Play 10 matches",
    },
    {
      id: 4,
      title: "Magic Wand",
      unlocked: true,
      description: "Special achievement",
    },
  ];

  const playerStats = {
    totalQuizPlayed: 20,
    totalQuizScore: 1500,
    totalRajamantriPlayed: 24,
  };



  return (
    <SafeAreaView style={[globalstyles.container, styles.screenBackground]}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/images/chorsipahi/kid1.png")}
          style={styles.profileImage}
        />
        <View style={styles.statsContainer}>
          <Text style={styles.profileName}>Hello!</Text>
          <Text style={styles.profileName}>Dheeraj Kumar</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <FontAwesome name="gamepad" size={20} color="gray" />
              <Text style={styles.statsText}>
                Quizzes Played: {playerStats.totalQuizPlayed}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <FontAwesome name="trophy" size={20} color="gray" />
              <Text style={styles.statsText}>
                Total Quiz Score: {playerStats.totalQuizScore}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <MaterialIcons name="gamepad" size={20} color="gray" />
              <Text style={styles.statsText}>
                Chor police game played: {playerStats.totalRajamantriPlayed}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Streak</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <Text style={styles.streakTitle}>Current Streak</Text>
              <Text style={styles.streakValue}>5 Days</Text>
            </View>
            <View style={styles.streakCard}>
              <Text style={styles.streakTitle}>Highest Streak</Text>
              <Text style={styles.streakValue}>10 Days</Text>
            </View>
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rewardsScroll}
          >
            {rewards.map((reward) => (
              <View
                key={reward.id}
                style={[
                  styles.rewardCard,
                  reward.unlocked ? styles.unlocked : styles.locked,
                ]}
              >
                <Image
                  source={require("../../assets/images/chorsipahi/kid1.png")}
                  style={styles.rewardImage}
                />
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>
                  {reward.description}
                </Text>
                {!reward.unlocked && (
                  <View style={styles.lockOverlay}>
                    <Entypo name="lock" size={24} color="white" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RewardScreen;
