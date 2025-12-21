import { StyleSheet, Platform } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const BUTTON_HEIGHT = responsiveHeight(7); // scales on all screens
const BUTTON_RADIUS = BUTTON_HEIGHT / 2;

export const rulestyles = StyleSheet.create({
  /* ===== WRAPPER ===== */
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: responsiveHeight(3.5),
  },

  /* ===== IMAGE BACKGROUND ===== */
  bg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  bgImage: {
    borderRadius: BUTTON_RADIUS,
  },
overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.35)", // dark overlay
},

  /* ===== BUTTON ===== */
  button: {
    width: "80%", // better than 100% for tablets
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    overflow: "hidden",

    // Background fallback
    backgroundColor: "rgba(155, 89, 182, 0.85)",

    // Shadow / depth
    elevation: 10,
    shadowColor: "rgba(123, 44, 191, 0.6)",
    shadowOpacity: 0.5,
    shadowRadius: responsiveWidth(4),
    shadowOffset: {
      width: 0,
      height: responsiveHeight(0.6),
    },

    // Border polish
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.35)",
  },

  /* ===== TEXT ===== */
  text: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: Platform.OS === "ios" ? "900" : "bold",
    color: "#FFFFFF",
    letterSpacing: 1.1,
    textAlign: "center",
  },
});
