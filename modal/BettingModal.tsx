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

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
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
      {/* BACKDROP (tap outside closes) */}
      <Pressable
        onPress={handleClose}
        className="flex-1 items-center justify-center bg-black/70 px-4"
      >
        {/* PREVENT CLOSE INSIDE */}
        <Pressable onPress={() => {}} className="w-full items-center">
          {/* CARD */}
          <Animated.View
            style={{
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }}
            className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#0B0F1A]/95 p-7"
          >
            {/* HEADER */}
            <View className="mb-6 items-center">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-500/20">
                <Ionicons name="logo-bitcoin" size={26} color="#facc15" />
              </View>

              <Text className="font-main-bold text-xl text-white">
                Choose Coins
              </Text>

              <Text className="mt-1 text-center text-sm text-white/40">
                Select entry amount to start game
              </Text>
            </View>

            {/* OPTIONS */}
            <View className="flex-row flex-wrap justify-between">
              {COIN_OPTIONS.map((coins) => {
                const isSelected = selectedCoins === coins;
                const canAfford = userCoins >= coins;

                return (
                  <TouchableOpacity
                    key={coins}
                    onPress={() => canAfford && setSelectedCoins(coins)}
                    activeOpacity={0.85}
                    className={`mb-3 w-[47%] items-center rounded-2xl border p-4 ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-500/15"
                        : "border-white/10 bg-white/5"
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
                        style={{ position: "absolute", top: 6, right: 6 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* REWARD */}
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="my-6 items-center rounded-2xl border border-white/10 bg-white/[0.04] py-4"
            >
              <Text className="text-xs uppercase tracking-widest text-white/40">
                Potential Reward
              </Text>

              <Text className="mt-1 font-main-bold text-3xl text-green-400">
                {totalReward} 🪙
              </Text>
            </Animated.View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => !isDisabled && onConfirm(selectedCoins)}
              disabled={isDisabled}
              activeOpacity={0.85}
              className={`w-full items-center rounded-2xl py-4 ${
                isDisabled ? "bg-white/5" : "bg-indigo-600"
              }`}
            >
              <Text
                className={`font-main-bold text-base ${
                  isDisabled ? "text-white/30" : "text-white"
                }`}
              >
                {isDisabled ? "Not enough coins" : "Start Game"}
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              onPress={handleClose}
              className="mt-4 items-center"
            >
              <Text className="text-sm text-white/30">Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
