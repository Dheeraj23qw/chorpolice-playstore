import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Pressable, Image, TextInput, Platform } from "react-native";
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
import SpinToWinModal from "@/modal/SpinToWinModal";
import { SpinToWinCard } from "@/components/EarnScreen/SpinToWinCard";
import { SPIN_COOLDOWN_MS } from "@/constants/spinwheel";
import { DevSpinToggle } from "@/components/DevSpinToggle";
import { generateNumericCode } from "@/utils/referral";
import { updateStreak } from "@/storage/streakStorage";
import { handleShare } from "@/utils/share";
import { loadReferralStats } from "@/storage/referralStatsStorage";

// AnimatedNumber — tweens between value changes (counts up on mount too).
const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({
  value,
  className,
}) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) return;

    const DURATION = 700;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min((Date.now() - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <Text className={className ?? "font-main-bold text-lg tracking-tight text-yellow-300"}>
      {display.toLocaleString()}
    </Text>
  );
};

const UserProfileCard = () => {
  const { coins } = useEarnLogic();
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  const pulse = useSharedValue(1);
  const coinBob = useSharedValue(0);
  const pop = useSharedValue(1);
  const { pickImage } = useGalleryPicker();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState(loadAvatarId());
  const [name, setName] = useState(loadUsername());
  const [isEditing, setIsEditing] = useState(false);
  const [isRedeemVisible, setIsRedeemVisible] = useState(false);
  const [isSpinModalVisible, setIsSpinModalVisible] = useState(false);
  const [streak, setStreak] = useState(1);

  const localPlayerId = useAppSelector((s) => s.session.localPlayerId);
  const spinLock = useAppSelector((s) => s.lock.spin);
  const referralCode = generateNumericCode(localPlayerId);
  const referralStats = useMemo(() => loadReferralStats(), [coins]);
  const dispatch = useAppDispatch();

  const COOLDOWN_MS = SPIN_COOLDOWN_MS;
  const isSpinActive = useMemo(() => {
    if (!spinLock.lastUsedTimestamp) return true;
    return Date.now() - spinLock.lastUsedTimestamp >= COOLDOWN_MS;
  }, [spinLock.lastUsedTimestamp]);

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
    // Gentle coin bob
    coinBob.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  // Pop the coin counter whenever the balance changes
  useEffect(() => {
    pop.value = withSequence(
      withSpring(1.25, { damping: 9, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, [coins]);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      borderGlow.value,
      [0, 1],
      ["rgba(124, 92, 255, 0.2)", "#7C5CFF"],
    ),
  }));

  const coinStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + 0.3 * pulse.value,
    transform: [{ scale: 0.9 + 0.1 * coinBob.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -2 * coinBob.value },
      { scale: 1 + 0.02 * coinBob.value },
    ],
  }));

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
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
    <View className="relative px-6 py-6">
      {__DEV__ && <DevSpinToggle />}
      {isSpinActive ? (
        /* 🚀 LIVE SPIN WHEEL VIEW: Hide coins, streak & profile, show short heading + SpinToWinCard */
        <View>
          <View className="mb-2 items-center">
            <Text className="font-main-bold text-center text-xs uppercase tracking-[3px] text-amber-400">
              WIN UP TO 1000 COINS
            </Text>
          </View>

          <SpinToWinCard
            isLocked={false}
            formattedTime=""
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsSpinModalVisible(true);
            }}
          />
        </View>
      ) : (
        /* 👤 INACTIVE SPIN WHEEL VIEW: Show full profile card, coins, streak & referral card */
        <>
          {/* COINS, STREAK & REFERRALS SINGLE ANIMATED TOP ROW */}
          <View className="mb-6 flex-row items-center justify-between gap-x-2">
            {/* 1. COINS BALANCE */}
            <Animated.View
              style={containerStyle}
              className="flex-1 flex-row items-center justify-center overflow-hidden rounded-2xl border border-yellow-400/40 bg-yellow-500/10 px-2.5 py-2 shadow-[0_0_16px_rgba(250,204,21,0.3)]"
            >
              <Animated.View
                style={coinStyle}
                className="mr-1.5 h-7 w-7 items-center justify-center rounded-full border border-yellow-400/80 bg-yellow-400/20"
              >
                <Text className="text-xs">🪙</Text>
              </Animated.View>
              <View>
                <Text className="font-main-bold text-[8px] uppercase tracking-wider text-yellow-400/70">
                  Coins
                </Text>
                <Animated.View style={popStyle}>
                  <AnimatedNumber
                    value={coins}
                    className="font-main-bold text-sm tracking-tight text-yellow-300"
                  />
                </Animated.View>
              </View>
            </Animated.View>

            {/* 2. DAY STREAK */}
            <View className="flex-1 flex-row items-center justify-center overflow-hidden rounded-2xl border border-orange-400/40 bg-orange-500/10 px-2.5 py-2 shadow-[0_0_16px_rgba(251,146,60,0.3)]">
              <View className="mr-1.5 h-7 w-7 items-center justify-center rounded-full border border-orange-400/80 bg-orange-400/20">
                <Text className="text-xs">🔥</Text>
              </View>
              <View>
                <Text className="font-main-bold text-[8px] uppercase tracking-wider text-orange-400/70">
                  Streak
                </Text>
                <AnimatedNumber
                  value={streak}
                  className="font-main-bold text-sm tracking-tight text-orange-300"
                />
              </View>
            </View>

            {/* 3. REFERRALS MADE */}
            <View className="flex-1 flex-row items-center justify-center overflow-hidden rounded-2xl border border-indigo-400/40 bg-indigo-500/10 px-2.5 py-2 shadow-[0_0_16px_rgba(129,140,248,0.3)]">
              <View className="mr-1.5 h-7 w-7 items-center justify-center rounded-full border border-indigo-400/80 bg-indigo-400/20">
                <Text className="text-xs">👥</Text>
              </View>
              <View>
                <Text className="font-main-bold text-[8px] uppercase tracking-wider text-indigo-300/70">
                  Referrals
                </Text>
                <AnimatedNumber
                  value={referralStats.totalShares}
                  className="font-main-bold text-sm tracking-tight text-indigo-300"
                />
              </View>
            </View>
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
                    <View className="ml-2 h-7 w-7 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-500 shadow-[0_0_10px_rgba(124,92,255,0.8)]">
                      <Ionicons name="pencil-sharp" size={15} color="white" />
                    </View>
                  </View>
                )}
              </Pressable>

              <View className="mt-3 flex-row items-center">
                <Pressable
                  onPress={() => setIsRedeemVisible(true)}
                  className="ml-3 flex-row items-center rounded-full border border-indigo-300/40 bg-indigo-500 px-4 py-2 shadow-[0_0_12px_rgba(124,92,255,0.6)] active:opacity-80"
                >
                  <Ionicons
                    name="gift-outline"
                    size={14}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="font-main-bold text-[11px] uppercase tracking-widest text-white">
                    Redeem Coins
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
            <BlurView intensity={15} tint="dark">
              <View className="flex-row items-center p-5">
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
              </View>
            </BlurView>
          </Pressable>
        </>
      )}

      <RedeemModal
        visible={isRedeemVisible}
        onClose={() => setIsRedeemVisible(false)}
      />

      <SpinToWinModal
        isVisible={isSpinModalVisible}
        onClose={() => setIsSpinModalVisible(false)}
      />
    </View>
  );
};

export default React.memo(UserProfileCard);
