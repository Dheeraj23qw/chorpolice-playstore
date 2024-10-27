import { StyleSheet } from "react-native";
import { responsiveWidth, responsiveHeight, responsiveFontSize } from "react-native-responsive-dimensions";

export const winnerstyles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: responsiveHeight(6),
        paddingBottom: responsiveHeight(4),
      },
      button: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: responsiveHeight(1.5),
        paddingVertical: responsiveHeight(1),
        marginHorizontal: responsiveHeight(0.5),
        width: responsiveWidth(30), // Adjusted for better responsiveness
        backgroundColor: '#8E5DE9', 
        borderColor: '#FFD700', 
        borderWidth: 1.5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        
      },
      buttonText: {
        fontSize: responsiveFontSize(3),
        fontFamily: 'myfont',
        color: '#FFFFFF', // White text color
      },
})