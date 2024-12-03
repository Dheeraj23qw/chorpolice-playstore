import { StyleSheet } from 'react-native';
import { responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(2), // Increased horizontal padding for better responsiveness
    paddingVertical: responsiveHeight(6),
    backgroundColor: '#121212', // Dark background for contrast
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    transform: [{ scale: 1.05 }], // Slight scale for a more modern look
    zIndex: 10, // Ensures the modal appears above other components
  },

  heading: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(3), // Added extra space below heading for breathing room
    color: '#EAEAEA', // Light text for heading
    textAlign: 'center',
    letterSpacing: 1, // Adds spacing between letters for a more polished look
    paddingHorizontal: responsiveWidth(5),
  },

  tableRow: {
    flexDirection: 'row',
    marginBottom: responsiveHeight(3),
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Adds subtle border to separate rows
    paddingBottom: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2),
    zIndex: 1, // Set zIndex to ensure layering in table rows if needed
  },

  tableCellHeader: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(2), // Increased horizontal padding for better responsiveness
    borderRadius: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 2, // Ensure headers are above regular cells
  },

  tableCell: {
    flex: 1,
    paddingVertical: responsiveHeight(1.4),
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: '#1e1e1e',
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Regular cells below headers
  },

  cellTextHeader: {
    color: '#EAEAEA',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(1.8),
    textTransform: "capitalize", // Adds emphasis on header cells
  },

  cellText: {
    color: '#EAEAEA',
    fontSize: responsiveFontSize(1.8),
    flexWrap: 'wrap',
    textAlign: 'center',
    maxWidth: '90%',
    overflow: 'hidden',
    letterSpacing: 0.5, // Slight spacing to make the text more legible
  },

  playerName: {
    color: '#EAEAEA',
    fontSize: responsiveFontSize(2.2),
    fontWeight: '500',
    flexWrap: 'wrap',
    maxWidth: '80%',
    textAlign: 'center',
    overflow: 'hidden',
    paddingHorizontal: responsiveWidth(2), // Adds padding to prevent text clashing with edges
  },

  scrollableContainer: {
    flex: 1,
    zIndex: 1, 
  },

  closeButton: {
    marginTop: responsiveHeight(2),
    backgroundColor: "#1E1E1E",
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: responsiveWidth(2),
    alignItems: "center",
    marginHorizontal: responsiveWidth(4), // Adjusted for better responsiveness
    zIndex: 3, // Ensure the close button appears above other components
  },

  closeButtonText: {
    color: "#FFF",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
  },

});
