import { StyleSheet, Platform } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  /* ===== SCREEN ===== */
  container: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
  },

  /* ===== HEADER ===== */
  headerContainer: {
    marginTop: responsiveHeight(17),
    marginBottom: responsiveHeight(3),
    alignItems: "center",
  },

  headerTitle: {
    fontSize: responsiveFontSize(3.2),
    fontWeight: Platform.OS === "ios" ? "900" : "bold",
    color: "#FFD93D",
    letterSpacing: 1.2,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },

  headerStep: {
    marginTop: responsiveHeight(6),
    fontSize: responsiveFontSize(2),
    fontWeight: "900",
    color: "#EAEAEA",
    textAlign: "center",
    opacity: 0.9,
  },



  title: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: "900",
    color: "#f0d902ff",
    marginBottom: responsiveHeight(1.5),
    textAlign: "center",
  },

  desc: {
    fontSize: responsiveFontSize(2),
    color: "#F7F7FA",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: responsiveHeight(3.2),
    paddingHorizontal: responsiveWidth(2),
  },

  /* ===== CONTROLS ===== */
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: responsiveHeight(7),
    marginBottom: responsiveHeight(3),
  },

  btn: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "900",
    color: "#FFD93D",
    letterSpacing: 0.5,
  },

  /* ===== DOT INDICATOR ===== */
dotsContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: responsiveHeight(4),
},

dot: {
  width: responsiveWidth(2.2),
  height: responsiveWidth(2.2),
  borderRadius: 100,
  backgroundColor: "rgba(255,217,61,0.4)",
  marginHorizontal: responsiveWidth(1),
},

activeDot: {
  width: responsiveWidth(3),
  height: responsiveWidth(3),
  backgroundColor: "#FFD93D",
},
screenOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(16,16,28,0.45)",
},

cardWrapper: {
  borderRadius: responsiveWidth(8),
  overflow: "hidden",
  marginTop: responsiveHeight(6),
},

card: {
  paddingVertical: responsiveHeight(6),
  paddingHorizontal: responsiveWidth(6),
  borderRadius: responsiveWidth(8),
  alignItems: "center",
  justifyContent: "center",
  elevation: 14,
},

cardImage: {
  borderRadius: responsiveWidth(8),
},

cardOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.7)",
},

});
