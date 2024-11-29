import { StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export const playerNameStyles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  imageContainer: {
    position: "relative",
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 75,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#f7dc6f",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#f7dc6f",
  },

  selectedImageGrid: {
    marginVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  selectedImageTitle: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "outfit-bold",
    color: "white",
  },
  selectedImageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedImageContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 5,
  },
  nameInput: {
    width: 90,
    height: 40,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#f7dc6f",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  startGameButton: {
    backgroundColor: "#7653ec",
    paddingVertical: responsiveHeight(2.7),
    paddingHorizontal: responsiveWidth(10),
    borderRadius: 35,
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderColor:"#FFD700",
    borderWidth:3
  },
  startGameButtonText: {
    color: "#FFD700",
    fontFamily: "outfit-bold",
    fontSize: responsiveFontSize(2.3), // Slightly larger for emphasis
    letterSpacing: 1.2, // Adds space between letters for elegance
    textShadowColor: "rgba(0, 0, 0, 0.6)", // Shadow effect for depth
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  changeButton: {
    marginTop: responsiveHeight(1),
    backgroundColor: "#ff4757",
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2),
    borderRadius: 5,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(2),
    textAlign: "center",
  },

  infoButtonContainer: {
    margin: 20,
    alignItems: "center",
  },
  infoButton: {
    backgroundColor: "#ffca28",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    margin: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    color: "#ffffff",
    fontSize: 22, // Increased font size
    fontFamily: "outfit-bold",
  },

  //modals

});
