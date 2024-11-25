import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface HintSectionProps {
  hint: string | undefined;
}

const HintSection: React.FC<HintSectionProps> = React.memo(({ hint }) => {
  const memoizedHint = useMemo(() => {
    return hint || "No hint available.";
  }, [hint]); // Only re-compute when the hint prop changes

  return (
    <View style={localStyles.hintContainer}>
      <ScrollView
        style={localStyles.hintScroll}
        nestedScrollEnabled={true}
        contentContainerStyle={localStyles.scrollContent}
        accessibilityLabel="Hint section"
      >
        <Text style={localStyles.hintText}>{memoizedHint}</Text>
      </ScrollView>
    </View>
  );
});

export default HintSection;

const localStyles = StyleSheet.create({
  hintContainer: {
    flex: 1,
    backgroundColor: "rgba(173, 150, 242, 0.9)",
    padding: responsiveWidth(5), // 5% of the screen width
    borderRadius: 10,
    marginVertical: responsiveHeight(2),
  },
  hintScroll: {
    maxHeight: responsiveHeight(30),
  },
  scrollContent: {
    paddingVertical: responsiveHeight(1),
  },
  hintText: {
    color: "white",
    fontSize: responsiveFontSize(2),
    lineHeight: responsiveFontSize(2.5),
    letterSpacing: 1,
    textTransform: "capitalize",

    paddingVertical: responsiveHeight(1),
    fontFamily: "outfit-bold",
  },
});
