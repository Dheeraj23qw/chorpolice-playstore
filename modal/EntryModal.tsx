import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";
import { RootState } from "@/redux/store";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EntryModalProps {
  isVisible: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
  playerCount: number;
  minPlayerCoins?: number;
}

const SECTIONS = [
  {
    title: "Beginner",
    values: [100, 250, 500, 1000, 2000],
    icon: "seedling",
  },
  {
    title: "Expert",
    values: [2500, 5000, 7500, 10000, 25000],
    icon: "fire",
  },
  {
    title: "Grandmaster",
    values: [50000, 75000, 100000],
    icon: "crown",
  },
];

const formatCoins = (val: number) => {
  if (val >= 100000) {
    return `${(val / 100000).toFixed(1)}L`;
  }

  if (val >= 1000) {
    return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
  }

  return val.toString();
};

const DEFAULT_STAKE = SECTIONS[0]?.values[0] ?? 100;

export const EntryModal: React.FC<EntryModalProps> = ({
  isVisible,
  onConfirm,
  onClose,
  playerCount,
  minPlayerCoins,
}) => {
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const othersCoins = minPlayerCoins ?? userCoins;

  const [selected, setSelected] = useState(DEFAULT_STAKE);

  const [displayedCoins, setDisplayedCoins] = useState(
    Math.max(0, userCoins - DEFAULT_STAKE),
  );

  const animatedCoins = useRef(
    new Animated.Value(Math.max(0, userCoins - DEFAULT_STAKE)),
  ).current;

  useEffect(() => {
    if (!isVisible) return;

    setSelected(DEFAULT_STAKE);

    const startingBalance = Math.max(0, userCoins - DEFAULT_STAKE);

    animatedCoins.stopAnimation();
    animatedCoins.setValue(startingBalance);
    setDisplayedCoins(startingBalance);
  }, [isVisible, userCoins, animatedCoins]);

  useEffect(() => {
    if (!isVisible) return;

    const targetBalance = Math.max(0, userCoins - selected);

    animatedCoins.stopAnimation();

    const listenerId = animatedCoins.addListener(({ value }) => {
      setDisplayedCoins(Math.round(value));
    });

    Animated.timing(animatedCoins, {
      toValue: targetBalance,
      duration: 400,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedCoins.removeListener(listenerId);
    };
  }, [selected, userCoins, isVisible, animatedCoins]);

  const handleSelect = (value: number) => {
    Haptics.selectionAsync();
    setSelected(value);
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onConfirm(selected);
  };

  const players = playerCount > 0 ? playerCount : 1;

  const totalPrize = useMemo(() => selected * players, [selected, players]);

  const isTooExpensive = selected > userCoins || selected > othersCoins;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/70 px-4">
        {/* BACKDROP */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* MODAL */}
        <MotiView
          from={{
            opacity: 0,
            scale: 0.92,
            translateY: 24,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            translateY: 12,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 120,
          }}
          className="w-full max-w-md overflow-hidden rounded-[34px] border border-amber-400/20 bg-[#0B0B12] shadow-2xl shadow-black"
        >
          <BlurView intensity={100} tint="dark" className="w-full">
            {/* PREMIUM BACKGROUND */}
            <View className="absolute inset-0 bg-amber-500/[0.025]" />

            {/* TOP GLOW */}
            <View className="absolute left-0 right-0 top-0 h-[1px] bg-amber-300/70" />

            <View className="p-6">
              {/* ================= HEADER ================= */}

              <View className="mb-7 items-center">
                <MotiView
                  from={{
                    scale: 0.7,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 16,
                    stiffness: 180,
                    delay: 80,
                  }}
                >
                  <View className="h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-amber-300/80 bg-amber-500 shadow-xl shadow-amber-500/40">
                    <FontAwesome5 name="coins" size={25} color="#111111" />
                  </View>
                </MotiView>

                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 150,
                  }}
                >
                  <Text className="mt-5 font-main-bold text-[25px] tracking-[2px] text-white">
                    BET YOUR COINS
                  </Text>

                  <Text className="mt-1 text-[10px] uppercase tracking-[3px] text-amber-400/70">
                    Choose your entry
                  </Text>
                </MotiView>
              </View>

              {/* ================= BALANCE ================= */}

              <MotiView
                from={{
                  opacity: 0,
                  translateY: 10,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: "timing",
                  duration: 350,
                  delay: 180,
                }}
                className="mb-6"
              >
                <View className="overflow-hidden rounded-[20px] border border-amber-400/30 bg-amber-500/[0.07]">
                  {/* GLOWING TOP BORDER */}
                  <View className="h-[2px] w-full bg-amber-400/80" />

                  <View className="flex-row items-center justify-between px-4 py-4">
                    {/* LEFT */}
                    <View className="flex-row items-center">
                      <View className="mr-3 h-11 w-11 items-center justify-center rounded-[14px] border border-amber-400/25 bg-amber-500/10">
                        <Ionicons
                          name="wallet-outline"
                          size={21}
                          color="#FBBF24"
                        />
                      </View>

                      <View>
                        <Text className="font-main-bold text-[11px] uppercase tracking-[1.5px] text-white/55">
                          YOUR BALANCE
                        </Text>

                        <Text className="mt-0.5 text-[10px] text-white/30">
                          Available coins
                        </Text>
                      </View>
                    </View>

                    {/* RIGHT */}
                    <View className="items-end">
                      <Animated.Text
                        className="font-main-bold text-[23px] text-amber-400"
                        numberOfLines={1}
                      >
                        {displayedCoins.toLocaleString()}
                      </Animated.Text>

                      {selected > 0 && (
                        <Text className="mt-0.5 text-[10px] text-white/35">
                          Entry −{selected.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </MotiView>

              {/* ================= STAKE OPTIONS ================= */}

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                  maxHeight: SCREEN_HEIGHT * 0.36,
                }}
              >
                {SECTIONS.map((section) => (
                  <View key={section.title} className="mb-5">
                    {/* SECTION HEADER */}

                    <View className="mb-3 flex-row items-center">
                      <View className="mr-2 h-[1px] w-5 bg-amber-500/40" />

                      <FontAwesome5
                        name={section.icon}
                        size={10}
                        color="#FBBF24"
                      />

                      <Text className="ml-2 font-main-bold text-[10px] uppercase tracking-[2.5px] text-amber-400/70">
                        {section.title}
                      </Text>

                      <View className="ml-3 h-[1px] flex-1 bg-white/5" />
                    </View>

                    {/* OPTIONS */}

                    <View className="-mx-1.5 flex-row flex-wrap">
                      {section.values.map((value) => {
                        const isPicked = selected === value;

                        const isDisabled =
                          value > userCoins || value > othersCoins;

                        return (
                          <View key={value} className="w-1/2 p-1.5">
                            <TouchableOpacity
                              disabled={isDisabled}
                              onPress={() => handleSelect(value)}
                              activeOpacity={isDisabled ? 1 : 0.75}
                            >
                              <MotiView
                                animate={{
                                  borderColor: isDisabled
                                    ? "rgba(255,255,255,0.04)"
                                    : isPicked
                                      ? "#FBBF24"
                                      : "rgba(255,255,255,0.09)",

                                  backgroundColor: isDisabled
                                    ? "rgba(255,255,255,0.025)"
                                    : isPicked
                                      ? "rgba(245,158,11,0.13)"
                                      : "rgba(255,255,255,0.035)",
                                }}
                                transition={{
                                  type: "timing",
                                  duration: 160,
                                }}
                                style={{
                                  shadowColor: "#FBBF24",
                                  shadowOpacity:
                                    isPicked && !isDisabled ? 0.35 : 0,
                                  shadowRadius: 12,
                                  elevation: isPicked && !isDisabled ? 4 : 0,
                                }}
                                className="overflow-hidden rounded-[18px] border"
                              >
                                {/* SELECTED TOP GLOW */}

                                {isPicked && !isDisabled && (
                                  <View className="absolute left-0 right-0 top-0 h-[2px] bg-amber-300" />
                                )}

                                <View className="h-[82px] items-center justify-center">
                                  {/* LOCK */}

                                  {isDisabled && (
                                    <View className="absolute inset-0 z-10 items-center justify-center bg-black/45">
                                      <View className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30">
                                        <Ionicons
                                          name="lock-closed"
                                          size={15}
                                          color="#71717A"
                                        />
                                      </View>
                                    </View>
                                  )}

                                  <Text
                                    className={`font-main-bold text-[20px] ${
                                      isDisabled
                                        ? "text-white/20"
                                        : isPicked
                                          ? "text-amber-400"
                                          : "text-white/90"
                                    }`}
                                  >
                                    {formatCoins(value)}
                                  </Text>

                                  <Text
                                    className={`mt-1 text-[9px] uppercase tracking-[2px] ${
                                      isDisabled
                                        ? "text-white/10"
                                        : isPicked
                                          ? "text-amber-400/50"
                                          : "text-white/30"
                                    }`}
                                  >
                                    Coins
                                  </Text>
                                </View>
                              </MotiView>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* ================= PRIZE ================= */}

              <MotiView
                from={{
                  opacity: 0,
                  translateY: 8,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: "timing",
                  duration: 300,
                  delay: 250,
                }}
                className="mt-1"
              >
                <View className="overflow-hidden rounded-[20px] border border-amber-400/25 bg-amber-500/[0.07]">
                  <View className="h-[1px] w-full bg-amber-400/50" />

                  <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                        <Ionicons
                          name="trophy-outline"
                          size={18}
                          color="#FBBF24"
                        />
                      </View>

                      <Text className="font-main-bold text-[10px] uppercase tracking-[1.5px] text-white/50">
                        TOTAL PRIZE
                      </Text>
                    </View>

                    <Text className="font-main-bold text-[23px] text-amber-400">
                      {totalPrize.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </MotiView>

              {/* ================= START ================= */}

              <TouchableOpacity
                onPress={() => !isTooExpensive && handleConfirm()}
                disabled={isTooExpensive}
                activeOpacity={0.8}
                className="mt-5"
              >
                <MotiView
                  animate={{
                    scale: isTooExpensive ? 1 : 1,
                  }}
                  transition={{
                    type: "spring",
                  }}
                >
                  <View
                    className={`overflow-hidden rounded-[18px] border ${
                      isTooExpensive
                        ? "border-white/5 bg-white/5"
                        : "border-amber-300 bg-amber-500"
                    }`}
                    style={{
                      shadowColor: "#FBBF24",
                      shadowOpacity: isTooExpensive ? 0 : 0.4,
                      shadowRadius: 16,
                      shadowOffset: {
                        width: 0,
                        height: 7,
                      },
                      elevation: isTooExpensive ? 0 : 8,
                    }}
                  >
                    {!isTooExpensive && (
                      <View className="absolute left-0 right-0 top-0 h-[2px] bg-white/70" />
                    )}

                    <View className="h-[58px] flex-row items-center justify-center">
                      {!isTooExpensive && (
                        <Ionicons name="play" size={17} color="#111111" />
                      )}

                      <Text
                        className={`ml-2 font-main-bold text-[13px] uppercase tracking-[2.5px] ${
                          isTooExpensive ? "text-white/25" : "text-black"
                        }`}
                      >
                        {isTooExpensive ? "Not Enough Coins" : "Start Game"}
                      </Text>
                    </View>
                  </View>
                </MotiView>
              </TouchableOpacity>

              {/* ================= CANCEL ================= */}

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="mt-4 self-center px-4 py-2"
              >
                <Text className="font-main-bold text-[11px] uppercase tracking-[2px] text-white/30">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
};
