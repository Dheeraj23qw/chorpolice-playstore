import { StyleSheet } from "react-native";
import {
    responsiveWidth,
} from "react-native-responsive-dimensions";

export const cardstyles = StyleSheet.create({
    Card: {
        borderRadius: responsiveWidth(9),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.4,
        elevation: 5,
        overflow: 'hidden',
        padding: responsiveWidth(0.6), 
        marginBottom: responsiveWidth(2),
    },
    cardImage: {    
        width:"100%",
        height:"100%",        
        resizeMode: 'contain',
      }
});
