import React from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { rf } from "@/utils/responsive";
import { Text } from "../Text";

interface PlayButtonProps {
  disabled: boolean;
  onPress: () => void;
  buttonText: string;
  subText?: string | null;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  disabled,
  onPress,
  buttonText,
  subText,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full px-2 pt-8"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      {/* 💠 MAIN BUTTON */}
      <LinearGradient
        colors={
          disabled ? ["#0a0a0f", "#050507"] : ["#4f46e5", "#312e81", "#1e1b4b"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden"
        style={{
          borderRadius: 999,
          backgroundColor: disabled ? "#050507" : "#1e1b4b",
          shadowColor: "#000",
          shadowOpacity: 0.45,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* 🎯 CONTENT */}
        <View className="items-center justify-center py-6 px-4">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ 
              fontSize: buttonText.length > 25 ? rf(1.2) : buttonText.length > 15 ? rf(1.5) : rf(1.9),
              letterSpacing: buttonText.length > 15 ? 1 : 4 
            }}
            className="font-main-bold uppercase text-white text-center"
          >
            {buttonText}
          </Text>

          {subText ? (
            <Text 
              className="mt-1 text-center font-main-bold text-[9px] uppercase tracking-widest text-indigo-400"
              style={{ textShadowColor: 'rgba(99, 102, 241, 0.5)', textShadowRadius: 4 }}
            >
              {subText}
            </Text>
          ) : (
            !disabled && (
              <Text className="mt-1 text-[9px] uppercase tracking-[3px] text-indigo-200/60">
                Tap to Start
              </Text>
            )
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default React.memo(PlayButton);
