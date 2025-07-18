import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { StyleSheet } from "react-native";

export const ChorPoloceLeaderboardStyles = StyleSheet.create({
  content: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    backgroundColor: "#FFFFFF", // White background for a clean look
  },

  winnerContainer: {
    alignItems: "center",
    marginBottom: responsiveHeight(2),
    backgroundColor: "#E5E8F0", // Soft blue-gray for a more playful look
    padding: responsiveWidth(4),
    borderRadius: 20,
    shadowColor: "#FFD700", // Golden shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4, // Slightly thicker border
    borderColor: "#FFD700", // Golden border to enhance the look
  },
  winnerImage: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    borderColor: "#FFD700", // Gold border
    borderWidth: 4,
    marginBottom: responsiveHeight(1),
    backgroundColor: "#FFFFFF", // Ensures image background is white
  },
  winnerName: {
    fontSize: responsiveFontSize(2.9),
    color: "#8E5DE9", // Matches the header color for consistency
    fontFamily: "outfit-bold", // Using outfit-bold
  },
  congratulations: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: "bold",
    color: "#8E5DE9", // Vibrant purple for a cohesive look
    marginBottom: responsiveHeight(1),
    textShadowColor: "#FFD700", // Golden text shadow for consistency
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  winnerScore: {
    fontSize: responsiveFontSize(2.9),
    fontWeight: "bold",
    color: "#4B0082", // Darker indigo for contrast
    margin: responsiveHeight(1),
    textShadowColor: "#FFD700", // Golden text shadow
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rankContainer: {
    marginTop: responsiveHeight(1),
    backgroundColor: "#E8F4FD", // Light pastel blue for a soft touch
    padding: responsiveWidth(2),
    borderRadius: 20,
    shadowColor: "#FFD700", // Golden shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4, // Thicker border for a bolder effect
    borderColor: "#FFD700", // Golden border
    overflow: "hidden", // Adds a nice rounded corner effect
  },

  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
    backgroundColor: "#F0F8FF", // Very light blue for a friendly and playful touch
    padding: responsiveWidth(1),
    borderRadius: 10,
    shadowColor: "#FFD700", // Golden shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden", // Adds a nice rounded corner effect
  },

  playerImage: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    marginRight: responsiveWidth(3),
    borderColor: "#FFD700", // Gold border for the player image
    borderWidth: 3,
    transform: [{ scale: 1.05 }], // Adds a slight zoom effect
    shadowColor: "#FFD700", // Golden shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  playerName: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: "#333333", // Dark gray for readability
    flex: 1,
    fontFamily: "outfit-medium", // Using outfit-medium
    textShadowColor: "#FFD700", // Golden text shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  playerScore: {
    fontSize: responsiveFontSize(2.4),
    color: "#FF4500", // Orange red for a bright look
    fontFamily: "outfit-bold", // Using outfit-bold
    textShadowColor: "#FFD700", // Golden shadow for text
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
