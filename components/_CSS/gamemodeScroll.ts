import { StyleSheet } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

const GameModeScrollViewStyles = StyleSheet.create({
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
     gap:10,
     paddingVertical:50
  },
  itemContainer: {
    width: responsiveWidth(96),
    height: responsiveHeight(25),
    borderWidth: 2,
    borderColor: 'white', // Default border color is white
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden', // Ensure the border radius is respected
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Light gray background

  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Ensures the overlay covers the entire container
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Black with 40% opacity
  },
  selectedItem: {
    borderColor: '#FFD700', // Yellow border when selected
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight background when selected
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  text: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    fontFamily:"outfit-bold"
  },
  selectedText: {
    color: '#FFD700', // Yellow text when selected
  },
  tickContainer: {
    marginTop: 9, // Space between the text and the tick
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameModeScrollViewStyles;
