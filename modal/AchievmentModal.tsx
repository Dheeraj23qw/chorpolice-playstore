import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import * as LucideIcons from "lucide-react-native";

import { claimAward } from "@/features/awards/awardsSlice";
import { ACHIEVEMENT_DATA } from "@/constants/achievements";
import { Text } from "@/components/Text";

interface UnlockedAwardModalProps {
  visible?: boolean;
  onClaimed?: () => void;
}

export default function UnlockedAwardModal({
  visible = true,
  onClaimed,
}: UnlockedAwardModalProps) {
  const dispatch = useDispatch();
  const unlocked = useSelector((state: any) => state.awards.unlocked);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && unlocked.length > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [rotateAnim, scaleAnim, unlocked.length, visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => visible,
    );

    return () => backHandler.remove();
  }, [visible]);

  if (!visible || unlocked.length === 0) return null;

  const awardId = unlocked[0];
  const award = ACHIEVEMENT_DATA.find((item) => item.id === awardId);
  if (!award) return null;

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      dispatch(claimAward(awardId));
      onClaimed?.();
    });
  };

  const IconComponent =
    (LucideIcons as any)[award.iconName] || LucideIcons.Trophy;

  const theme = {
    Legendary: { color: "#fcd34d", glow: "shadow-yellow-500/50" },
    Epic: { color: "#c084fc", glow: "shadow-purple-500/50" },
    Rare: { color: "#60a5fa", glow: "shadow-blue-500/50" },
    Common: { color: "#818cf8", glow: "shadow-indigo-500/50" },
  }[award.rarity as string] || { color: "#818cf8", glow: "" };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm items-center"
        >
          <Animated.View
            style={{ transform: [{ rotate: spin }] }}
            className="absolute -top-10 h-80 w-80 opacity-20"
          >
            <View className="absolute h-full w-full rounded-full border-[60px] border-dashed border-white/40" />
          </Animated.View>

          <View
            className={`w-full items-center rounded-[40px] border-4 border-white/20 bg-slate-900 p-8 shadow-2xl ${theme.glow}`}
          >
            <View className="absolute -top-12">
              <View className="rounded-full border-4 border-white/10 bg-slate-900 p-2">
                <View
                  style={{ backgroundColor: theme.color }}
                  className="h-24 w-24 items-center justify-center rounded-full shadow-lg"
                >
                  <IconComponent size={48} color="white" />
                </View>
              </View>
            </View>

            <View className="mt-12 items-center">
              <Text className="font-main-bold text-xs uppercase tracking-widest text-white/50">
                {award.rarity} Unlocked
              </Text>
              <Text className="mt-2 text-center font-main-bold text-3xl text-white">
                CONGRATS!
              </Text>
              <View className="my-4 h-[2px] w-12 bg-white/10" />
              <Text
                style={{ color: theme.color }}
                className="text-center font-main-bold text-xl"
              >
                {award.title}
              </Text>
              <Text className="mt-2 text-center font-main-md leading-5 text-slate-400">
                {award.desc}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              className="mt-8 w-full overflow-hidden rounded-2xl bg-green-500 py-4 shadow-lg shadow-green-500/40"
            >
              <View className="absolute left-0 right-0 top-0 h-1/2 bg-white/20" />
              <Text className="text-center font-main-bold text-lg uppercase tracking-tighter text-white">
                Tap to Claim
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
