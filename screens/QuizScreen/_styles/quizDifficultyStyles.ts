import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";


export const styles = StyleSheet.create({
    backgroundImage: {
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: responsiveWidth(5),
    },
  
    circularSection: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: responsiveHeight(10),
      marginBottom: responsiveHeight(4),
    },
    circularBackground: {
      width: responsiveHeight(16),
      height: responsiveHeight(16),
      justifyContent: "center",
      alignItems: "center",
    },
    circularBackgroundImage: {
      borderRadius: responsiveHeight(8),
    },
    questionSection: {
      marginBottom: responsiveHeight(3),
    },
    questionBackground: {
      width: "100%",
      paddingVertical: responsiveHeight(3),
      justifyContent: "center",
      alignItems: "center",
    },
    questionBackgroundImage: {
      borderRadius: responsiveWidth(4),
    },
    questionText: {
      color: "#FFF",
      fontSize: responsiveFontSize(2.6),
      fontWeight: "900",
      textAlign: "center",
    },
    optionsSection: {
      paddingHorizontal: responsiveWidth(15),
    },
  
    optionButton: {
      paddingVertical: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(8),
      alignItems: "center",
    },
    
   
    optionPressable: {
      width: "100%", // Ensure Pressable stretches within the container
      height: responsiveHeight(8), // Set a consistent height for options
      borderRadius: responsiveWidth(4),
      marginBottom: responsiveHeight(3),
      overflow: "hidden",
    },
    optionBackground: {
      ...StyleSheet.absoluteFillObject, // Makes the ImageBackground fill its parent
      justifyContent: "center",
      alignItems: "center",
    },
    optionBackgroundImage: {
      resizeMode: "cover", // Ensures image scales correctly
    },
    optionPressed: {
      opacity: 0.9, // Feedback for when pressed
    },
    optionText: {
      color: "#FFF",
      fontSize: responsiveFontSize(2.4),
      fontWeight: "900",
    },
    selectedOptionText: {
      color: "gold",
    },

    backButton: {
      paddingTop: 60,  // Adjust to space the button below the status bar
      position: 'absolute',
      top: 0,
      left: 30, // Adjust for desired horizontal position
      zIndex: 1000,  // Ensure button is above other elements
    },
    icon3D: {
      
      transform: [{ translateY: 2 }, { translateX: 2 }],  // Creates the 3D effect
      shadowColor: '#000',  // Shadow color
      shadowOffset: { width: 3, height: 3 },  // Shadow offset
      shadowOpacity: 0.5,  // Shadow opacity
      shadowRadius: 3,  // Shadow radius for blur
      elevation: 5,  // Adds shadow on Android
    },
    
  });