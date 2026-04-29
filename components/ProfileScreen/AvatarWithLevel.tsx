import React from "react";
import { View, Image, TouchableOpacity, Platform } from "react-native";
import { Text } from "@/components/Text";
import * as LucideIcons from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolateColor
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { rf, wp } from "@/utils/responsive";
import { playerImages } from "@/constants/playerData";

interface Props {
  imageUri?: string | null;
  avatarId?: number;
  level: number;
  onPress: () => void;
}

export default function AvatarWithLevel({ imageUri, avatarId = 1, level, onPress }: Props) {
  const SIZE = wp(38);
  const RADIUS = SIZE / 2;

  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      borderGlow.value,
      [0, 1],
      ["rgba(124, 92, 255, 0.2)", "#7C5CFF"],
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    borderGlow.value = withTiming(1);
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    borderGlow.value = withTiming(0);
  };

  return (
    <View className="mt-10 w-full items-center">
      <View className="relative items-center justify-center">
        {/* Glow effect behind avatar (blur utility removed for Android compatibility) */}
        <View 
           style={{ width: SIZE + 20, height: SIZE + 20 }}
           className="absolute rounded-full bg-indigo-500/5" 
        />
        
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
        >
          <Animated.View
            style={[
              {
                width: SIZE,
                height: SIZE,
                borderRadius: RADIUS,
                borderWidth: 2,
                padding: 4,
                backgroundColor: "#050505",
              },
              animatedAvatarStyle,
            ]}
          >
            <View className="flex-1 overflow-hidden rounded-full bg-zinc-900">
               <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : playerImages[avatarId]?.src ||
                        require("@/assets/images/chorsipahi/thief.webp")
                  }
                  className="h-full w-full"
                  resizeMode="cover"
               />
            </View>

            {/* Camera Badge - Same as UserProfileCard */}
            <View className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-4 border-[#0F0F0F] bg-indigo-600 shadow-lg">
                <LucideIcons.Camera size={14} color="white" />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Level Badge - Perfectly Centered */}
        <View 
          className="absolute -bottom-4 inset-x-0 items-center"
          pointerEvents="none"
        >
          <View 
            className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-yellow-500 shadow-xl"
            style={{ elevation: 10 }}
          >
             <View className="px-4 py-1.5 flex-row items-center">
                <LucideIcons.Zap size={11} color="black" fill="black" />
                <Text className="ml-1.5 text-[10px] font-main-bold tracking-widest text-black">
                  LVL {level}
                </Text>
             </View>
          </View>
        </View>
      </View>
    </View>
  );
}
