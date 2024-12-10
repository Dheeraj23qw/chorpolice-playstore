import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsiveWidth(4),
  },
  backButtonContainer: {
    position: "absolute",
    top: responsiveHeight(2),
    left: responsiveWidth(4),
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    overflow: "hidden",
    elevation: 4, // Adds a shadow on Android
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
  },
  title: {
    fontSize: responsiveFontSize(3),
    color: "#fff",
    fontWeight: "bold",
    marginBottom: responsiveHeight(2),
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },
  scrollView: {
    flexGrow: 0,
    marginVertical: responsiveHeight(2),
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionButton: {
    marginHorizontal: responsiveWidth(2),
    borderRadius: responsiveWidth(2.5),
    overflow: "hidden",
    borderColor: "transparent",
    borderWidth: responsiveWidth(0.5),
    elevation: 2, // Adds a shadow effect on Android
  },
  selectedOption: {
    borderColor: "#FFD700",
    borderWidth: responsiveWidth(1),
  },
  optionBackground: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    color: "#FFD700",
    fontSize: responsiveFontSize(2),
    textAlign: "center",
    fontWeight: "bold",
    marginTop: responsiveHeight(0.5),
    fontFamily: "Outfit-Bold",
  },
});
