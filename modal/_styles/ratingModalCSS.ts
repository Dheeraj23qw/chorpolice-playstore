import { StyleSheet } from "react-native";
import {
  responsiveFontSize as rf,
  responsiveHeight as rh,
  responsiveWidth as rw,
} from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 2, 5, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rw(6),
  },

  modalBox: {
    width: "100%",
    maxWidth: rw(92),
    backgroundColor: "#0a0a0f",
    borderRadius: rw(8),
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.2)",
    padding: rw(7),
    alignItems: "center",
  },

  accentLine: {
    position: "absolute",
    top: 0,
    width: rw(18),
    height: rh(0.4),
    backgroundColor: "#6366f1",
    borderBottomLeftRadius: rw(2),
    borderBottomRightRadius: rw(2),
  },

  iconContainer: {
    width: rw(20),
    height: rw(20),
    borderRadius: rw(6),
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rh(3),
  },

  titleText: {
    color: "#ffffff",
    fontSize: rf(2.6),
    fontWeight: "bold",
    textAlign: "center",
  },

  descText: {
    color: "rgba(199, 210, 254, 0.5)",
    fontSize: rf(1.7),
    textAlign: "center",
    marginTop: rh(1),
    marginBottom: rh(4),
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: rh(5),
  },

  starIcon: {
    fontSize: rf(4.8),
  },

  inputContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: rw(4),
    padding: rw(3),
    marginBottom: rh(4),
  },

  textInput: {
    color: "#ffffff",
    fontSize: rf(1.7),
    minHeight: rh(8),
    textAlignVertical: "top",
  },

  submitBtn: {
    height: rh(7),
    borderRadius: rw(5),
    alignItems: "center",
    justifyContent: "center",
  },

  submitBtnText: {
    color: "#ffffff",
    fontSize: rf(2),
    fontWeight: "bold",
    letterSpacing: 1,
  },

  laterBtn: {
    marginTop: rh(2),
    height: rh(5),
    alignItems: "center",
    justifyContent: "center",
  },

  laterBtnText: {
    color: "#64748b",
    fontSize: rf(1.7),
    fontWeight: "600",
  },
});
