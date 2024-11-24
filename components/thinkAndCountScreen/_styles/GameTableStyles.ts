import { StyleSheet } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    zIndex: 1, // Ensures it sits behind other elements
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 2, // Slightly above backgroundImage
  },
  scrollableContainer: {
    maxHeight: '90%', // Allow scrolling within 90% of modal height
    zIndex: 3, // Above overlay for interactivity
  },
  tableContainer: {
    backgroundColor: "#121212",
    borderRadius: responsiveWidth(3),
    margin: responsiveWidth(3),
    marginTop: responsiveHeight(3),
    padding: responsiveWidth(3),
    zIndex: 4, // Ensure it is visible above other elements
  },
  header: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: "bold",
    color: "#EAEAEA",
    marginBottom: responsiveHeight(2),
    textAlign: "center",
    zIndex: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: responsiveHeight(1),
    alignItems: "center",
    zIndex: 4,
  },
  cell: {
    flex: 1,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(2.5),
    backgroundColor: "#1E1E1E",
    margin: responsiveWidth(0.5),
    borderRadius: responsiveWidth(1.5),
    alignItems: "center",
    zIndex: 4,
  },
  cellText: {
    color: "#EAEAEA",
    fontSize: responsiveFontSize(1.8),
    textAlign: "center",
    zIndex: 5,
  },
  headerRow: {
    backgroundColor: "#333",
    marginBottom: responsiveHeight(1.5),
    borderRadius: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(2),
    zIndex: 4,
  },
  headerCell: {
    backgroundColor: "#444",
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(1),
    margin: responsiveWidth(0.5),
    borderRadius: responsiveWidth(1.5),
    alignItems: "center",
    zIndex: 5,
  },
  headerCellText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: responsiveFontSize(1.6),
    textAlign: "center",
    zIndex: 6,
  },
  closeButton: {
    marginTop: responsiveHeight(2),
    backgroundColor: "#1E1E1E",
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: responsiveWidth(2),
    alignItems: "center",
    zIndex: 10, // Close button is typically on top
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    zIndex: 11,
  },
});
