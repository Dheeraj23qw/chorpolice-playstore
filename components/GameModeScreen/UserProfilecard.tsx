import React, { useState, useEffect, useMemo } from "react";
import { View, Pressable, Image, TextInput } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Text } from "@/components/Text";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { rf, wp } from "@/utils/responsive";
import {
  loadAvatar,
  saveAvatar,
  loadUsername,
  saveUsername,
} from "@/storage/userStorage";
import { useEarnLogic } from "@/hooks/useEarnLogic";

const UserProfileCard = () => {
  const { coins } = useEarnLogic();
  const scale = useSharedValue(1);
  const { pickImage } = useGalleryPicker();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("PLAYER");
  const [isEditing, setIsEditing] = useState(false);

  // Avatar dimensions config
  const AVATAR_SIZE = wp(32); // Slightly increased to fit the border better
  const BORDER_THICKNESS = 4;
  const INNER_RADIUS = (AVATAR_SIZE - BORDER_THICKNESS * 2) / 2;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING ☀️";
    if (hour < 18) return "GOOD AFTERNOON 🌤️";
    return "GOOD EVENING 🌙";
  }, []);

  useEffect(() => {
    const savedAvatar = loadAvatar();
    const savedName = loadUsername();

    if (savedAvatar) setAvatar(savedAvatar);
    if (savedName) setName(savedName);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setAvatar(uri);
      saveAvatar(uri);
    }
  };

  const handleSaveName = () => {
    setIsEditing(false);
    saveUsername(name);
  };

  const displayName = name.length > 9 ? `${name.substring(0, 9)}...` : name;

  return (
    <View className="px-6 py-6">
      {/* --- GREETING --- */}
      <Text
        className="font-main-medium text-white/40"
        style={{ fontSize: rf(1.5), letterSpacing: 2 }}
      >
        {greeting}
      </Text>

      {/* --- MAIN HORIZONTAL ROW --- */}
      <View className="mt-5 flex-row items-center">
        {/* --- COOL AVATAR BORDER --- */}
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={handlePickImage}
            // Adjusted scaling for smoother feel
            onPressIn={() =>
              (scale.value = withSpring(0.96, { damping: 10, stiffness: 100 }))
            }
            onPressOut={() => (scale.value = withSpring(1))}
          >
            <View className="relative items-center justify-center">
              {/* 1. EXISTING GHOST GLOW (Unchanged) */}
              <View
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  backgroundColor: "#7C5CFF",
                }}
                className="absolute rounded-full opacity-20 blur-2xl"
              />

              {/* 2. THE COOL BORDER CONTAINER (Metal/Neon Feel) */}
              <View
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  // Using multiple borders/shades gives it depth
                  backgroundColor: "rgb(24, 24, 27)", // bg-zinc-900 (same as inner)
                  borderWidth: BORDER_THICKNESS,
                  borderColor: "rgba(255, 255, 255, 0.25)", // Light inner highlight
                  // Layer 1: Cool cyan subtle light (acts like a 'glow')
                  shadowColor: "#00E5FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  // Layer 2: Main metallic color
                  elevation: 5, // Adds subtle depth on Android
                }}
                className="items-center justify-center p-0.5" // Slight padding keeps image clean
              >
                {/* 3. INNER IMAGE CONTAINER (Clean Crop) */}
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: INNER_RADIUS,
                    // Subtle inner shadow effect
                    borderWidth: 1,
                    borderColor: "rgba(0, 0, 0, 0.4)",
                  }}
                  className="items-center justify-center overflow-hidden bg-zinc-900"
                >
                  <Image
                    source={
                      avatar
                        ? { uri: avatar }
                        : require("@/assets/images/chorsipahi/thief.png")
                    }
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* --- RIGHT CONTENT --- */}
        <View className="ml-6 flex-1">
          {/* NAME WITH PERSISTENCE */}
          <Pressable onPress={() => setIsEditing(true)}>
            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                autoFocus
                maxLength={12}
                className="p-0 font-main-bold text-white"
                style={{ fontSize: rf(4.2) }}
              />
            ) : (
              <Text
                className="font-main-bold uppercase text-white"
                style={{ fontSize: rf(4.2), letterSpacing: 1 }}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            )}
          </Pressable>

          {/* --- COIN PILL --- */}
          <View
            className="mt-3 flex-row items-center self-start rounded-2xl px-4 py-1.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Text className="mr-2" style={{ fontSize: rf(1.8) }}>
              🪙
            </Text>
            <Text
              className="font-main-bold text-yellow-400"
              style={{ fontSize: rf(2), letterSpacing: 0.5 }}
            >
              {coins.toLocaleString()}{" "}
              <Text
                className="font-main-medium text-white/30"
                style={{ fontSize: rf(1.4) }}
              >
                COINS
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(UserProfileCard);
