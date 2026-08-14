import React from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
      {disabled ? (
        <LinearGradient
          colors={["#0a0a0f", "#050507"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden"
          style={{
            borderRadius: 999,
            backgroundColor: "#050507",
            shadowColor: "#000",
            shadowOpacity: 0.45,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View className="items-center justify-center py-6 px-4">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontSize:
                  buttonText.length > 25
                    ? rf(1.2)
                    : buttonText.length > 15
                      ? rf(1.5)
                      : rf(1.9),
                letterSpacing: buttonText.length > 15 ? 1 : 4,
              }}
              className="font-main-bold uppercase text-white text-center"
            >
              {buttonText}
            </Text>

            {subText ? (
              <Text className="mt-1 text-center font-main-bold text-[9px] uppercase tracking-widest text-indigo-400">
                {subText}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      ) : (
        <View
          className="overflow-hidden rounded-[18px] border border-amber-300 bg-amber-500"
          style={{
            shadowColor: "#FBBF24",
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: {
              width: 0,
              height: 7,
            },
            elevation: 8,
          }}
        >
          <View className="absolute left-0 right-0 top-0 h-[2px] bg-white/70" />

          <View className="h-[58px] flex-row items-center justify-center">
            <Ionicons name="play" size={17} color="#111111" />

            <Text className="ml-2 font-main-bold text-[13px] uppercase tracking-[2.5px] text-black">
              {buttonText}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default React.memo(PlayButton);
