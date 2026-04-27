import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { wp, hp } from "@/utils/responsive";
import { Text } from "@/components/Text";
import { Easing } from "react-native-reanimated";

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
  // Grid starting positions based on index
  const startX = index % 2 === 0 ? -wp(40) : wp(40);
  const startY = index < 2 ? -hp(20) : hp(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="z-[999] items-center justify-center bg-[#050508]"
    >
      {/* THE CARD ASSEMBLY */}
      <MotiView
        from={{
          opacity: 0,
          scale: 0.4,
          translateX: startX,
          translateY: startY,
          rotateY: "0deg",
          rotateZ: "15deg",
        }}
        animate={{
          opacity: 1,
          scale: 2.2,
          translateX: 0,
          translateY: 0,
          rotateY: "1800deg", // 5 full spins
          rotateZ: "0deg",
        }}
        transition={{
          type: "timing",
          duration: 2500,
          easing: Easing.bezier(0.2, 0.9, 0.4, 1),
        }}
        className="aspect-[3/4.2] w-[42%] overflow-hidden rounded-[24px] border-[2px] border-white/20 bg-[#0b0b18] shadow-2xl"
      >
        <View className="flex-1 items-center justify-center p-2">
          {/* Subtle Inner Glow */}
          <View
            className={`absolute inset-0 opacity-10 ${isCorrect ? "bg-[#00FF00]" : "bg-[#FF0000]"}`}
          />

          {/* Role Image */}
          <Image
            source={roleImages[role]}
            className="h-[80%] w-[80%]"
            resizeMode="contain"
            // Re-flip the image so it faces the user after the parent's 1800deg rotation
            style={{ transform: [{ rotateY: "1800deg" }] }}
          />

          {/* HOLOGRAPHIC GLARE SWEEP */}
          <MotiView
            from={{ translateX: -wp(50) }}
            animate={{ translateX: wp(50) }}
            transition={{
              type: "timing",
              duration: 1500,
              delay: 2500,
              easing: Easing.out(Easing.quad),
            }}
            className="absolute bottom-0 top-0 w-12 rotate-[25deg] bg-white/10 blur-xl"
          />

          {/* 3. THE STAMP (Anchored to Bottom) */}
          <AnimatePresence>
            <MotiView
              from={{ scale: 4, opacity: 0, translateY: 10 }}
              animate={{ scale: 1, opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                delay: 2650,
                damping: 14,
                mass: 1,
              }}
              className="absolute bottom-4 left-3 right-3 z-50 items-center justify-center"
              style={{ transform: [{ rotateY: "1800deg" }] }}
            >
              <View
                style={{ transform: [{ rotate: "-4deg" }] }}
                className={`w-full items-center rounded-lg border-[3px] py-1.5 shadow-lg ${
                  isCorrect
                    ? "border-[#00FF00] bg-[#00FF00]/20"
                    : "border-[#FF0000] bg-[#FF0000]/20"
                }`}
              >
                <Text
                  className={`font-main-bold text-[15px] tracking-tight ${
                    isCorrect ? "text-[#00FF00]" : "text-[#FF0000]"
                  }`}
                >
                  {isCorrect ? "CAUGHT" : "ESCAPED"}
                </Text>
                <Text className="-mt-0.5 text-[5px] uppercase tracking-[2px] text-white/60">
                  Identity Confirmed
                </Text>
              </View>
            </MotiView>
          </AnimatePresence>
        </View>
      </MotiView>

      {/* 4. OVERLAY TEXT (Outside the card) */}
      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 0.5, translateY: 0 }}
        transition={{ delay: 3000 }}
        className="absolute bottom-24 font-main-md text-[9px] uppercase tracking-[5px] text-white/40"
      >
        Verification Process Complete
      </MotiText>
    </View>
  );
};

export default CinematicReveal;
