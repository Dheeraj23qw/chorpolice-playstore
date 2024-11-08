import { StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export const chorPoliceQuizstyles = StyleSheet.create({
  imageBackground: {
    flex: 1,

  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // This creates a semi-transparent black overlay
  },
  quizContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(5),
  },
  playerInfo: {
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },
  playerImage: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
    borderRadius: responsiveWidth(22.5),
    marginBottom: responsiveHeight(1.5),
    borderWidth: responsiveWidth(1.5),
    shadowColor: "#4682B4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    borderColor: "#87CEEB",
  },
  playerName: {
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    color: "#FF6347",
  },
  questionBox: {
    width: "90%",
    padding: responsiveWidth(5),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: responsiveWidth(4),
    borderWidth: responsiveWidth(1.5),
    shadowColor: "#4682B4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    marginBottom: responsiveHeight(4),
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    borderColor: "#87CEEB",
  },
  question: {
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: responsiveWidth(4),
    borderRadius: responsiveWidth(5),
    marginVertical: responsiveHeight(1.5),

    alignItems: "center",

    elevation: 5,
    shadowColor: "#B22222",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderColor: "#87CEEB",
    borderWidth: responsiveWidth(1.5),
  },
  optionText: {
    fontSize: responsiveFontSize(3),
    color: "#333",
    fontFamily: "myfont-bold",
    paddingHorizontal: responsiveWidth(14),
  },


});
