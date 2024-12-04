import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ImageBackground,
  Image,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");
import { styles } from "./onboardinstyles";
import { onboardingData } from "@/constants/onboardingData";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { playSound } from "@/redux/reducers/soundReducer";

export const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value for fade-in effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale value
  const router = useRouter();
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Animated.View
      style={[
        styles.slide,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Image source={item.image} style={styles.slideImage} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </Animated.View>
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Animate opacity and scale on index change
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleNavigation = () => {
    router.replace("/modeselect");
  };
  return (
    <ImageBackground
      source={require("../../assets/images/bg/quiz.png")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleScroll} // Ensure the index updates correctly
        />
        {/* Conditionally render the indicator container */}
        {currentIndex < onboardingData.length - 1 && (
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
        {currentIndex === onboardingData.length - 1 && (
          <Pressable
            style={styles.button}
            onPress={() => {
              handleNavigation();
            }}
          >
            <Text style={styles.buttonText}>Let's Get Started</Text>
          </Pressable>
        )}
      </View>
    </ImageBackground>
  );
};
