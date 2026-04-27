import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { RootState } from "@/redux/store";

interface EntryModalProps {
  isVisible: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
  playerCount: number;
}

// Simple sections with clear coin values
const SECTIONS = [
  { title: "Beginner", values: [10, 100, 250, 500, 1000] },
  { title: "Expert", values: [2500, 5000, 7500, 10000, 25000] },
  { title: "Grandmaster", values: [50000, 75000, 100000] },
];

export const EntryModal: React.FC<EntryModalProps> = ({
  isVisible,
  onConfirm,
  onClose,
  playerCount,
}) => {
  const userCoins = useSelector((state: RootState) => state.wallet.coins);
  const othersCoins = useSelector(
    (state: RootState) => state.game?.minPlayerCoins ?? userCoins,
  );

  const [selected, setSelected] = useState(10);

  useEffect(() => {
    if (isVisible) setSelected(10);
  }, [isVisible]);

  const players = playerCount > 0 ? playerCount : 1;
  const totalPrize = useMemo(() => selected * players, [selected, players]);

  // Check if anyone in the room can't afford the selected amount
  const isTooExpensive = selected > userCoins || selected > othersCoins;

  if (!isVisible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/70"
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[90%] max-w-md overflow-hidden rounded-[30px] border border-white/10"
        >
          <BlurView intensity={90} tint="dark" className="p-6">
            {/* TOP ICON & TITLE */}
            <View className="mb-6 items-center">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
                <Ionicons name="trophy" size={22} color="#818cf8" />
              </View>
              <Text className="font-main-bold text-lg text-white">
                Entry Fee
              </Text>
              <Text className="text-xs text-white/40">
                Select coins to play
              </Text>
            </View>

            <ScrollView
              className="max-h-[350px]"
              showsVerticalScrollIndicator={false}
            >
              {SECTIONS.map((section) => (
                <View key={section.title} className="mb-5">
                  <Text className="mb-2 font-main-bold text-[10px] uppercase tracking-widest text-indigo-400">
                    {section.title}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {section.values.map((val) => {
                      const isPicked = selected === val;
                      const canPlay = val <= userCoins && val <= othersCoins;

                      return (
                        <TouchableOpacity
                          key={val}
                          disabled={!canPlay}
                          onPress={() => setSelected(val)}
                          style={{ width: "31%" }}
                          className={`items-center justify-center rounded-xl border py-3 ${
                            isPicked
                              ? "border-indigo-400 bg-indigo-500/30"
                              : "border-white/10 bg-white/5"
                          } ${!canPlay ? "opacity-10" : ""}`}
                        >
                          <Text
                            className={`font-main-bold text-xs ${isPicked ? "text-indigo-400" : "text-white"}`}
                          >
                            {val.toLocaleString()}
                          </Text>
                          <Text className="text-[8px] uppercase text-white/30">
                            Coins
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* PRIZE BOARD */}
            <View className="mt-4 items-center rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <Text className="font-main-bold text-[10px] uppercase text-green-400/60">
                Total Winner Reward
              </Text>
              <Text className="font-main-bold text-2xl text-green-400">
                {totalPrize.toLocaleString()}{" "}
                <Text className="text-sm">Coins</Text>
              </Text>
            </View>

            {/* START BUTTON */}
            <TouchableOpacity
              onPress={() => !isTooExpensive && onConfirm(selected)}
              disabled={isTooExpensive}
              className="mt-6 h-14 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={
                  isTooExpensive ? ["#222", "#111"] : ["#6366F1", "#4F46E5"]
                }
                className="flex-1 items-center justify-center"
              >
                <Text
                  className={`font-main-bold text-sm ${isTooExpensive ? "text-white/20" : "text-white"}`}
                >
                  {isTooExpensive ? "Not Enough Coins" : "Start Game"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="mt-4 items-center">
              <Text className="text-xs text-white/20">Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </MotiView>
      </Pressable>
    </Modal>
  );
};
