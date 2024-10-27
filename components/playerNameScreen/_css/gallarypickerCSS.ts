import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginVertical: 20,
      borderRadius: 10,
      padding: 10,
    },
    button: {
      alignItems: "center",
      backgroundColor: "#8E5DE9",
      borderRadius: 28,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginVertical: 10,
      elevation: 3,
      borderWidth: 4,
      borderColor: "#FFD700",
      shadowColor: "#FFD700",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
    icon: {
      fontSize: 40,
      color: "#FFD700",
      textShadowColor: '#000',
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      textShadowRadius: 2,
    },
    buttonText: {
      marginVertical: 10,
      fontSize: 18,
      color: "#FFD700",
      fontFamily: "outfit-bold",
      textAlign: "center",
      textShadowColor: "#8E5DE9",
      textShadowOffset: {
        width: 1,
        height: 1,
      },
      textShadowRadius: 2,
      padding: 5,
      borderRadius: 5,
    },
    imageContainer: {
      paddingVertical: 10,
    },
    imageWrapper: {
      margin: 5,
      position: "relative",
      alignItems: "center",
    },
    imageBorderContainer: {
      width: 120, // Adjusted width for circular effect
      height: 120, // Adjusted height for circular effect
      borderRadius: 75, // Circular shape
      borderWidth: 4,
      borderColor: "purple", // Yellow border
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "#FFFFFF",
    },
    image: {
      width: 110,
      height: 110,
      borderRadius: 70, 
    },
    nameInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    nameInput: {
      width: 100,
      height: 40,
      textAlign: "center",
      borderWidth: 1,
      borderColor: "#f7dc6f",
      borderRadius: 15,
      backgroundColor: "#fff",
      paddingHorizontal: 5,
      fontSize: 14,
    },
    removeButton: {
      position: "absolute",
      right: -10,
      top: -10,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: 80,
      padding: 5,
    },

  });

  export default styles;

