import React, { useState, useEffect } from "react";
import { View, Pressable, Image, TextInput, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { rf, wp } from "@/utils/responsive";
import {
  loadAvatar,
  saveAvatar,
  loadUsername,
  saveUsername,
  loadAvatarId,
} from "@/storage/userStorage";
import { playerImages } from "@/constants/playerData";
import { useEarnLogic } from "@/hooks/useEarnLogic";
import { useAppSelector, useAppDispatch } from "@/hooks/useAppRedux";
import { RedeemModal } from "@/modal/RedeemModal";
import { toast } from "@/components/feedback/toast";
import { generateNumericCode } from "@/utils/referral";
import { updateStreak } from "@/storage/streakStorage";
import { handleShare } from "@/utils/share";

const UserProfileCard = () => {
  const { coins } = useEarnLogic();
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  const pulse = useSharedValue(1);
  const { pickImage } = useGalleryPicker();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState(loadAvatarId());
  const [name, setName] = useState(loadUsername());
  const [isEditing, setIsEditing] = useState(false);
  const [isRedeemVisible, setIsRedeemVisible] = useState(false);
  const [streak, setStreak] = useState(1);

  const localPlayerId = useAppSelector((s) => s.session.localPlayerId);
  const referralCode = generateNumericCode(localPlayerId);
  const dispatch = useAppDispatch();

  const AVATAR_SIZE = wp(26);

  useEffect(() => {
    const init = async () => {
      const [savedAvatar, savedName, savedAvatarId] = await Promise.all([
        loadAvatar(),
        loadUsername(),
        loadAvatarId(),
      ]);
      if (savedAvatar) setAvatar(savedAvatar);
      if (savedName) setName(savedName.slice(0, 8)); // Ensure loaded name respects limit
      setAvatarId(savedAvatarId);
      setStreak(updateStreak());
    };
    init();

    // Start status pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      borderGlow.value,
      [0, 1],
      ["rgba(124, 92, 255, 0.2)", "#7C5CFF"],
    ),
  }));

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

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

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setAvatar(uri);
      saveAvatar(uri);
      toast.success("Profile Updated", "Avatar synchronized successfully.");
    }
  };

  const toggleEdit = () => {
    if (!isEditing && Platform.OS !== "web") Haptics.selectionAsync();
    setIsEditing(!isEditing);
  };

  return (
    <View className="px-6 py-6">
      {/* STATUS & STREAK HEADER */}
      <View className="mb-8 flex-row items-center justify-between">
        <View>
          <Text className="font-main-bold text-[10px] uppercase tracking-[3px] text-white/30">
            System Status
          </Text>
          <View className="mt-1 flex-row items-center">
            <Animated.View
              style={pulseStyle}
              className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
            />
            <Text className="font-main-medium text-[11px] uppercase text-emerald-500/80">
              Online
            </Text>
          </View>
        </View>

        <BlurView
          intensity={20}
          tint="light"
          className="overflow-hidden rounded-xl border border-orange-500/30 bg-orange-500/5 px-3 py-1.5"
        >
          <Text className="font-main-bold text-[10px] tracking-tight text-orange-400">
            🔥 {streak} DAY STREAK
          </Text>
        </BlurView>
      </View>

      <View className="flex-row items-center">
        {/* AVATAR ASSEMBLY */}
        <Pressable
          onPress={handlePickImage}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View className="items-center justify-center">
            <View
              style={{ width: AVATAR_SIZE + 10, height: AVATAR_SIZE + 10 }}
              className="absolute rounded-full bg-indigo-500/10 blur-2xl"
            />
            <Animated.View
              style={[
                {
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderWidth: 1.5,
                  borderRadius: AVATAR_SIZE / 2,
                  padding: 4,
                  backgroundColor: "#050505",
                },
                animatedAvatarStyle,
              ]}
            >
              <View className="flex-1 overflow-hidden rounded-full bg-zinc-900">
                <Image
                  source={
                    avatar
                      ? { uri: avatar }
                      : playerImages[avatarId]?.src ||
                        require("@/assets/images/chorsipahi/thief.webp")
                  }
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
              <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-4 border-[#0F0F0F] bg-indigo-600 shadow-lg">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </Animated.View>
          </View>
        </Pressable>

        {/* IDENTITY SECTION */}
        <View className="ml-6 flex-1">
          <Pressable onPress={toggleEdit} className="flex-row items-center">
            {isEditing ? (
              <TextInput
                value={name}
                onChangeText={(val) => setName(val.slice(0, 8))}
                maxLength={8}
                onBlur={() => {
                  setIsEditing(false);
                  saveUsername(name || loadUsername());
                }}
                autoFocus
                className="min-w-[120px] p-0 font-main-bold text-white"
                style={{ fontSize: rf(3.2) }}
                selectionColor="#7C5CFF"
              />
            ) : (
              <View className="flex-row items-center">
                <Text
                  className="font-main-bold uppercase tracking-tight text-white"
                  style={{ fontSize: rf(3.2) }}
                  numberOfLines={1}
                >
                  {name || loadUsername()}
                </Text>
                <Ionicons
                  name="pencil"
                  size={12}
                  color="rgba(255,255,255,0.2)"
                  style={{ marginLeft: 8 }}
                />
              </View>
            )}
          </Pressable>

          <View className="mt-3 flex-row items-center">
            <View className="flex-row items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Text className="mr-2 text-xs">🪙</Text>
              <Text className="font-main-bold text-xs text-yellow-500">
                {coins.toLocaleString()}
              </Text>
            </View>

            <Pressable
              onPress={() => setIsRedeemVisible(true)}
              className="ml-3 rounded-full bg-indigo-600 px-4 py-1.5 shadow-md active:opacity-80"
            >
              <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white">
                Redeem
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* REFERRAL CARD */}
      <Pressable
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleShare(referralCode);
        }}
        className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
      >
        <BlurView
          intensity={15}
          tint="dark"
          className="flex-row items-center p-5"
        >
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20">
            <Ionicons name="qr-code" size={20} color="#818cf8" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="font-main-medium text-[9px] uppercase tracking-[2px] text-white/40">
              Personal Referral ID
            </Text>
            <Text className="font-main-bold text-xl tracking-[5px] text-indigo-400">
              {referralCode}
            </Text>
          </View>
          <Ionicons name="share-outline" size={20} color="#818cf8" />
        </BlurView>
      </Pressable>

      <RedeemModal
        visible={isRedeemVisible}
        onClose={() => setIsRedeemVisible(false)}
      />
    </View>
  );
};

export default React.memo(UserProfileCard);
