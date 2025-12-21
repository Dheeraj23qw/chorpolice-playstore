import React from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { rulesGroups } from "@/constants/gameRules";
import { router } from "expo-router";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RulesHome() {
  return (
    <ImageBackground
      source={require("@/assets/images/bg/quiz.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Global overlay */}
      <View style={styles.screenOverlay} />

      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Game Rules</Text>

        <View style={styles.cards}>
          {rulesGroups.map((group, index) => {
            const scale = useSharedValue(1);

            const animatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: scale.value }],
            }));

            return (
              <Animated.View
                key={group.id}
                entering={FadeInUp.delay(index * 150).springify()}
              >
                <AnimatedPressable
                  style={[styles.cardWrapper, animatedStyle]}
                  onPressIn={() => (scale.value = withSpring(0.96))}
                  onPressOut={() => (scale.value = withSpring(1))}
                  onPress={() =>
                    router.push({
                      pathname: "/rule",
                      params: { id: group.id },
                    })
                  }
                >
                  {/* UNIQUE CARD IMAGE */}
                  <ImageBackground
                    source={group.image}
                    resizeMode="cover"
                    style={styles.card}
                    imageStyle={styles.cardImage}
                  >
                    {/* Card overlay */}
                    <View style={styles.cardOverlay} />

                    <Text style={styles.title}>{group.title}</Text>
                    <Text style={styles.subtitle}>{group.subtitle}</Text>
                  </ImageBackground>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
  },

  /* ===== HEADER ===== */
  header: {
    marginTop: responsiveHeight(23),
    fontSize: responsiveFontSize(3.4),
    fontWeight: "900",
    color: "#FFF",
    textAlign: "center",
    letterSpacing: 1.5,

    // Glow effect
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  /* ===== CARD LIST ===== */
  cards: {
    marginTop: responsiveHeight(6),
    gap: responsiveHeight(3.2),
  },

  /* ===== GLOBAL OVERLAY ===== */
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16,16,28,0.45)",
  },

  /* ===== CARD ===== */
  cardWrapper: {
    borderRadius: responsiveWidth(7),
    overflow: "hidden",

    // Subtle outer glow
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: responsiveWidth(4),
    shadowOffset: { width: 0, height: responsiveHeight(1.2) },
  },

  card: {
    minHeight: responsiveHeight(16),
    paddingVertical: responsiveHeight(4.5),
    paddingHorizontal: responsiveWidth(6),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: responsiveWidth(7),

    elevation: 14,
  },

  cardImage: {
    borderRadius: responsiveWidth(7),
  },

  /* Gradient-like overlay using layers */
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  /* ===== TEXT ===== */
  title: {
    fontSize: responsiveFontSize(3),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",

    // Title pop
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  subtitle: {
    fontSize: responsiveFontSize(2),
    color: "#F1F1F1",
    marginTop: responsiveHeight(0.8),
    textAlign: "center",
    fontWeight: "700",

    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
