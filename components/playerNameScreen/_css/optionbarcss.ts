import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";


export const styles = StyleSheet.create({
    headerButtonsContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: responsiveHeight(2),
      marginTop: responsiveHeight(2),
      zIndex: 1,
    },
    headerButton: {
      padding: responsiveHeight(1),
      marginLeft: responsiveHeight(3),
      borderRadius: responsiveHeight(3),
      backgroundColor: "rgba(155, 89, 182, 0.7)",
      elevation: 5,
    },
    toggleContainer: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: responsiveHeight(1),
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: responsiveHeight(2.5),
      marginVertical: responsiveHeight(1.5),
      borderRadius: responsiveHeight(3),
      borderWidth: 3,
      borderColor: "#FFF",
      backgroundColor: "#7653ec",
      width: "80%",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    selectedOption: {
      backgroundColor: "#6244c3",
      borderColor: "#FFD700",
      elevation: 10,
    },
    optionText: {
      marginHorizontal: responsiveHeight(1),
      fontSize: responsiveFontSize(2), // Adjust the size as needed
      color: "#FFF",
      fontFamily: "outfit-bold",
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      paddingHorizontal: responsiveWidth(5), // Responsive horizontal padding
      paddingVertical: responsiveHeight(3), // Responsive vertical padding
    },
    modalContent: {
      backgroundColor: 'white',
      padding: responsiveWidth(5), // Responsive padding for width
      borderRadius: responsiveWidth(3), // Rounded corners using responsive dimensions
      width: responsiveWidth(80), // Modal takes 80% of the screen width
      alignItems: 'center',
      elevation: 10, // Adds shadow effect on Android for depth
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
      shadowOpacity: 0.1, // iOS shadow opacity
      shadowRadius: 4, // iOS shadow radius
    },
    modalTitle: {
      fontSize: responsiveFontSize(2.5), // Responsive font size
      marginBottom: responsiveHeight(2), // Vertical spacing with responsive height
      fontWeight: 'bold',
      color: '#333', // Darker text for better readability
      textAlign: 'center', // Ensure title stays within bounds
      flexShrink: 1, // Prevents text from overflowing
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: responsiveHeight(3), // More space for stars or icons
      justifyContent: 'center', // Center the stars/icons
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: responsiveWidth(2), // Slightly rounded input fields
      width: responsiveWidth(50), // The input takes 90% of screen width, making it responsive
      padding: responsiveWidth(3), // Responsive padding
      marginBottom: responsiveHeight(3), // More space between input and other elements
      fontSize: responsiveFontSize(2), // Responsive font size for input text
      flexShrink: 1, // Prevents input text from overflowing
    },
    modalText: {
      fontSize: responsiveFontSize(2),
      textAlign: 'center', // Align text to center
      marginBottom: responsiveHeight(2),
      flexShrink: 1, // Prevents text overflow
      color: '#555', // Lighter text color for better readability
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: responsiveHeight(2), // Added space between content and buttons
      width: '100%',
    },
    modalButton: {
      backgroundColor: '#4CAF50', // Green button color (you can change this)
      paddingVertical: responsiveHeight(1.5), // Responsive vertical padding
      paddingHorizontal: responsiveWidth(5), // Responsive horizontal padding
      borderRadius: responsiveWidth(2), // Rounded button corners
      marginHorizontal: responsiveWidth(2), // Space between buttons
      elevation: 3, // Add shadow on Android
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
      shadowOpacity: 0.1, // iOS shadow opacity
      shadowRadius: 4, // iOS shadow radius
    },
    modalButtonText: {
      color: 'white',
      fontSize: responsiveFontSize(2), // Responsive font size for button text
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });