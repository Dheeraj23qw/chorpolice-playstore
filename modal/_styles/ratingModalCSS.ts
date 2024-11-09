import { StyleSheet } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
  },
  modalContent: {
    width: responsiveWidth(85),
    padding: 25,
    borderRadius: 15,
    backgroundColor: '#fff', // White background for clarity
    alignItems: 'center',
    borderColor: '#ffcb05', // Yellow border color
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // Adds depth to the modal

  },
  modalText: {
    fontSize: responsiveFontSize(2.5), // Increased font size for better readability
    textAlign: 'center',
    marginBottom: 20,
    color: '#333', // Darker text for readability
    fontFamily: 'outfit', // Playful font for kids
    paddingHorizontal: 5, // Adds padding to prevent text from touching edges
  },
  modaltitle: {
    fontSize: responsiveFontSize(3.5), // Increased font size for better visibility
    marginBottom: responsiveHeight(2), // Space between title and text below
    color: '#f59e42', // Purple color for title
    fontFamily: 'outfit-bold', // Playful, bold font for kids
    lineHeight: 40, // Increases line height for better spacing
    textAlign: 'center', // Center the title
    paddingHorizontal: 15, // Padding to ensure text doesn't touch the edges

  },
  starsContainer: {
    marginBottom: responsiveHeight(1),
    alignItems: 'center', // Center the stars
    flexDirection:"row"

  },
  star: {
    fontSize: responsiveFontSize(4.2), // Increased star size for visibility
    marginVertical: responsiveHeight(1), // Adds space between stars vertically
    color: '#ffcb05', 
    paddingHorizontal:responsiveWidth(1)
  },
  modalButton: {
    backgroundColor: '#ffcb05', // Bright and fun yellow color
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12, // Slightly more rounded for a friendlier look
    borderColor: '#f59e42', // Border color for the button
    borderWidth: 2,
    elevation: 5, // Adds shadow to the button
    alignItems: 'center', // Center the text in the button
  },
  modalButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(2.5), // Larger text for better readability
    fontWeight: 'bold',
    fontFamily: 'outfit', // Consistent playful font
    letterSpacing: 1, // Adds spacing between letters for clarity
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 9, // Space between buttons
  },
  textInput: {
    width: '100%',
    height: responsiveHeight(12),
    borderColor: '#f59e42', // Green border color
    borderWidth: 1.5,
    borderRadius: 10,
    padding: responsiveHeight(1),
    textAlignVertical: 'top',
    fontSize: responsiveFontSize(2.1),
    marginBottom: responsiveHeight(2),
    backgroundColor: '#f9f9f9', // Light background for contrast
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    fontFamily: 'outfit',
    fontWeight:"condensed",
    color:"#333"

  },
  wordCount: {
    fontSize: responsiveFontSize(1.5),
    color: 'gray',
    marginTop: responsiveHeight(1),
    textAlign: 'right',
  }
});
