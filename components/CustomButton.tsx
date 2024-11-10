import React, { useState, useRef } from 'react';
import { Text, Pressable, Animated } from 'react-native';
import { responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import { styles } from "@/components/_CSS/customButtonStyles";

type CustomButtonProps = {
    label: string;
    onPress?: () => void;
};

export default function CustomButton({ label, onPress }: CustomButtonProps) {
    const [isSelected, setIsSelected] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        setIsSelected(true);
        Animated.spring(scaleAnim, {
            toValue: 1.1, // Slightly enlarge text on press
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        setIsSelected(false);
        Animated.spring(scaleAnim, {
            toValue: 1, // Return to original size on release
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
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
            <Animated.Text style={[styles.optionText, { transform: [{ scale: scaleAnim }] }]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
}
