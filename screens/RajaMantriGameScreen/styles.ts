import { StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playButton: {
    width: "90%",
    padding: responsiveWidth(6),
    backgroundColor: "#7653ec",
    alignItems: "center",
    marginVertical: responsiveHeight(8),
    borderRadius: responsiveWidth(8),
    borderWidth: 3,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    alignSelf: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: responsiveFontSize(3.5),
    fontFamily: "outfit-bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  
  playButtonDisabled: {
    backgroundColor: "#A899E6",
    borderColor: "#FFD700",
    opacity: 0.4,
  },
  
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: responsiveHeight(6),
    flexWrap: "wrap",
  },

  card: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: responsiveWidth(25),
    borderWidth: 6,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
    marginVertical: responsiveHeight(2),
  },

  cardText: {
    color: "#FFD700",
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
    textAlign: "center",
  },

  cardImage: {
    width: responsiveWidth(45),
    height: responsiveWidth(45),
    borderRadius: responsiveWidth(25),
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: responsiveHeight(1),
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: responsiveWidth(50),
  },

  scrollView: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullScreenVideo: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
  playerNmaeCardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: responsiveWidth(40),
  },
});

export default styles;
