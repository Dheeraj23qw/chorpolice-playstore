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
} from "@/features/Avatar"; // Added Username functions
import { useEarnLogic } from "@/hooks/useEarnLogic";

const UserProfileCard = () => {
  const { coins } = useEarnLogic();
  const scale = useSharedValue(1);
  const { pickImage } = useGalleryPicker();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("PLAYER_1");
  const [isEditing, setIsEditing] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING ☀️";
    if (hour < 18) return "GOOD AFTERNOON 🌤️";
    return "GOOD EVENING 🌙";
  }, []);

  // Load both Avatar and Username on mount
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

  // Save name to MMKV when editing is finished
  const handleSaveName = () => {
    setIsEditing(false);
    saveUsername(name);
  };

  // Logic for the 9-character display limit
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
        {/* --- AVATAR --- */}
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={handlePickImage}
            onPressIn={() => (scale.value = withSpring(0.94))}
            onPressOut={() => (scale.value = withSpring(1))}
          >
            <View className="relative items-center justify-center">
              <View
                style={{
                  width: wp(30),
                  height: wp(30),
                  backgroundColor: "#7C5CFF",
                }}
                className="absolute rounded-full opacity-20 blur-2xl"
              />

              <View
                style={{
                  width: wp(30),
                  height: wp(30),
                  borderRadius: wp(15),
                  borderWidth: 3,
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
                className="items-center justify-center overflow-hidden bg-zinc-900"
              >
                <Image
                  source={
                    avatar
                      ? { uri: avatar }
                      : require("@/assets/images/chorsipahi/king.png")
                  }
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
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
                onBlur={handleSaveName} // Saves when user clicks away
                onSubmitEditing={handleSaveName} // Saves when user hits 'Done'
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
