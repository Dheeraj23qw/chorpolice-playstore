import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';


type CustomButtonProps = {
    label: string;
    onPress?: () => void;
  };
  export default function CustomButton({ label, onPress }: CustomButtonProps) {
    const [isSelected, setIsSelected] = useState(false);

  const handlePressIn = () => {
    setIsSelected(true);
  };

  const handlePressOut = () => {
    setIsSelected(false);
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.optionButton, isSelected && styles.selectedOption]}
    >
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: responsiveHeight(2),
    marginVertical: responsiveHeight(2),
    zIndex: 1,
  },
  headerButton: {
    padding: responsiveHeight(1),
    marginLeft: responsiveHeight(3),
    borderRadius: responsiveHeight(3),
    backgroundColor: 'rgba(155, 89, 182, 0.7)',
    elevation: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveHeight(2.5),
    marginVertical: responsiveHeight(1.5),
    borderRadius: responsiveHeight(3),
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#7653ec',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#6244c3',
    borderColor: '#FFD700',
    elevation: 10,
  },
  optionText: {
    marginHorizontal: responsiveHeight(1),
    fontSize: responsiveFontSize(3),
    color: '#FFF',
    fontFamily: 'outfit-bold',
  },
});