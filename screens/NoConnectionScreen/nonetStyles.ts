import { StyleSheet } from "react-native";

import {
    responsiveHeight as rh,
    responsiveWidth as rw,
    responsiveFontSize as rf,
  } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#e9e9e7",
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    gradientOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    backButton: {
      position: "absolute",
      top: rh(6), // Dynamically positioned
      left: rw(5),
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 50,
      padding: rw(3),
      zIndex: 2,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    message: {
      position: "absolute",
      top: rh(26), 
      color: "#333",
      fontSize: rf(3.5), // Responsive font size
      fontWeight: "bold",
      textAlign: "center",
    },
    retryButton: {
      position: "absolute",
      bottom: rh(16), 
  
      backgroundColor: "#FFD700",
      paddingVertical: rh(1.5),
      paddingHorizontal: rw(10),
      borderRadius: rw(3),
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: rw(1),
      elevation: 5, // For Android shadow
    },
    retryText: {
      color: "#333",
      fontSize: rf(2.5),
      fontWeight: "600",
    },
    loader: {
        marginTop: rh(2),
      },
    
  });