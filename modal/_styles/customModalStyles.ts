import { StyleSheet } from "react-native";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

export const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay for better contrast
      },
      modalContent: {
        width: responsiveWidth(85),
        padding: 25,
        borderRadius: 15,
        backgroundColor: "#fff",
        alignItems: "center",
        borderColor: "#ffcb05",
        borderWidth: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10, // Adds depth to the modal
      },
      modalText: {
        fontSize: 20, // Slightly larger for better readability
        textAlign: "center",
        marginBottom: 20,
        color: "#333", // Darker text for readability
        fontFamily: "outfit", // Playful font for kids
        fontWeight: "bold",
        lineHeight: 28, // Increases line height for better spacing
        paddingHorizontal: 10, // Adds padding to prevent text from touching edges
      },
      modaltitle: {
        fontSize: 29, // Increased font size for better visibility
        marginBottom: 20,
        color: "#333", // Darker text for readability
        fontFamily: "outfit-bold", // Playful font for kids
        lineHeight: 28, // Increases line height for better spacing
        paddingHorizontal: 10, // Adds padding to prevent text from touching edges
      },
      modalButton: {
        backgroundColor: "#ffcb05", // Bright and fun color
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12, // Slightly more rounded for a friendlier look
        borderColor: "#f59e42", // Border color for the button
        borderWidth: 2,
        elevation: 5, // Adds a shadow for button
        alignItems: "center", // Center text in button
      },
      modalButtonText: {
        color: "#fff",
        fontSize: 20, // Larger text for better readability
        fontWeight: "bold",
        fontFamily: "outfit", // Consistent playful font
        letterSpacing: 1, // Adds spacing between letters for clarity
      },
      buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        gap: 9,
      },
});
