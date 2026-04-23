import React, { useState, useEffect, useMemo } from "react";
import { View, Modal, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { RootState } from "@/redux/store";

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
  const userCoins = useSelector((state: RootState) => state.wallet.coins);

  const [selectedCoins, setSelectedCoins] = useState(COIN_OPTIONS[0]);

  useEffect(() => {
    if (isVisible) {
      setSelectedCoins(COIN_OPTIONS[0]);
    }
  }, [isVisible]);

  const safePlayerCount = playerCount > 0 ? playerCount : 1;

  const totalReward = useMemo(
    () => selectedCoins * safePlayerCount,
    [selectedCoins, safePlayerCount],
  );

  const isDisabled = selectedCoins > userCoins;

  if (!isVisible) return null;

  return (
    <Modal visible transparent animationType="fade">
      {/* BACKDROP */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center"
      >
        {/* GRADIENT (UNCHANGED) */}
        <LinearGradient
          colors={[
            "rgba(5,5,10,0.85)",
            "rgba(5,5,10,0.45)",
            "rgba(5,5,10,0.15)",
            "rgba(5,5,10,0.05)",
            "transparent",
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          className="absolute h-full w-full"
        />

        {/* CONTENT BLOCK */}
        <Pressable onPress={() => {}} className="w-full items-center">
          {/* ENTRY ANIMATION */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 14,
              stiffness: 120,
            }}
            className="w-[90%] max-w-sm overflow-hidden rounded-[32px]"
          >
            {/* GLASS CARD */}
            <BlurView intensity={70} tint="dark" className="p-6">
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

              {/* REWARD CARD (PULSE via Moti) */}
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{
                  loop: true,
                  type: "timing",
                  duration: 1200,
                }}
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
              </MotiView>

              {/* CTA */}
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
              <TouchableOpacity onPress={onClose} className="mt-4 items-center">
                <Text className="text-sm text-white/30">Cancel</Text>
              </TouchableOpacity>
            </BlurView>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
