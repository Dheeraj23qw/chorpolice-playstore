import React, { useRef, useEffect } from "react";
import { Text, Pressable, View, Animated, Easing } from "react-native";
import { rf } from "@/utils/responsive";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse the ambient glow behind the button
  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, tension: 100 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className="w-full px-4 pt-12" // Proper padding from screen edges
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]} className="w-full">
        
        {/* 1. OUTER GLOW (The "Aura") */}
        {!disabled && (
          <Animated.View 
            style={{ opacity: glowAnim }}
            className="absolute -inset-2 bg-indigo-600/20 blur-2xl rounded-[30px]" 
          />
        )}

        {/* 2. THE MAIN SLAB (The "Glass Body") */}
        <View
          className={`w-full rounded-[28px] overflow-hidden ${
            disabled ? "bg-[#0a0a0c] border-white/5" : "bg-[#0d0d12] border-t border-l border-white/10"
          }`}
          style={{
            borderBottomWidth: disabled ? 1 : 6,
            borderRightWidth: 1.5,
            borderBottomColor: disabled ? "#1a1a1e" : "#312e81", // Deep Indigo Base
            borderRightColor: disabled ? "#1a1a1e" : "#1e1b4b",
          }}
        >
          {/* 3. INNER CONTAINER (Proper Padding & Content) */}
          <View 
            className={`py-6 px-8 items-center justify-between flex-row ${
                !disabled && "bg-gradient-to-br from-white/5 to-transparent"
            }`}
          >
            {/* Left HUD Detail */}
            <View className="h-full w-1 bg-indigo-500/40 rounded-full" />

            <View className="flex-1 items-center">
              <Text
                style={{ fontSize: rf(1.8) }}
                className={`font-black uppercase tracking-[5px] text-center italic ${
                  disabled ? "text-white/20" : "text-white"
                }`}
              >
                {buttonText}
              </Text>
              
              {!disabled && (
                <Text className="text-[8px] text-indigo-400/50 uppercase tracking-[2px] mt-1 font-bold">
                  System.Link.Active
                </Text>
              )}
            </View>

            {/* Right HUD Detail (Status Dot) */}
            <View className={`h-2 w-2 rounded-full ${disabled ? 'bg-white/10' : 'bg-indigo-400 shadow-sm shadow-indigo-400'}`} />
          </View>

          {/* 4. TOP "REFLECTION" LINE */}
          {!disabled && (
            <View className="absolute top-0 left-8 right-8 h-[1px] bg-white/20" />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(PlayButton);