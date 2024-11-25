import { StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    backgroundImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: responsiveWidth(5),
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    heading: {
      fontSize: responsiveFontSize(4.6),
      color: "#fff",
      marginBottom: responsiveHeight(2),
      fontFamily: "outfit-bold",
      textShadowColor: "#FFD700",
      textShadowOffset: { width: 0, height: 2 },
    },
    score: {
      fontSize: responsiveFontSize(3),
      color: "#fff",
      marginBottom: responsiveHeight(3),
      fontFamily: "outfit-bold",
      textShadowColor: "#FFD700",
      textShadowOffset: { width: 0, height: 2 },
    },
    message: {
      fontSize: responsiveFontSize(3.1),
      color: "#fff",
      textAlign: "center",
      marginBottom: responsiveHeight(3),
      fontFamily: "outfit-bold",
      textShadowColor: "#FFD700",
      textShadowOffset: { width: 0, height: 2 },
    },
    gif: {
      width: responsiveWidth(100),
      height: responsiveHeight(25),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: responsiveHeight(4),
    },
    coinMessage: {
      fontSize: responsiveFontSize(2.6),
      color: "#FFD700",
      textAlign: "center",
      marginTop: responsiveHeight(2),
      fontFamily: "outfit-bold",
      textShadowColor: "#FFD700",
      textShadowOffset: { width: 0, height: 2 },
      marginBottom: responsiveHeight(4),
  
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: responsiveWidth(2),
      marginTop: responsiveHeight(4),
      flexWrap: 'wrap',
      gap:13,
    },
    
    button: {
      backgroundColor: "#6C5B7B", // Modern muted purple color
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(2),
      borderRadius: 15, // More rounded corners for a soft feel
      marginVertical: responsiveHeight(1),
      width: "30%", // Adjust width to 30% of container for responsiveness
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3, // For Android shadow support
    },
    
    buttonText: {
      fontSize: responsiveFontSize(2), // Slightly larger font size for better readability
      color: "#fff",
      textAlign: "center",
      fontWeight: "600", // A bit more emphasis on the text
      letterSpacing: 1.5, // Slight spacing between letters for a modern touch
      textTransform: "capitalize", // Makes text look cleaner
    },
  });

