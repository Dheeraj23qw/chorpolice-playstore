import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ImageBackground,
} from "react-native";
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

import { useLocalSearchParams, router } from "expo-router";
import { rulesGroups } from "@/constants/gameRules";
import { styles } from "./ruleScreenStyle";

export default function RulesView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = rulesGroups.find((g) => g.id === id)!;

  const [step, setStep] = useState(0);
  const rule = group.rules[step];

  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Global overlay */}
      <View style={styles.screenOverlay} />

      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{group.title}</Text>
          <Text style={styles.headerStep}>
            Step {step + 1} of {group.rules.length}
          </Text>
        </View>

        {/* RULE CARD */}
        <Animated.View
          key={rule.id}
          entering={SlideInRight.springify()}
          exiting={SlideOutLeft.springify()}
          style={styles.cardWrapper}
        >
          <ImageBackground
            source={group.image}   // 👈 game image
            resizeMode="cover"
            style={styles.card}
            imageStyle={styles.cardImage}
          >
            {/* Card overlay */}
            <View style={styles.cardOverlay} />

            <Text style={styles.title}>{rule.title}</Text>
            <Text style={styles.desc}>{rule.desc}</Text>
          </ImageBackground>
        </Animated.View>

        {/* DOTS */}
        <View style={styles.dotsContainer}>
          {group.rules.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === step && styles.activeDot]}
            />
          ))}
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          {step > 0 && (
            <Text style={styles.btn} onPress={() => setStep(step - 1)}>
              ◀ Back
            </Text>
          )}

          {step < group.rules.length - 1 ? (
            <Text style={styles.btn} onPress={() => setStep(step + 1)}>
              Next ▶
            </Text>
          ) : (
            <Text style={styles.btn} onPress={() => router.back()}>
              🎮 Start Game
            </Text>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
