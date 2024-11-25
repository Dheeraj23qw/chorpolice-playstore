import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

interface HintSectionProps {
  hint: string | undefined;
}

const HintSection: React.FC<HintSectionProps> = ({ hint }) => {
  return (
    <View style={localStyles.hintContainer}>
      <ScrollView style={localStyles.hintScroll} nestedScrollEnabled={true}>
        <Text style={styles.instructionText}>{hint || "No hint available."}</Text>
      </ScrollView>
    </View>
  );
};

export default HintSection;

const localStyles = StyleSheet.create({
  hintContainer: {
    flex: 1,
    backgroundColor: "rgba(173, 150, 242, 0.9)",
    padding: responsiveWidth(5), // 5% of the screen width
    borderRadius: 10,
  },
  hintScroll: {
    maxHeight: responsiveHeight(30), 
  },
  hintText: {
    color: "white",
    fontSize: responsiveFontSize(1.7), 
    lineHeight: responsiveFontSize(2.5), 
    letterSpacing: 1, 
    textTransform: "capitalize", 
    textShadowColor: "rgba(173, 150, 242, 0.6)", 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3, 
    paddingVertical: responsiveHeight(1), 
    fontFamily:"outfit-bold"
  }
});
