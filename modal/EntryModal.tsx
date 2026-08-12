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
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
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
  }, [isVisible, userCoins]);

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

    return () => animatedCoins.removeListener(listenerId);
  }, [selected, userCoins, isVisible]);

  const handleSelect = (val: number) => {
    Haptics.selectionAsync();
    setSelected(val);
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
      {/* Background transparency adjusted so the game behind is clearly visible */}
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-black"
        >
          <BlurView intensity={100} tint="dark">
            <View className="bg-black/50 p-6">
              {/* HEADER */}
              <View className="mb-6 items-center">
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 100 }}
                >
                  <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-500 shadow-lg shadow-amber-500/30">
                    <FontAwesome5 name="coins" size={24} color="black" />
                  </View>
                </MotiView>

                <Text className="mt-4 font-main-bold text-2xl tracking-widest text-white">
                  BET YOUR COINS
                </Text>
                <Text className="mt-1 text-[11px] uppercase tracking-[3px] text-amber-500/80">
                  Choose your entry
                </Text>
              </View>

              {/* ENHANCED BALANCE UI */}
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 400, delay: 150 }}
                className="mb-6"
              >
                <View className="overflow-hidden rounded-2xl border-x border-b border-t-2 border-x-amber-500/20 border-b-amber-500/20 border-t-amber-400 bg-amber-900/40 px-5 py-4 shadow-lg shadow-black/50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20">
                        <Ionicons name="wallet" size={20} color="#FBBF24" />
                      </View>
                      <Text className="font-main-bold text-[12px] tracking-wider text-white/70">
                        YOUR COINS
                      </Text>
                    </View>

                    <View className="items-end">
                      <Animated.Text
                        className="font-main-bold text-2xl text-amber-400"
                        numberOfLines={1}
                      >
                        {displayedCoins.toLocaleString()}
                      </Animated.Text>
                      {selected > 0 && (
                        <Text className="mt-0.5 text-[11px] tracking-wide text-white/50">
                          Entry: −{selected.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </MotiView>

              {/* COIN OPTIONS */}
              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT * 0.38 }}
                showsVerticalScrollIndicator={false}
              >
                {SECTIONS.map((section) => (
                  <View key={section.title} className="mb-6">
                    <View className="mb-3 flex-row items-center">
                      <View className="mr-3 h-[1px] w-6 bg-amber-600/50" />
                      <FontAwesome5
                        name={section.icon}
                        size={10}
                        color="#FBBF24"
                      />
                      <Text className="ml-2 text-[11px] uppercase tracking-[3px] text-amber-500/80">
                        {section.title}
                      </Text>
                      <View className="ml-3 h-[1px] flex-1 bg-amber-600/20" />
                    </View>

                    <View className="-mx-1.5 flex-row flex-wrap">
                      {section.values.map((val) => {
                        const isPicked = selected === val;
                        const isDisabled = val > userCoins || val > othersCoins;

                        return (
                          <View key={val} style={{ width: "50%", padding: 6 }}>
                            <TouchableOpacity
                              disabled={isDisabled}
                              onPress={() => handleSelect(val)}
                              activeOpacity={isDisabled ? 1 : 0.7}
                            >
                              {/* Scale removed to prevent borders from looking cut off */}
                              <MotiView
                                animate={{
                                  borderColor: isDisabled
                                    ? "rgba(255,255,255,0.02)"
                                    : isPicked
                                      ? "#FBBF24"
                                      : "rgba(255,255,255,0.1)",
                                  backgroundColor: isDisabled
                                    ? "rgba(255,255,255,0.02)"
                                    : isPicked
                                      ? "rgba(245,158,11,0.15)"
                                      : "rgba(255,255,255,0.04)",
                                }}
                                transition={{ type: "timing", duration: 150 }}
                                style={{
                                  shadowColor: "#FBBF24",
                                  shadowOpacity:
                                    isPicked && !isDisabled ? 0.4 : 0,
                                  shadowRadius: 10,
                                }}
                                className="overflow-hidden rounded-2xl border"
                              >
                                {/* Text positioned at the bottom of the card */}
                                <View className="h-24 items-center justify-end pb-4">
                                  {isDisabled && (
                                    <View className="absolute inset-0 z-10 items-center justify-center bg-black/60">
                                      <Ionicons
                                        name="lock-closed"
                                        size={18}
                                        color="rgba(255,255,255,0.4)"
                                      />
                                    </View>
                                  )}

                                  <Text
                                    className={`font-main-bold text-xl ${
                                      isDisabled
                                        ? "text-white/20"
                                        : isPicked
                                          ? "text-amber-400"
                                          : "text-white/90"
                                    }`}
                                  >
                                    {formatCoins(val)}
                                  </Text>
                                  <Text
                                    className={`mt-1 text-[10px] uppercase tracking-widest ${
                                      isDisabled
                                        ? "text-white/10"
                                        : "text-white/40"
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

              {/* TOTAL WINNING AMOUNT */}
              <View className="mt-2 overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] uppercase tracking-[2px] text-amber-300/80">
                    Total Winning Amount
                  </Text>
                  <Text className="font-main-bold text-2xl text-amber-400 drop-shadow-md">
                    {totalPrize.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* START BUTTON */}
              <TouchableOpacity
                onPress={() => !isTooExpensive && handleConfirm()}
                disabled={isTooExpensive}
                activeOpacity={0.8}
                className="mt-6"
              >
                <MotiView
                  animate={{ scale: isTooExpensive ? 1 : 1.02 }}
                  transition={{ type: "spring" }}
                >
                  <View
                    className={`rounded-2xl border ${
                      isTooExpensive
                        ? "border-white/5 bg-[#1A1A1A]"
                        : "border-amber-400 bg-amber-500"
                    }`}
                    style={{
                      shadowColor: "#FBBF24",
                      shadowOpacity: isTooExpensive ? 0 : 0.4,
                      shadowRadius: 15,
                      shadowOffset: { width: 0, height: 6 },
                    }}
                  >
                    <View className="h-16 items-center justify-center">
                      <Text
                        className={`font-main-bold text-[14px] uppercase tracking-[3px] ${
                          isTooExpensive ? "text-white/30" : "text-black"
                        }`}
                      >
                        {isTooExpensive ? "Not Enough Coins" : "Start"}
                      </Text>
                    </View>
                  </View>
                </MotiView>
              </TouchableOpacity>

              {/* CANCEL */}
              <TouchableOpacity
                onPress={onClose}
                className="mt-5 self-center p-2"
              >
                <Text className="text-[12px] uppercase tracking-[2px] text-white/40 hover:text-white/70">
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
