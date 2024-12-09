import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,

  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 4, // Adds a shadow on Android
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay

  },

  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollView: {
    flexGrow: 0,
    marginVertical: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionButton: {
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderColor: "transparent",
    borderWidth: 2,
    elevation: 2, // Adds a shadow effect on Android
  },
  selectedOption: {
    borderColor: "#FFD700",
    borderWidth: 4,
  },
  optionBackground: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",

  },
  optionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 4,

  },
});
