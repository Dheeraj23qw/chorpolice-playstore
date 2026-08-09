import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
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
  { title: "Beginner", values: [10, 100, 250, 500, 1000], icon: "seedling" },
  { title: "Expert", values: [2500, 5000, 7500, 10000, 25000], icon: "fire" },
  { title: "Grandmaster", values: [50000, 75000, 100000], icon: "crown" },
];

const formatCoins = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
  return val.toString();
};

export const EntryModal: React.FC<EntryModalProps> = ({
  isVisible,
  onConfirm,
  onClose,
  playerCount,
  minPlayerCoins,
}) => {
  const userCoins = useSelector((state: RootState) => state.wallet.coins);
  const othersCoins = minPlayerCoins ?? userCoins;




  const [selected, setSelected] = useState(10);

  useEffect(() => {
    if (isVisible) setSelected(10);
  }, [isVisible]);

  const players = playerCount > 0 ? playerCount : 1;
  const totalPrize = useMemo(() => selected * players, [selected, players]);
  const isTooExpensive = selected > userCoins || selected > othersCoins;

  if (!isVisible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/80 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* MAIN CARD */}
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 30 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          className="w-full max-w-md overflow-hidden rounded-[36px]"
        >
          <BlurView intensity={90} tint="dark">
            <LinearGradient
              colors={["rgba(255,255,255,0.06)", "rgba(0,0,0,0.4)"]}
              className="p-6"
            >
              {/* HEADER */}
              <View className="mb-6 items-center">
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    className="h-14 w-14 items-center justify-center rounded-2xl"
                  >
                    <Ionicons name="flash" size={22} color="white" />
                  </LinearGradient>
                </MotiView>

                <Text className="mt-3 font-main-bold text-xl text-white">
                  Choose Entry
                </Text>

                <Text className="mt-1 text-[10px] uppercase tracking-[2px] text-white/40">
                  Select your Coins
                </Text>
              </View>

              {/* OPTIONS */}
              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT * 0.42 }}
                showsVerticalScrollIndicator={false}
              >
                {SECTIONS.map((section) => (
                  <View key={section.title} className="mb-5">
                    <View className="mb-3 flex-row items-center">
                      <FontAwesome5
                        name={section.icon}
                        size={10}
                        color="#818cf8"
                      />
                      <Text className="ml-2 text-[10px] uppercase tracking-widest text-white/40">
                        {section.title}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap">
                      {section.values.map((val) => {
                        const isPicked = selected === val;
                        const isDisabled = val > userCoins || val > othersCoins;

                        return (
                          <View key={val} style={{ width: "50%", padding: 6 }}>
                            <TouchableOpacity
                              disabled={isDisabled}
                              onPress={() => setSelected(val)}
                              activeOpacity={isDisabled ? 1 : 0.85}
                            >
                              <MotiView
                                animate={{
                                  scale: isDisabled ? 1 : isPicked ? 1.06 : 1,
                                  borderColor: isDisabled
                                    ? "rgba(255,255,255,0.04)"
                                    : isPicked
                                      ? "#6366f1"
                                      : "rgba(255,255,255,0.06)",
                                  backgroundColor: isDisabled
                                    ? "rgba(255,255,255,0.015)"
                                    : isPicked
                                      ? "rgba(99,102,241,0.18)"
                                      : "rgba(255,255,255,0.03)",
                                }}
                                transition={{
                                  type: "timing",
                                  duration: 200,
                                }}
                                style={{
                                  shadowColor: "#6366f1",
                                  shadowOpacity:
                                    isPicked && !isDisabled ? 0.4 : 0,
                                  shadowRadius: 20,
                                }}
                                className="items-center justify-center overflow-hidden rounded-3xl border py-5"
                              >
                                {/* LOCK OVERLAY */}
                                {isDisabled && (
                                  <View className="absolute inset-0 items-center justify-center rounded-3xl bg-black/40">
                                    <Ionicons
                                      name="lock-closed"
                                      size={14}
                                      color="#ffffff70"
                                    />
                                  </View>
                                )}

                                {/* Glow */}
                                {isPicked && !isDisabled && (
                                  <View className="absolute inset-0 rounded-3xl bg-indigo-500/10" />
                                )}

                                <Text
                                  className={`font-main-bold text-base ${
                                    isDisabled
                                      ? "text-white/20"
                                      : isPicked
                                        ? "text-indigo-300"
                                        : "text-white/80"
                                  }`}
                                >
                                  {formatCoins(val)}
                                </Text>

                                <Text
                                  className={`mt-1 text-[9px] uppercase ${
                                    isDisabled
                                      ? "text-white/15"
                                      : "text-white/30"
                                  }`}
                                >
                                  coins
                                </Text>
                              </MotiView>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* PRIZE */}
              <View className="mt-4 overflow-hidden rounded-3xl">
                <LinearGradient
                  colors={["rgba(34,197,94,0.15)", "rgba(0,0,0,0.3)"]}
                  className="border border-green-500/20"
                >
                  <View className="items-center py-4">
                    <Text className="text-[9px] uppercase tracking-[3px] text-green-400/50">
                      Total Prize
                    </Text>

                    <Text className="mt-1 font-main-bold text-2xl text-green-400">
                      {totalPrize.toLocaleString()}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* CTA */}
              <TouchableOpacity
                onPress={() => !isTooExpensive && onConfirm(selected)}
                disabled={isTooExpensive}
                activeOpacity={0.85}
                className="mt-5"
              >
                <MotiView
                  animate={{
                    scale: isTooExpensive ? 1 : 1.02,
                  }}
                  transition={{ type: "timing", duration: 150 }}
                >
                  <LinearGradient
                    colors={
                      isTooExpensive ? ["#222", "#111"] : ["#6366f1", "#4f46e5"]
                    }
                    className="rounded-full shadow-lg"
                    style={{
                      shadowColor: "#6366f1",
                      shadowOpacity: isTooExpensive ? 0 : 0.4,
                      shadowRadius: 12,
                    }}
                  >
                    <View className="h-14 items-center justify-center">
                      <Text
                        className={`font-main-bold text-sm tracking-wide ${
                          isTooExpensive ? "text-white/30" : "text-white"
                        }`}
                      >
                        {isTooExpensive ? "Not Enough Coins" : "Start Match"}
                      </Text>
                    </View>
                  </LinearGradient>
                </MotiView>
              </TouchableOpacity>

              {/* CLOSE */}
              <TouchableOpacity onPress={onClose} className="mt-3 self-center">
                <Text className="text-[10px] uppercase tracking-[2px] text-white/25">
                  cancel
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
};
