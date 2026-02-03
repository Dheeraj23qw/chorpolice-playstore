import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  container: {
    width: responsiveWidth(90),
    maxWidth: 420,
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: "rgba(210, 210, 210, 1)", 
  },
  videoContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 15,
    overflow: "hidden", 
    marginTop: responsiveHeight(2),
    width: "100%",
    height: responsiveHeight(28), // Fixed height for video container consistency
  },
  defaultContainer: {
    backgroundColor: "#f8f8f8",
  },
  description: {
    fontSize: responsiveFontSize(3),
    color: "#444444", 
    marginBottom: responsiveHeight(1),
    textAlign: "center",
    fontFamily: "outfit-bold",
  },
  media: {
    width: "100%",
    height: responsiveHeight(28),
    borderRadius: 15,
    marginTop: responsiveHeight(1.5),
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.3)", 
    marginBottom: responsiveHeight(3)
  },
  fullMedia: {
    width: "100%",
    height: "100%",
    // NOTE: Removed resizeMode because expo-video uses the 'contentFit' prop
    borderRadius: 15,
  },
  closeText: {
    fontSize: responsiveFontSize(2),
    color: "#444444", 
    marginBottom: responsiveHeight(1),
    textAlign: "center",
    fontFamily: "outfit-bold",
  },
  playerNameStyle:{
    fontSize: responsiveFontSize(3),
    color: "#fff", 
    marginBottom: responsiveHeight(1),
    textAlign: "center",
    fontFamily: "outfit-bold",
  }
});