import React, { useMemo, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

interface HintSectionProps {
  hint: string | undefined;
}

const HintSection: React.FC<HintSectionProps> = React.memo(({ hint }) => {
  const animatedValue = useRef(new Animated.Value(0)).current; // Initial opacity value

  const memoizedHint = useMemo(() => {
    return hint || "No hint available.";
  }, [hint]); // Only re-compute when the hint prop changes

  useEffect(() => {
    // Start the animation when the hint changes
    Animated.timing(animatedValue, {
      toValue: 0.5, // Fade in
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Reset opacity after fade in
      Animated.timing(animatedValue, {
        toValue: 1, // Fade out
        useNativeDriver: true,
      }).start();
    });
  }, [memoizedHint]); // Depend on the memoized hint

  return (
    <View style={localStyles.hintContainer}>
      <ScrollView
        style={localStyles.hintScroll}
        nestedScrollEnabled={true}
        contentContainerStyle={localStyles.scrollContent}
        accessibilityLabel="Hint section"
      >
        <Animated.View style={{ opacity: animatedValue }}>
          <Text style={localStyles.hintText}>{memoizedHint}</Text>
        </Animated.View>
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
