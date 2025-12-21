import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight } from "react-native-responsive-dimensions";




export const styles = StyleSheet.create({
    headerButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: responsiveHeight(2),
      marginVertical: responsiveHeight(2),
      zIndex: 1,
    },
    headerButton: {
      padding: responsiveHeight(1),
      marginLeft: responsiveHeight(3),
      borderRadius: responsiveHeight(3),
      backgroundColor: '#FFA500',
      elevation: 5,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: responsiveHeight(1.2),
      marginVertical: responsiveHeight(1.5),
      borderRadius: responsiveHeight(3),
      borderWidth: 3,
      borderColor: '#FFF',
      backgroundColor: '#FFA500',
      width: '80%',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    selectedOption: {
      backgroundColor: 'rgba(255, 165, 0, 0.8)',
      borderColor: '#FFD700',
      elevation: 10,
    },
    optionText: {
      marginHorizontal: responsiveHeight(1),
      fontSize: responsiveFontSize(3),
      color: '#FFF',
      fontFamily: 'outfit-bold',
    },
  });