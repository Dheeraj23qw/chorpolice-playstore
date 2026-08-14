import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Platform, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Lock, Coins } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { loadAvatar, saveAvatar, loadUsername, saveUsername, loadAvatarId } from "@/storage/userStorage";
import { playerImages } from "@/constants/playerData";
import { useEarnLogic } from "@/hooks/useEarnLogic";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface DailyBonusProfileCardProps {
  isLocked?: boolean;
  formattedTime?: string;
}

const DailyBonusProfileCard: React.FC<DailyBonusProfileCardProps> = ({
  isLocked = false,
  formattedTime = "",
}) => {
  const router = useRouter();
  const { pickImage } = useGalleryPicker();
  const { coins } = useEarnLogic();
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  const pulse = useSharedValue(1);
  const coinGlow = useSharedValue(0);

  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [avatarId, setAvatarId] = React.useState(() => loadAvatarId());
  const [name, setName] = React.useState(() => loadUsername().slice(0, 8));
  const [isEditing, setIsEditing] = useState(false);

  const AVATAR_SIZE = 140;

  React.useEffect(() => {
    const init = async () => {
      const [savedAvatar, savedName, savedAvatarId] = await Promise.all([
        loadAvatar(),
        loadUsername(),
        loadAvatarId(),
      ]);
      if (savedAvatar) setAvatar(savedAvatar);
      if (savedName) setName(savedName.slice(0, 8));
      setAvatarId(savedAvatarId);
    };
    init();

    pulse.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    coinGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
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
      ["rgba(245, 158, 11, 0.3)", "#F59E0B"],
    ),
  }));

  const coinGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.4 * coinGlow.value,
    transform: [{ scale: 0.95 + 0.05 * coinGlow.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    borderGlow.value = withTiming(1);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    }
  };

  const handleRedeem = () => {
    if (isLocked) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/earn");
  };

  const isEnabled = !isLocked;

  return (
    <TouchableOpacity
      onPress={handleRedeem}
      disabled={isLocked}
      activeOpacity={0.88}
      className={`relative mb-10 mt-4 overflow-hidden rounded-[36px] border-2 ${
        isEnabled ? "border-amber-400/90 bg-zinc-950" : "border-slate-800 bg-slate-900"
      }`}
      style={
        isEnabled
          ? {
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
              elevation: 16,
            }
          : {}
      }
    >
      {isEnabled && (
        <LinearGradient
          colors={["#34220F", "#1A1006", "#32200E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {isEnabled && (
        <LinearGradient
          colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {isLocked && (
        <View className="absolute inset-0 z-40 items-center justify-center bg-slate-950/90">
          <Lock size={20} color="#94a3b8" />
          <Text className="mt-2 font-main-bold text-[10px] uppercase tracking-[3px] text-slate-400">
            Unlocks In
          </Text>
          <Text className="mt-1 font-main-bold text-lg text-amber-400">{formattedTime}</Text>
        </View>
      )}

      {isEnabled && (
        <>
          <View className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-amber-500/25 blur-3xl" />
          <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-300/15 blur-2xl" />
        </>
      )}

      <View className="flex-row items-center justify-between p-6">
        <View className="z-10 flex-1 pr-4">
          <Pressable onPress={() => setIsEditing(!isEditing)} className="flex-row items-center">
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
                <View className="ml-2 h-7 w-7 items-center justify-center rounded-full border border-amber-300/50 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                  <Ionicons name="pencil-sharp" size={15} color="white" />
                </View>
              </View>
            )}
          </Pressable>

          <View className="mt-3 flex-row items-center">
            <Animated.View
              style={coinGlowStyle}
              className="mr-2 h-9 w-9 items-center justify-center rounded-full border border-yellow-400/80 bg-yellow-500/20"
            >
              <Coins size={18} color="#FBBF24" />
            </Animated.View>
            <View>
              <Text className="font-main-bold text-[10px] uppercase tracking-wider text-yellow-400/70">
                Coins
              </Text>
              <Text className="font-main-bold text-base tracking-tight text-yellow-300">
                {coins.toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center self-start overflow-hidden rounded-2xl border border-amber-300/60 px-5 py-2.5">
            <LinearGradient
              colors={["#FBBF24", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Zap size={14} color="#78350F" fill="#78350F" style={{ marginRight: 8 }} />
            <Text className="font-main-bold text-[11px] uppercase tracking-wider text-[#451A03]">
              Redeem Now
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handlePickImage}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="items-center justify-center"
        >
          <View className="items-center justify-center">
            <View
              style={{ width: AVATAR_SIZE + 10, height: AVATAR_SIZE + 10 }}
              className="absolute rounded-full bg-amber-500/10 blur-2xl"
            />
            <View className="relative items-center justify-center">
              {isEnabled && (
                <View className="absolute h-[154px] w-[154px] rounded-full border border-dashed border-amber-400/40" />
              )}
              <Animated.View
                style={[
                  {
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderWidth: 4,
                    borderRadius: AVATAR_SIZE / 2,
                    padding: 4,
                    backgroundColor: "#050505",
                  },
                  animatedAvatarStyle,
                  {
                    shadowColor: isEnabled ? "#F59E0B" : "transparent",
                    shadowOffset: { width: 0, height: 16 },
                    shadowOpacity: isEnabled ? 0.8 : 0,
                    shadowRadius: 24,
                    elevation: isEnabled ? 16 : 0,
                  },
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
                <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-4 border-[#0F0F0F] bg-amber-600 shadow-lg">
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DailyBonusProfileCard);
