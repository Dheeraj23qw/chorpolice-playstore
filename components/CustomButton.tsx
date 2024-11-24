import React, { useState, useRef } from 'react';
import { Text, Pressable, Animated } from 'react-native';
import { styles } from "@/components/_CSS/customButtonStyles";
import { playSound } from '@/redux/reducers/soundReducer';
import { useDispatch } from 'react-redux';

type CustomButtonProps = {
    label: string;
    onPress?: () => void;
    backgroundColor?: string; // Optional background color prop

};

export default function CustomButton({ label, onPress, backgroundColor}: CustomButtonProps) {
    const [isSelected, setIsSelected] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const dispatch = useDispatch(); // Redux dispatch hook
    const handlePressIn = () => {
        dispatch(playSound("select"));

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
            style={[styles.optionButton, isSelected && styles.selectedOption,  backgroundColor ? { backgroundColor } : null,,]}
        >
            <Animated.Text style={[styles.optionText, { transform: [{ scale: scaleAnim }] }]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
}
