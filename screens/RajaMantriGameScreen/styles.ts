import { StyleSheet } from "react-native";
import { responsiveWidth, responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
 
    backgroundColor: '#f0f0f0',
  },
  playButton: {
    padding: responsiveWidth(8),
    backgroundColor: '#48b340', 
    alignItems: 'center',
    marginVertical: responsiveHeight(4),
    borderRadius: responsiveWidth(10),
    borderWidth: 9,
    borderColor: '#296F00', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow:"hidden"
  },
  playButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(4), // increased font size
    fontFamily: "outfit-bold",
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // added text shadow
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  
  playButtonDisabled: {
    backgroundColor: '#48b340',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: responsiveHeight(4),
  },
  card: {
    width: responsiveWidth(40),
    height: responsiveWidth(46),
    backgroundColor: '#87CEFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1E90FF',
    borderRadius: responsiveWidth(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    borderLeftWidth: 10,
    borderLeftColor: '#000',
  },
  cardText: {
    color: '#fff',
    fontSize: responsiveFontSize(3.5), // increased font size
    fontFamily: "outfit-bold",
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // added text shadow
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  cardImage: {
    width: responsiveWidth(35),
    height: responsiveWidth(35),
    borderRadius: responsiveWidth(17.5),
  },
  tableContainer: {
    flex: 1,
    marginVertical: responsiveHeight(2),
  },
  table: {
    flexDirection: 'column',
    borderWidth: 4,
    borderColor: '#FF1493',
    borderRadius: responsiveWidth(3),
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: responsiveWidth(1),
    backgroundColor: '#FFB6C1',
    
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF69B4',
    padding: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
  },
  cellText: {
    color: '#fff',
    fontSize: responsiveFontSize(2.5), // increased font size
    fontFamily: "outfit-bold",
    textAlign: 'center',
    textShadowColor: 'rgba(255, 182, 193, 0.1)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
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
    justifyContent: 'center',
  },
  playerNmaeCardImage:{
   width:"100%",
   height:"100%",
   
    justifyContent: 'center',
    backgroundColor: '#87CEFA',
    alignItems: 'center',
    
    borderWidth: 3,
    borderColor: '#1E90FF',
    borderRadius: responsiveWidth(40),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(20), // Ensure the overlay also respects the card's border radius
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },


});

export default styles;
