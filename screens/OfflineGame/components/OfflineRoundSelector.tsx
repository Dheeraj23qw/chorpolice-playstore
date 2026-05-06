import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppDispatch, RootState } from "@/redux/store";
import { setTotalRounds } from "@/redux/reducers/offlineSessionSlice";
import { rf } from "@/utils/responsive";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import { Text } from "@/components/Text";

const ROUND_OPTIONS = [3, 5, 7, 10, 15];

const OfflineRoundSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const totalRounds = useSelector(
    (state: RootState) => state.offlineSession.totalRounds,
  );

  const handleRoundSelect = useCallback(
    (round: number) => {
      if (round === totalRounds) return;

      AudioEngine.play("select", "ui");
      dispatch(setTotalRounds(round));

      toast.success(
        "Rounds Set",
        `Game set to ${round} ${round === 1 ? "round" : "rounds"}.`,
        1000,
      );
    },
    [dispatch, totalRounds],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAccent} />

          <View>
            <Text
              style={styles.headerLabel}
              className="font-main-bold"
            >
              Match Length
            </Text>

            <Text
              style={styles.headerHint}
              className="font-main-bold"
            >
              Pick how long this table should run
            </Text>
          </View>
        </View>

        <View style={styles.totalBadge}>
          <Text
            style={styles.totalBadgeText}
            className="font-main-bold"
          >
            {totalRounds} Rounds
          </Text>
        </View>
      </View>

      <View style={styles.cardShell}>
        <LinearGradient
          colors={["rgba(59,130,246,0.10)", "rgba(255,255,255,0.02)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.innerBorder} />

        <View style={styles.optionsRow}>
          {ROUND_OPTIONS.map((round) => {
            const isSelected = totalRounds === round;

            return (
              <Pressable
                key={`round-${round}`}
                onPress={() => handleRoundSelect(round)}
                style={[
                  styles.optionButton,
                  isSelected
                    ? styles.optionButtonSelected
                    : styles.optionButtonIdle,
                ]}
              >
                {isSelected && (
                  <LinearGradient
                    colors={["#818CF8", "#4F46E5"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}

                <Text
                  style={[
                    styles.optionNumber,
                    isSelected
                      ? styles.optionNumberSelected
                      : styles.optionNumberIdle,
                  ]}
                  className="font-main-bold"
                >
                  {round}
                </Text>

                <Text
                  style={[
                    styles.optionCaption,
                    isSelected
                      ? styles.optionCaptionSelected
                      : styles.optionCaptionIdle,
                  ]}
                  className="font-main-bold"
                >
                  rounds
                </Text>

                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={13} color="white" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    width: "100%",
  },
  headerRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  headerAccent: {
    marginRight: 12,
    height: 20,
    width: 6,
    borderRadius: 999,
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  headerLabel: {
    fontSize: rf(1.1),
    color: "rgba(165, 180, 252, 0.72)",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  headerHint: {
    marginTop: 4,
    fontSize: rf(1.2),
    color: "rgba(255,255,255,0.52)",
  },
  totalBadge: {
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.24)",
    backgroundColor: "rgba(99,102,241,0.10)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  totalBadgeText: {
    fontSize: rf(1.05),
    color: "#C7D2FE",
  },
  cardShell: {
    overflow: "hidden",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
  },
  innerBorder: {
    position: "absolute",
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    width: "18%",
    aspectRatio: 0.92,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
  },
  optionButtonIdle: {
    borderColor: "rgba(99,102,241,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  optionButtonSelected: {
    borderColor: "#818CF8",
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  optionNumber: {
    fontSize: rf(1.55),
  },
  optionNumberIdle: {
    color: "rgba(255,255,255,0.42)",
  },
  optionNumberSelected: {
    color: "#FFFFFF",
  },
  optionCaption: {
    marginTop: 2,
    fontSize: rf(0.75),
  },
  optionCaptionIdle: {
    color: "rgba(255,255,255,0.26)",
  },
  optionCaptionSelected: {
    color: "rgba(255,255,255,0.78)",
  },
  checkBadge: {
    position: "absolute",
    right: 6,
    top: 6,
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
});

export default React.memo(OfflineRoundSelector);
