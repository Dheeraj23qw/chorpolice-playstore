import React, { useState } from "react";
import { ImageBackground, SafeAreaView, ScrollView, View } from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { Components } from "@/imports/allComponentImports";
import GameModeScrollView from "@/components/GameModeScrollView";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { StatusBar } from "react-native";
import { optionsGameMode } from "@/constants/gamemode";
import RulesButton from "@/components/rules/rulesButton";
import { router } from "expo-router";

const GameModeScreen: React.FC = () => {
  const animationValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: animationValue.value * 50 }, // Slide from 50px above
    ],
    opacity: animationValue.value, // Fade in
  }));

  useFocusEffect(
    React.useCallback(() => {
      animationValue.value = 0; // Reset animation value
      animationValue.value = withTiming(1, { duration: 800 }); // Start animation
    }, [])
  );


  return (
    <SafeAreaView style={[globalstyles.container]}>
      <StatusBar backgroundColor={"transparent"} />

      {/* Main Content Container */}
      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={[
          chorPoliceQuizstyles.overlay,
          chorPoliceQuizstyles.imageBackground,
        ]}
        resizeMode="cover"
      >
        <Animated.View style={[{ marginTop: 32 }, animatedStyle]}>
          <Components.OptionHeader />
        </Animated.View>
        <Animated.View style={[{ margin: 5 }, animatedStyle]}>
          <RulesButton onPress={() =>  router.push("/rulehome")} />
        </Animated.View>

        {/* Scroll View for Content */}
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={animatedStyle} // Apply animation
        >
          <GameModeScrollView options={optionsGameMode} />
        </Animated.ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Exporting Component with React Memo for Optimization
export default React.memo(GameModeScreen);
