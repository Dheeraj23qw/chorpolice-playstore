import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image, Easing } from "react-native";
import { wp, hp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

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
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const verdictOpacity = useRef(new Animated.Value(0)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;

  // Precise starting positions for a 2x2 grid
  const startX = index % 2 === 0 ? -wp(24) : wp(24);
  const startY = index < 2 ? -hp(12) : hp(12);

  useEffect(() => {
    // Background Rays Rotation
    Animated.loop(
      Animated.timing(rayRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Main Animation Sequence
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(jumpAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.bezier(0.2, 1, 0.3, 1), // Snappy but smooth overshoot
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
        // Reveal Verdict Stamp with a slam
        Animated.spring(verdictOpacity, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                onComplete?.();
            }, 1200);
        });
    });
  }, []);

  const translateX = jumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, 0],
  });

  const translateY = jumpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, 0],
  });

  const scale = jumpAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.8, 2.4, 2.2], // Jumps out big then settles
  });

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2520deg"], // 7 full spins for extra drama
  });

  const raySpin = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const isBackVisible = spinAnim.interpolate({
    inputRange: [0, 0.94, 0.95, 1],
    outputRange: [1, 1, 0, 0],
  });

  const isFrontVisible = spinAnim.interpolate({
    inputRange: [0, 0.94, 0.95, 1],
    outputRange: [0, 0, 1, 1],
  });

  const cardBack = require("../../../assets/images/bg/image.webp");

  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-[#050508]/95 z-[999]">
      
      {/* Dynamic Background Rays */}
      <Animated.View
        style={{
          transform: [{ rotate: raySpin }],
          position: "absolute",
          width: wp(180),
          height: wp(180),
          opacity: 0.15,
        }}
      >
        {[...Array(16)].map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 2,
              height: hp(100),
              backgroundColor: isCorrect ? "#4ade80" : "#f87171",
              transform: [
                { rotate: `${i * 22.5}deg` },
                { translateY: -hp(50) },
              ],
            }}
          />
        ))}
      </Animated.View>

      {/* Ambient Glow */}
      <Animated.View 
        style={{ 
            opacity: opacityAnim.interpolate({ inputRange:[0,1], outputRange:[0, 0.4] }),
            backgroundColor: isCorrect ? "#16a34a" : "#dc2626"
        }}
        className="absolute h-[wp(100)] w-[wp(100)] rounded-full blur-3xl"
      />

      {/* THE CARD */}
      <Animated.View
        style={{
          opacity: opacityAnim,
          width: wp(42),
          transform: [
            { translateX },
            { translateY },
            { scale },
            { perspective: 2500 },
            { rotateY: rotation },
          ],
        }}
        className="aspect-[3/4.2] items-center justify-center rounded-[28px] border-[1.5px] border-white/30 bg-slate-900 shadow-2xl"
      >
        {/* CARD BACK */}
        <Animated.View style={{ opacity: isBackVisible }} className="absolute inset-0">
            <Image source={cardBack} className="h-full w-full rounded-[26px]" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center bg-indigo-950/60 rounded-[26px]">
                 <View className="h-16 w-16 rounded-full border border-white/20 bg-white/5" />
            </View>
        </Animated.View>

        {/* CARD FRONT */}
        <Animated.View style={{ opacity: isFrontVisible }} className="absolute inset-0 items-center justify-center p-2 rounded-[26px] bg-[#0b0b18]">
            {/* Inner Card Glow */}
            <View className={`absolute inset-0 opacity-20 ${isCorrect ? "bg-green-500" : "bg-red-500"} rounded-[26px]`} />
            
            <Image source={roleImages[role]} className="h-full w-full" resizeMode="contain" />
            
            {/* Glass Shine Reflection */}
            <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 rounded-t-[26px]" style={{ transform: [{ skewY: '-20deg' }] }} />

            {/* Verdict Stamp */}
            <Animated.View 
              style={{ 
                opacity: verdictOpacity,
                transform: [{ scale: verdictOpacity.interpolate({ inputRange:[0,1], outputRange:[5, 1] }) }]
              }}
              className={`absolute inset-0 z-30 items-center justify-center rounded-[26px] border-[8px] ${
                isCorrect ? "bg-green-500/30 border-green-400" : "bg-red-500/30 border-red-400"
              }`}
            >
                <View 
                    style={{ 
                        shadowColor: isCorrect ? "#4ade80" : "#f87171",
                        shadowRadius: 20, shadowOpacity: 0.8,
                        elevation: 10
                    }}
                    className="bg-black/80 px-6 py-3 rounded-2xl border border-white/30"
                >
                    <Text className={`font-main-bold text-center text-2xl uppercase tracking-widest ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                        {isCorrect ? "CAUGHT!" : "ESCAPED!"}
                    </Text>
                    <Text className="text-white/40 text-[8px] text-center font-main-md uppercase tracking-[4px] mt-1">
                        {role}
                    </Text>
                </View>
            </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* BOTTOM INFO */}
      <Animated.View 
        style={{ 
            opacity: opacityAnim,
            transform: [{ translateY: hp(34) }]
        }}
        className="absolute items-center w-full"
      >
         <Text className="font-main-bold text-white/50 text-[10px] tracking-[8px] uppercase mb-2">
            Searching for Thief...
         </Text>
         <View className="h-[1px] w-32 bg-white/10" />
      </Animated.View>

      {/* Floating Particles (Static decoration) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {[...Array(10)].map((_, i) => (
             <View 
                key={i} 
                className="absolute w-1 h-1 bg-white/20 rounded-full" 
                style={{ 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random()
                }} 
             />
         ))}
      </View>
    </View>
  );
};

export default CinematicReveal;
