import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { MotiView } from "moti";
import { wp, hp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import { Easing } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const roleImages: Record<string, any> = {
  King: require("../../../assets/images/chorsipahi/king.webp"),
  Advisor: require("../../../assets/images/chorsipahi/advisor.webp"),
  Thief: require("../../../assets/images/chorsipahi/thief.webp"),
  Police: require("../../../assets/images/chorsipahi/police.webp"),
};

interface CinematicRevealProps {
  index: number;
  role: string;
  isCorrect: boolean;
  onComplete?: () => void;
}

const CinematicReveal: React.FC<CinematicRevealProps> = ({
  index,
  role,
  isCorrect,
  onComplete,
}) => {
  const startX = index % 2 === 0 ? -wp(60) : wp(60);
  const startY = index < 2 ? -hp(25) : hp(25);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000); // 🚀 Reduced to 2s
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={StyleSheet.absoluteFill} className="z-[999]">
      {/* 🌌 DEEP SPACE BACKGROUND */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={["#000", "#08081A", "#000"]}
          style={StyleSheet.absoluteFill}
        />
      </MotiView>

      <View className="flex-1 items-center justify-center">
        <MotiView
          from={{
            opacity: 0,
            scale: 0.4,
            translateX: startX,
            translateY: startY,
            rotateY: "0deg",
            rotateX: "20deg",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateX: 0,
            translateY: 0,
            rotateY: "720deg",
            rotateX: "0deg",
          }}
          transition={{
            type: "timing",
            duration: 2200,
            easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          }}
          style={styles.cardContainer}
        >
          {/* 💎 GLASS ENCASED CARD BODY */}
          <View
            style={[
              styles.glassFrame,
              {
                borderColor: isCorrect
                  ? "rgba(255, 215, 0, 0.5)"
                  : "rgba(255, 68, 68, 0.5)",
              },
            ]}
          >
            {/* 1. Base Material */}
            <LinearGradient
              colors={["#1E1E3F", "#0A0A12"]}
              style={StyleSheet.absoluteFill}
            />

            {/* 2. Character Depth Shadow (Makes image look 'inside') */}
            <View style={styles.innerShadow} />

            {/* 3. Role Image */}
            <Image
              source={roleImages[role]}
              resizeMode="contain"
              style={styles.roleImage}
            />

            {/* 4. PREMIUM GLASS OVERLAY (The 'Pro' Layer) */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.12)",
                "rgba(255, 255, 255, 0.03)",
                "rgba(0, 0, 0, 0.4)",
              ]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* RESULT TEXT */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 1900, type: "spring" }}
              style={styles.textContainer}
            >
              <Text
                className={`text-center font-main-bold ${
                  isCorrect ? "text-yellow-400" : "text-red-500"
                }`}
                style={[
                  styles.textShadow,
                  { 
                    fontSize: rf(2.4), 
                    letterSpacing: wp(0.8),
                    paddingHorizontal: wp(2)
                  }
                ]}
              >
                {isCorrect ? "CHOR PAKDA GAYA" : "CHOR BHAG GAYA"}
              </Text>
            </MotiView>
          </View>
        </MotiView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(72), // Increased size for impact
    aspectRatio: 3 / 4.2,
    transform: [{ perspective: 1500 }], // Higher perspective for glass depth
    alignItems: "center",
    justifyContent: "center",
  },
  glassFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: "#0F0F1A",
    // Premium outer glow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 25,
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 10,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 32,
    zIndex: 1,
  },
  roleImage: {
    width: "85%",
    height: "65%",
    alignSelf: "center",
    marginTop: "12%",
    zIndex: 0,
  },
  textContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    zIndex: 3,
  },
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    textTransform: "uppercase",
  },
});

export default CinematicReveal;
