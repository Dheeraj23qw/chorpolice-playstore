import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
  Pressable,
} from "react-native";
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";
import { useSelector, useDispatch } from "react-redux"; // Import dispatch
import { setGameRound } from "@/redux/reducers/playerReducer";

export const SettingScreen = () => {
  const dispatch = useDispatch();
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound
  );

  const roundOptions = [
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  const router = useRouter();

  const handleSelectRound = (round: number) => {
    dispatch(setGameRound(round)); // Dispatch selected round to Redux
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={rf(2.5)} color="#FFD700" />
        </Pressable>
        <Text style={styles.title}>Select Number of Rounds</Text>
        <View style={styles.optionsContainer}>
          {roundOptions.map((round) => (
            <Pressable
              key={round}
              style={[
                styles.optionButton,
                selectedRounds === round && styles.selectedOption,
              ]}
              onPress={() => handleSelectRound(round)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedRounds === round && styles.selectedText,
                ]}
              >
                {round}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rw(5),
  },
  title: {
    fontSize: rf(3),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: rh(2),
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: rh(2),
  },
  optionButton: {
    width: rw(12),
    height: rw(12),
    justifyContent: "center",
    alignItems: "center",
    margin: rw(2),
    borderRadius: rw(6),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedOption: {
    backgroundColor: "rgba(0, 150, 136, 0.9)",
  },
  optionText: {
    fontSize: rf(2),
    color: "#fff",
  },
  selectedText: {
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    position: "absolute",
    top: rh(7),
    left: rw(5),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: rw(7),
    padding: rw(2),
    zIndex: 2,
  },
});
