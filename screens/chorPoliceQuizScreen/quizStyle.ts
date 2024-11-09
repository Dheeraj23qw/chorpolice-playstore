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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
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
    shadowColor: "#FFD700", // Shadow color in yellow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    borderColor: "#FFD700", // Yellow border color
  },
  playerName: {
 
    fontSize: responsiveFontSize(3.4),
    fontWeight: "800",
    color: "red", // Rich indigo color for a classy look
    textAlign: "center",
    fontFamily: "outfit-bold", // Use a serif or custom classy font here
    textShadowColor: "rgba(0, 0, 0, 0.2)", // Subtle shadow for elegance
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questionBox: {
    width: "90%",
    padding: responsiveWidth(5),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: responsiveWidth(4),
    borderWidth: responsiveWidth(1.5),
    shadowColor: "#FFD700", // Yellow shadow for modern look
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    marginBottom: responsiveHeight(4),
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    borderColor: "#FFD700", // Yellow border color
  },
  question: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: "600",
    color: "#7653ec", // Rich indigo color for a classy look
    textAlign: "center",
    fontFamily: "outfit-bold", // Use a serif or custom classy font here
    textShadowColor: "rgba(0, 0, 0, 0.2)", // Subtle shadow for elegance
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  option: {
    width: responsiveWidth(60), // Set a fixed width to make all option boxes the same size
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: responsiveWidth(4),
    borderRadius: responsiveWidth(5),
    marginVertical: responsiveHeight(1.5),
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FFD700", // Yellow shadow for options
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderColor: "#FFD700", // Yellow border color for options
    borderWidth: responsiveWidth(1.5),
  },
  optionText: {
    fontSize: responsiveFontSize(2.8),
    color: "#333333", // Slightly muted black for sophistication
    fontFamily: "myfont-bold",
    textAlign: "center",
    width: "100%",
    textShadowColor: "rgba(0, 0, 0, 0.2)", // Adds depth with shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bulbIcon: {
    position: 'absolute',
    top: '5%',  // Adjust to position the icon at the top
    left: '90%', // Center horizontally
    transform: [{ translateX: -20 }], // Adjust for perfect centering
    fontSize: 50, // Icon size
    color: '#FFD700', // Bulb color
    textShadowColor: '#FFD700',  // Glowing color
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,  // Glowing effect radius
  }
  

});
