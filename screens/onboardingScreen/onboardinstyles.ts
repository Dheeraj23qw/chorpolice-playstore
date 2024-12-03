import { StyleSheet } from "react-native";
import {
    responsiveHeight as rh,
    responsiveWidth as rw,
    responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
    },
    slide: {
        width: rw(100),
        justifyContent: "center",
        alignItems: "center",
        padding: rw(5),
    },
    slideImage: {
        width: rw(60),
        height: rh(30),
        resizeMode: "contain",
        marginBottom: rh(2),
    },
    title: {
        fontSize: rf(3.5),
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: rh(2),
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.6)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    description: {
        fontSize: rf(2.5),
        color: "#fff",
        textAlign: "center",
        marginHorizontal: rw(2),
        fontFamily: "outfit-bold",
    },
    indicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: rh(2),
    },
    indicator: {
        width: rw(2.5),
        height: rw(2.5),
        borderRadius: rw(1.25),
        backgroundColor: "#fff",
        marginHorizontal: rw(2),
    },
    activeIndicator: {
        backgroundColor: "#FFD700",
        width: rw(3),
        height: rw(3),
    },
    button: {
        backgroundColor: "#FFD700",
        paddingVertical: rh(2),
        paddingHorizontal: rw(10),
        borderRadius: 8,
        alignSelf: "center",
        marginBottom: rh(5),
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#333",
        fontSize: rf(2.5),
        fontFamily: "outfit-bold",
    },
});

