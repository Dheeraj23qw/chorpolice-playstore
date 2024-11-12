import { StyleSheet } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  screenBackground: {
    backgroundColor: "#F5F5F5", // Light background color
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: responsiveHeight(5),
    paddingBottom: responsiveHeight(4),
    shadowColor: "#000",
    backgroundColor: "#7653ec", // Purple background
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: "#F4B400", // Gold border for profile picture
    borderWidth: 2,
  },
  statsContainer: {
    marginLeft: 20,
  },
  profileName: {
    color: "#fff", // White text for profile name
    fontSize: 20,
    fontWeight: "900",
  },

  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  sectionContainer: {
    backgroundColor: "#FFF", // White background for each section
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    color: "#333", // Dark text color for section titles
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
   // New styles for player stats section
   statsCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#F9F9F9", // Light gray background for the stats card
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center", // Vertically align the content
    marginBottom: 12, // Spacing between rows
  },
  statsText: {
    color: "#333", // Dark text for stat values
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10, // Space between the icon and text
  },
  slider: {
    width: "100%", // Full width to span the container
    height: 40,
    marginTop: 10,
  },
  sliderLabel: {
    color: "#333", // Dark color for the label text
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center", // Center the label text
  },
  rewardsScroll: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  rewardCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    marginRight: 15,
    padding: 12,
    backgroundColor: "#FFF", // White background for rewards
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  unlocked: {
    borderColor: "#F4B400", // Gold border for unlocked rewards
    borderWidth: 1,
  },
  locked: {
    borderColor: "#D3D3D3", // Gray border for locked rewards
    borderWidth: 1,
  },
  rewardImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  rewardTitle: {
    color: "#333", // Dark text for reward titles
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  rewardDescription: {
    color: "#888", // Lighter color for reward description
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  lockText: {
    color: "#FFF", // White text for the lock overlay
    fontSize: 14,
    fontWeight: "bold",
  },
  achievementCard: {
    backgroundColor: "#FAFAFA", // Light gray background for achievements
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row", // Align image and text horizontally
    alignItems: "center", // Vertically align the content
  },
  
  achievementImage: {
    width: 50,
    height: 50,
    marginRight: 10, // Space between image and text
    borderRadius: 25, // To make the image circular
  },
  
  achievementTextContainer: {
    flex: 1, // Make sure text takes up the remaining space
  },
  
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333", // Dark color for achievement title
  },
  
  achievementDate: {
    fontSize: 12,
    color: "#999", // Lighter color for date
    marginTop: 4,
  },

  streakContainer: {
    flexDirection: "row", // Aligns two items horizontally
    justifyContent: "space-around", // Spreads them equally
    alignItems: "center", // Vertically aligns them in the middle
    marginTop: 10,
  },
  streakCard: {
    width: 150, // Adjusted for better proportions
    height: 150, // Circular container
    backgroundColor: "#e8e8e8", // Soft background
    borderRadius: 75, // Full roundness
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8, // Elevation for Android
    borderWidth: 2, // Adds border for distinction
    borderColor: "#ddd", // Light grey border
    marginHorizontal: 10, // Small spacing between circles
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: "600", // Slightly bolder for clarity
    color: "#777",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold", 
    color: "#2c3e50", // Darker, contrasting color
  },

});
