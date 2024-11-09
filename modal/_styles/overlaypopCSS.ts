import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
    modalContent: {
      width: "100%",
      padding: responsiveHeight(2),
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: responsiveHeight(40),
      marginBottom: responsiveHeight(1.5),
    },
    message: {
      fontSize: responsiveFontSize(2.2),
      color: "#fff",
      textAlign: "center",
      fontFamily:"outfit-bold",
      marginVertical: responsiveHeight(3),
    },
    randomMessage: {
      fontSize: responsiveFontSize(2),
      color: "#fff",
      textAlign: "center",
      marginVertical: responsiveHeight(1),
    },
    point: {
      fontSize: responsiveFontSize(2.5),  
      color: "#FFD700",  
      textAlign: "center",
      fontWeight: "bold", 
      marginVertical: responsiveHeight(1),
      padding: responsiveHeight(1), 
    
    },
  tapToClose:{
    fontSize: responsiveFontSize(2.4),
    color: "#fff",
    textAlign: "center",
    marginTop: responsiveHeight(9),
    fontFamily:"outfit-bold"

  } , 
  roleMessage: {
    fontSize: responsiveFontSize(2.8), 
    color: "#FFD700", 
    marginVertical: 4, 
    textAlign: "center", 
    fontFamily:"outfit-bold"
  },

  media: {
    width: responsiveWidth(80), // Adjust the width to 80% of the screen width
    height: responsiveHeight(40), // Adjust the height to 40% of the screen height
    marginVertical: 20, // Space between media and other content
    borderRadius: 10, // Rounded corners for a more playful look
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
    borderWidth: 2, // Border around the media
    borderColor: '#FFD700', // Gold color border for a fun touch
    alignSelf: 'center', // Center the media horizontally
  },

  });