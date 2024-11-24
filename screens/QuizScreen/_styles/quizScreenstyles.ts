
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
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    scrollViewContent: {
      flexGrow: 1,
      padding: responsiveWidth(5),
    },
    playersSection: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: responsiveHeight(2),
      marginTop: responsiveHeight(6),
    },
    playerWrapper: {
      justifyContent: "center",
      alignItems: "center",
    },
  
    vsCircle: {
      width: responsiveHeight(15),
      height: responsiveHeight(15),
      justifyContent: "center",
      alignItems: "center",
    },
    vsCircleImage: {
      borderRadius: responsiveHeight(8),
    },
    vsText: {
      fontSize: responsiveWidth(8),
      fontWeight: "900",
      color: "#7653ec",
    },
    circularSection: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: responsiveHeight(0.2),
    },
    circularBackground: {
      width: responsiveHeight(10),
      height: responsiveHeight(10),
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
      paddingVertical: responsiveHeight(3),
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: responsiveHeight(2),

    },
    questionBackgroundImage: {
      borderRadius: responsiveWidth(9),
    },
    questionText: {
      color: "#FFF",
      fontSize: responsiveWidth(5),
      fontWeight: "700",
      textAlign: "center",
    },
    optionsSection: {
      paddingHorizontal: responsiveWidth(16),
    },
    optionBackground: {
      flex: 1,
      borderRadius: responsiveWidth(4),
      marginBottom: responsiveHeight(1),
      justifyContent: "center",
      alignItems: "center",
      paddingVertical:responsiveHeight(1.9)

    },
    optionBackgroundImage: {
      borderRadius: responsiveWidth(4),
    },
  
    optionWrapper: {
      marginVertical: 8, 
      borderRadius: 8, 
      overflow: 'hidden', 
    },
    optionText: {
      color: "#FFF",
      fontSize: responsiveWidth(4),
      fontWeight: "900",
    },
    buttonsSection: {
      marginTop: responsiveHeight(4),
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    iconBackground: {
      width: responsiveWidth(28),
      height: responsiveHeight(7),
      marginHorizontal: responsiveWidth(1),
      justifyContent: "center",
      alignItems: "center",
      borderRadius: responsiveWidth(4),
    },
    iconBackgroundImage: {
      borderRadius: responsiveWidth(4),
    },
    iconButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: responsiveHeight(1),
    },
    iconText: {
      color: "#FFF",
      fontSize: responsiveWidth(4),
      fontWeight: "bold",
    },
  
    tableContainer: {
      backgroundColor: '#121212',
      borderRadius: responsiveWidth(3), // Adjusted to be proportional
      margin: responsiveWidth(3),
      marginTop: responsiveHeight(10),
      padding: responsiveWidth(3),
    },
    header: {
      fontSize: responsiveFontSize(2.4), // Adjusted for all screen sizes
      fontWeight: 'bold',
      color: '#EAEAEA',
      marginBottom: responsiveHeight(2),
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      marginBottom: responsiveHeight(1),
      alignItems: 'center',
    },
    cell: {
      flex: 1,
      paddingVertical: responsiveHeight(1.5),
      paddingHorizontal: responsiveWidth(2.5),
      backgroundColor: '#1E1E1E',
      margin: responsiveWidth(0.5),
      borderRadius: responsiveWidth(1.5), // Consistent corner radius
      alignItems: 'center',
    },
    cellText: {
      color: '#EAEAEA',
      fontSize: responsiveFontSize(1.8), // Adjusted for legibility
      textAlign: 'center',
    },
    // Styles for the header row
    headerRow: {
      backgroundColor: '#333',
      marginBottom: responsiveHeight(1.5),
      borderRadius: responsiveWidth(2),
      paddingHorizontal: responsiveWidth(2),
    },
    headerCell: {
      backgroundColor: '#444',
      paddingVertical: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(1),
      margin: responsiveWidth(0.5),
      borderRadius: responsiveWidth(1.5), // Consistent corner radius
      alignItems: 'center',
    },
    headerCellText: {
      color: '#FFD700', // Golden color for header text
      fontWeight: 'bold',
      fontSize: responsiveFontSize(1.6), // Responsive font size
      textAlign: 'center',
    },
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.9)", // Semi-transparent background
      zIndex: 10,
    },
  
    overlayText: {
      fontSize: 24, 
      fontFamily: "outfit-bold", 
      textAlign: "center",
      color: "#FFD700", 
      textShadowColor: "#000", 
      textShadowOffset: { width: 2, height: 2 }, 
      textShadowRadius: 4, 
      letterSpacing: 1.5, 
    
    },
    
    
  });