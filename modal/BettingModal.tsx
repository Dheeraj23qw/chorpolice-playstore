import React, { useState, useEffect, useMemo } from "react";
import { View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { MotiView } from "moti";
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

  /* ---------------- RESET STATE ON OPEN ---------------- */
  useEffect(() => {
    if (isVisible) {
      setSelectedCoins(COIN_OPTIONS[0]);
    }
  }, [isVisible]);

  /* ---------------- SAFE PLAYER COUNT ---------------- */
  const safePlayerCount = playerCount > 0 ? playerCount : 1;

  /* ---------------- CALCULATE REWARD ---------------- */
  const totalReward = useMemo(() => {
    return selectedCoins * safePlayerCount;
  }, [selectedCoins, safePlayerCount]);

  /* ---------------- VALIDATION ---------------- */
  const isDisabled = selectedCoins > userCoins;

  /* ---------------- HANDLERS ---------------- */
  const handleConfirm = () => {
    if (isDisabled) return;
    onConfirm(selectedCoins);
  };

  return (
    <Modal visible={isVisible} transparent={false} animationType="slide">
      <View className="flex-1 items-center justify-center bg-slate-950 px-4">
        {/* BACKGROUND */}
        <View className="absolute h-full w-full">
          <View className="absolute left-[-50] top-[-50] h-60 w-60 rounded-full bg-indigo-600/20 blur-3xl" />
          <View className="absolute bottom-[-50] right-[-50] h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
        </View>

        {/* CARD */}
        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 30 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]"
        >
          {/* HEADER */}
          <View className="items-center border-b border-white/5 bg-indigo-600/20 px-6 py-8">
            <MotiView
              from={{ scale: 0.6, rotate: "0deg" }}
              animate={{ scale: 1, rotate: "360deg" }}
              transition={{ type: "spring", damping: 12 }}
              className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400"
            >
              <Ionicons name="game-controller" size={32} color="#78350f" />
            </MotiView>

            <Text className="text-center font-main-bold text-xl text-white">
              Choose Coins
            </Text>

            <Text className="mt-2 text-center font-main-md text-sm text-indigo-300">
              Select coins to play
            </Text>
          </View>

          {/* OPTIONS */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[380px] px-6 py-6"
          >
            <View className="flex-row flex-wrap justify-between">
              {COIN_OPTIONS.map((coins) => {
                const canAfford = userCoins >= coins;
                const isSelected = selectedCoins === coins;

                return (
                  <TouchableOpacity
                    key={coins}
                    onPress={() => canAfford && setSelectedCoins(coins)}
                    activeOpacity={canAfford ? 0.7 : 1}
                    className={`mb-4 w-[48%] rounded-2xl border-2 p-4 ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400/20"
                        : canAfford
                          ? "border-white/10 bg-white/5"
                          : "border-white/5 bg-black/40 opacity-30"
                    }`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="logo-bitcoin"
                        size={16}
                        color={isSelected ? "#facc15" : "rgba(255,255,255,0.4)"}
                      />
                      <Text
                        className={`ml-2 font-main-bold text-lg ${
                          isSelected ? "text-yellow-400" : "text-white/60"
                        }`}
                      >
                        {coins}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* BALANCE */}
            <View className="mt-2 flex-row items-center justify-center self-center rounded-xl bg-white/5 px-4 py-2">
              <Text className="text-xs text-white/50">Your Coins:</Text>
              <Text className="ml-2 font-main-bold text-xs text-yellow-400">
                {userCoins}
              </Text>
            </View>

            {/* REWARD */}
            <View className="mt-6 w-full items-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <Text className="text-xs text-white/40">You Can Win</Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                className="mt-1 text-center font-main-bold text-green-400"
                style={{
                  fontSize: Math.min(28, 160 / String(totalReward).length),
                }}
              >
                {totalReward} 🪙
              </Text>

              <Text className="mt-1 text-center text-[10px] text-white/30">
                From {safePlayerCount} players
              </Text>
            </View>
          </ScrollView>

          {/* BUTTONS */}
          <View className="p-5 pt-2">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isDisabled}
              className={`h-[55px] w-full items-center justify-center rounded-xl ${
                isDisabled ? "bg-white/10" : "bg-indigo-600"
              }`}
            >
              <Text className="font-main-bold text-base text-white">
                {isDisabled ? "Not Enough Coins" : "Start Game"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="mt-3 items-center">
              <Text className="text-xs text-white/30">Cancel</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
