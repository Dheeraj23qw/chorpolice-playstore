import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

 export const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9f9f9", // Darker overlay for better contrast
    },
    container: {
      width: responsiveWidth(90),
      maxWidth: 420,
      paddingVertical: responsiveHeight(4),
      paddingHorizontal: responsiveWidth(5),
      borderRadius: 25,
      backgroundColor: "#f9f9f9", // Softer white background
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.8)", // Adds a sleek border
    },
    // Specific style for video content
    videoContainer: {
      justifyContent: "center", // Center the video vertically
      alignItems: "center", // Center the video horizontally
      backgroundColor: "#f9f9f9",
      borderRadius: 20,
      overflow: "hidden", // Ensures no overflow for the video
      marginTop: responsiveHeight(2),
      width: "100%", 
      height:"auto"
    },
    // Default container style (used for image and gif)
    defaultContainer: {
      backgroundColor: "#f9f9f9",
    },
    description: {
      fontSize: responsiveFontSize(3), // Bigger and funkier font
      color: "#333", // Slightly darker for better contrast
      marginBottom: responsiveHeight(2),
      textAlign: "center",
      paddingHorizontal: responsiveWidth(4),
      letterSpacing: 1.5, // Adding spacing for more emphasis
      textTransform: "uppercase", // For added funkiness
      fontFamily: "outfit-bold", // A fun font for a youthful look
    },
    // Media styling for images and gifs
    media: {
      width: "100%",
      height: responsiveHeight(30),
      borderRadius: 20,
      marginTop: responsiveHeight(2),
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.1)", // Light border around media
    },
    // Full media for video
    fullMedia: {
      width: "100%",
      height: "100%",
      borderRadius: 20,
      resizeMode: "cover", // Ensures the video scales properly without distortion
    },
 
        closeText: {
            fontSize: 16,
            color: "black",
            fontWeight: "bold",
            textDecorationLine: "underline",
            marginTop: 15,
            opacity: 0.8,
          },
      
  });