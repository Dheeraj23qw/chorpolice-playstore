import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { useSelector } from "react-redux";
import { selectCoins } from "@/features/wallet/walletSelectors";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface BettingModalProps {
  isVisible: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
  playerCount: number;
}

const COIN_OPTIONS = [10, 50, 100, 500, 1000, 5000];

export const BettingModal: React.FC<BettingModalProps> = ({
  isVisible,
  onConfirm,
  onClose,
  playerCount,
}) => {
  const userCoins = useSelector(selectCoins);
  const [selectedCoins, setSelectedCoins] = useState<number>(COIN_OPTIONS[0]);

  /* ---------------- ANIMATION ---------------- */
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      setSelectedCoins(COIN_OPTIONS[0]);

      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();

      return () => loop.stop(); // ✅ prevent leak
    }
  }, [isVisible]);

  const safePlayerCount = playerCount > 0 ? playerCount : 1;

  const totalReward = useMemo(
    () => selectedCoins * safePlayerCount,
    [selectedCoins, safePlayerCount],
  );

  const isDisabled = selectedCoins > userCoins;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={isVisible} transparent animationType="none">
      {/* BACKDROP */}
      <Pressable
        onPress={handleClose}
        className="flex-1 items-center justify-center"
      >
        {/* 🎯 PERFECT TOP → BOTTOM FADE */}
        <LinearGradient
          colors={[
            "rgba(5,5,10,0.85)", // strong at top
            "rgba(5,5,10,0.45)", // soften
            "rgba(5,5,10,0.15)", // very light mid
            "rgba(5,5,10,0.05)", // almost invisible
            "transparent", // fully clear
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          className="absolute h-full w-full"
        />
        {/* 🔒 Prevent inside close */}
        <Pressable onPress={() => {}} className="w-full items-center">
          <Animated.View
            style={{
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }}
            className="w-[90%] max-w-sm overflow-hidden rounded-[32px]"
          >
            {/* ✨ GLASS CARD */}
            <BlurView intensity={70} tint="dark" className="p-6">
              {/* BORDER GLOW */}
              <View className="absolute inset-0 rounded-[32px] border border-white/10" />

              {/* HEADER */}
              <View className="mb-6 items-center">
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
                  <Ionicons name="logo-bitcoin" size={28} color="#facc15" />
                </View>

                <Text className="font-main-bold text-xl text-white">
                  Choose Coins
                </Text>

                <Text className="mt-1 text-center text-sm text-white/40">
                  Select entry amount
                </Text>
              </View>

              {/* COIN OPTIONS */}
              <View className="flex-row flex-wrap justify-between">
                {COIN_OPTIONS.map((coins) => {
                  const isSelected = selectedCoins === coins;
                  const canAfford = userCoins >= coins;

                  return (
                    <TouchableOpacity
                      key={coins}
                      onPress={() => canAfford && setSelectedCoins(coins)}
                      activeOpacity={0.85}
                      className="mb-3 w-[47%]"
                    >
                      <LinearGradient
                        colors={
                          isSelected
                            ? ["#FACC1533", "#FACC1510"]
                            : ["rgba(255,255,255,0.05)", "transparent"]
                        }
                        className={`items-center rounded-2xl border p-4 ${
                          isSelected ? "border-yellow-400" : "border-white/10"
                        } ${!canAfford && "opacity-30"}`}
                      >
                        <Text
                          className={`font-main-bold text-lg ${
                            isSelected ? "text-yellow-400" : "text-white"
                          }`}
                        >
                          {coins} 🪙
                        </Text>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#facc15"
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                            }}
                          />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 💎 REWARD CARD */}
              <Animated.View
                style={{ transform: [{ scale: pulseAnim }] }}
                className="my-6 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={["#10B98133", "#10B98110"]}
                  className="items-center border border-green-400/20 py-5"
                >
                  <Text className="text-xs uppercase tracking-widest text-white/40">
                    Total Reward
                  </Text>

                  <Text className="mt-1 font-main-bold text-3xl text-green-400">
                    {totalReward} 🪙
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* 🚀 CTA */}
              <TouchableOpacity
                onPress={() => !isDisabled && onConfirm(selectedCoins)}
                disabled={isDisabled}
                activeOpacity={0.9}
                className="overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={
                    isDisabled ? ["#333", "#222"] : ["#6366F1", "#8B5CF6"]
                  }
                  className="items-center py-4"
                >
                  <Text
                    className={`font-main-bold text-base ${
                      isDisabled ? "text-white/30" : "text-white"
                    }`}
                  >
                    {isDisabled ? "Not enough coins" : "Start Game"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* CANCEL */}
              <TouchableOpacity
                onPress={handleClose}
                className="mt-4 items-center"
              >
                <Text className="text-sm text-white/30">Cancel</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
