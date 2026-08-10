import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface BoostScoreModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  currentScore: number;
}

export const BoostScoreModal: React.FC<BoostScoreModalProps> = ({
  visible,
  onAccept,
  onDecline,
  currentScore,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onDecline}
  >
    <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.iconShell}>
            <Ionicons name="rocket" size={38} color="#C7D2FE" />
          </View>

          <Text style={styles.title}>Boost your score?</Text>
          <Text style={styles.subtitle}>
            Level 1 is complete. Play the Score Boost quiz for a chance to add up to 8,000 points.
          </Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>YOUR CURRENT SCORE</Text>
            <Text style={styles.scoreValue}>{currentScore.toLocaleString()}</Text>
            <View style={styles.boostPill}>
              <Ionicons name="flash" size={16} color="#FDE68A" />
              <Text style={styles.boostText}>UP TO 8,000 BONUS POINTS</Text>
            </View>
          </View>

          <View style={styles.termsCard}>
            <Text style={styles.termsTitle}>TERMS &amp; CONDITIONS</Text>
            <Rule icon="checkmark-circle" color="#4ADE80" text="Each correct score prediction earns +2,000 points." />
            <Rule icon="time-outline" color="#FACC15" text="You have 7 seconds to choose an answer for each question." />
            <Rule icon="close-circle" color="#F87171" text="A wrong or missed prediction deducts 2,000 points." />
            <Rule icon="people-outline" color="#A5B4FC" text="You cannot answer the question about your own score." />
            <Rule icon="gift-outline" color="#FDE68A" text="Finish Level 2 to earn a 2,000-point completion bonus." />
          </View>

          <TouchableOpacity activeOpacity={0.84} onPress={onAccept} style={styles.acceptButton}>
            <LinearGradient
              colors={["#6366F1", "#4338CA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flash" size={21} color="#FFFFFF" />
            <Text style={styles.acceptText}>YES, BOOST MY SCORE</Text>
          </TouchableOpacity>

          <Pressable onPress={onDecline} style={styles.declineButton}>
            <Text style={styles.declineText}>SKIP LEVEL 2</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const Rule = ({ icon, color, text }: { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; text: string }) => (
  <View style={styles.ruleRow}>
    <Ionicons name={icon} size={19} color={color} />
    <Text style={styles.ruleText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(4, 5, 15, 0.52)",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4B548E",
    borderRadius: 28,
    backgroundColor: "#101225",
  },
  content: {
    padding: 22,
  },
  iconShell: {
    width: 72,
    height: 72,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#7C83E8",
    borderRadius: 24,
    backgroundColor: "#27275B",
  },
  title: {
    textAlign: "center",
    fontSize: rf(2.65),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: rf(1.3),
    lineHeight: rf(1.8),
    fontFamily: "main-md",
    color: "#D1D5F7",
  },
  scoreCard: {
    alignItems: "center",
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#505A9F",
    borderRadius: 20,
    backgroundColor: "#1A1D38",
  },
  scoreLabel: {
    fontSize: rf(1.05),
    fontFamily: "main-bold",
    color: "#A5B4FC",
    letterSpacing: 1.4,
  },
  scoreValue: {
    marginTop: 3,
    fontSize: rf(3.5),
    fontFamily: "main-bold",
    color: "#FFFFFF",
  },
  boostPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#58490E",
  },
  boostText: {
    marginLeft: 6,
    fontSize: rf(0.95),
    fontFamily: "main-bold",
    color: "#FEF3C7",
    letterSpacing: 0.8,
  },
  termsCard: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#363B62",
    borderRadius: 18,
    backgroundColor: "#14172A",
  },
  termsTitle: {
    marginBottom: 10,
    fontSize: rf(1.05),
    fontFamily: "main-bold",
    color: "#FFFFFF",
    letterSpacing: 1.3,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  ruleText: {
    flex: 1,
    marginLeft: 9,
    fontSize: rf(1.1),
    lineHeight: rf(1.55),
    fontFamily: "main-md",
    color: "#D6D9EF",
  },
  acceptButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 18,
    borderRadius: 17,
  },
  acceptText: {
    marginLeft: 8,
    fontSize: rf(1.35),
    fontFamily: "main-bold",
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  declineButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },
  declineText: {
    fontSize: rf(1.12),
    fontFamily: "main-bold",
    color: "#B8BDD9",
    letterSpacing: 1,
  },
});
