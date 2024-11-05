import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Animated, Easing } from "react-native";
import { responsiveHeight, responsiveFontSize } from "react-native-responsive-dimensions";

const LoadingIndicator: React.FC<{ loading: boolean; message?: string }> = ({ loading, message }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current; // For rotating the indicator
  const slideAnim = useRef(new Animated.Value(-50)).current; // For sliding message from above
  const opacityAnim = useRef(new Animated.Value(0)).current; // For fading in message

  useEffect(() => {
    if (loading) {
      // Start rotating animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Slide and fade-in animation for the message
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations if not loading
      rotateAnim.setValue(0);
      slideAnim.setValue(-50);
      opacityAnim.setValue(0);
    }
  }, [loading]);

  if (!loading) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <ActivityIndicator size="large" color="#7653ec" />
      </Animated.View>
      {message && (
        <Animated.Text style={[styles.message, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Absolute positioning to cover the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 46, 0.8)", // Slightly transparent background
    zIndex: 1000, // High zIndex to overlay other components
  },
  message: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(2.4),
    color: "white",
    fontFamily: "outfit-bold",
    textAlign: "center",
  },
});

export default LoadingIndicator;
