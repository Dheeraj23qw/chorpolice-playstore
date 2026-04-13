import React from "react";
import { View, Pressable, Image, TextInput } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AvatarSection = ({
  lobby,
  getAvatarSource,
  handleAvatarPress,
  animatedStyle,
}: any) => (
  <View className="mb-8 flex-row items-center justify-between">
    <View className="mr-6 flex-1">
      <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-indigo-400">
        Enter Player Name
      </Text>
      <TextInput
        value={lobby.userName}
        onChangeText={lobby.handleNameChange}
        placeholder="Enter Name..."
        placeholderTextColor="rgba(255,255,255,0.2)"
        className="mt-2 font-main-bold text-3xl text-white"
      />
      <Text className="font-main-medium mt-1 text-[10px] uppercase tracking-[1px] text-white/30">
        Click photo to change avatar
      </Text>
    </View>

    <AnimatedPressable
      onPress={handleAvatarPress}
      style={animatedStyle}
      className="relative h-24 w-24 overflow-visible rounded-full"
    >
      <View className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 bg-indigo-600/20 shadow-xl shadow-indigo-500">
        <Image
          source={getAvatarSource(lobby.selectedImages[0] || 1)}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#121212] bg-indigo-500 shadow-lg">
        <Ionicons name="camera" size={14} color="white" />
      </View>
    </AnimatedPressable>
  </View>
);
