import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, TouchableOpacity, View, BackHandler } from "react-native";
import { MotiView } from "moti";
import * as LucideIcons from "lucide-react-native";

import { claimAward } from "@/features/awards/awardsSlice";
import { ACHIEVEMENT_DATA } from "@/constants/achievements";
import { Text } from "@/components/Text";
import { RootState } from "@/redux/store";
import { openModalUI, closeModalUI } from "@/redux/reducers/uiStateSlice";

/* ---------------- TYPES ---------------- */

type Rarity = "Legendary" | "Epic" | "Rare" | "Common";

interface Achievement {
  id: number;
  title: string;
  desc: string;
  iconName: keyof typeof LucideIcons;
  rarity: Rarity;
}

/* ---------------- CONSTANTS ---------------- */

const THEME_MAP: Record<Rarity, { color: string; glow: string }> = {
  Legendary: { color: "#fcd34d", glow: "shadow-yellow-500/50" },
  Epic: { color: "#c084fc", glow: "shadow-purple-500/50" },
  Rare: { color: "#60a5fa", glow: "shadow-blue-500/50" },
  Common: { color: "#818cf8", glow: "shadow-indigo-500/50" },
};

const FALLBACK_THEME = { color: "#818cf8", glow: "" };

/* ---------------- COMPONENT ---------------- */

export default function UnlockedAwardModal() {
  const dispatch = useDispatch();

  const unlocked = useSelector((state: RootState) => state.awards.unlocked);

  /* ---------------- CURRENT AWARD ---------------- */

  const awardId = unlocked[0] ?? null;

  const award = useMemo<Achievement | undefined>(
    () =>
      ACHIEVEMENT_DATA.find((item) => item.id === awardId) as
        | Achievement
        | undefined,
    [awardId],
  );

  const isVisible = !!award;

  /* ---------------- UI SYNC ---------------- */

  useEffect(() => {
    if (isVisible) {
      dispatch(openModalUI());
    } else {
      dispatch(closeModalUI());
    }
  }, [isVisible, dispatch]);

  /* ---------------- BACK HANDLER ---------------- */

  useEffect(() => {
    if (!isVisible) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true, // block back press
    );

    return () => backHandler.remove();
  }, [isVisible]);

  /* ---------------- GUARD ---------------- */

  if (!isVisible) return null;

  /* ---------------- DERIVED ---------------- */

  const theme = award ? THEME_MAP[award.rarity] : FALLBACK_THEME;

  const IconComponent =
    (LucideIcons as Record<string, any>)[award?.iconName || "Trophy"] ||
    LucideIcons.Trophy;

  /* ---------------- ACTION ---------------- */

  const handleClose = () => {
    // 🔥 ONLY this is needed
    dispatch(claimAward(awardId));
  };

  /* ---------------- UI ---------------- */

  return (
    <Modal transparent visible animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 120,
          }}
          style={{ width: "100%", maxWidth: 384, alignItems: "center" }}
        >
          {/* ROTATING RING */}
          <MotiView
            from={{ rotate: "0deg" }}
            animate={{ rotate: "360deg" }}
            transition={{
              loop: true,
              duration: 15000,
              type: "timing",
            }}
            style={{ position: "absolute", top: -40, height: 320, width: 320 }}
            className="opacity-20"
          >
            <View className="absolute h-full w-full rounded-full border-[60px] border-dashed border-white/40" />
          </MotiView>

          {/* CARD */}
          <View
            className={`w-full items-center rounded-[40px] border-4 border-white/20 bg-slate-900 p-8 shadow-2xl ${theme.glow}`}
          >
            {/* ICON */}
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

            {/* TEXT */}
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

            {/* BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleClose}
              className="mt-8 w-full overflow-hidden rounded-2xl bg-green-500 py-4 shadow-lg shadow-green-500/40"
            >
              <View className="absolute left-0 right-0 top-0 h-1/2 bg-white/20" />
              <Text className="text-center font-main-bold text-lg uppercase text-white">
                Tap to Claim
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
