import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

const TOKEN_OPTIONS = [500, 1000, 5000, 10000, 25000, 50000, 100000];

export const EntryModal: React.FC<EntryModalProps> = ({
  isVisible,
  onConfirm,
  onClose,
  playerCount,
}) => {
  const userTokens = useSelector((state: RootState) => state.wallet.coins);

  const minPlayerTokens = useSelector(
    (state: RootState) => state.game?.minPlayerCoins ?? userTokens,
  );

  const [selectedTokens, setSelectedTokens] = useState(TOKEN_OPTIONS[0]);
  const [customAmount, setCustomAmount] = useState<string>("");

  useEffect(() => {
    if (isVisible) {
      setSelectedTokens(TOKEN_OPTIONS[0]);
      setCustomAmount("");
    }
  }, [isVisible]);

  const safePlayerCount = playerCount > 0 ? playerCount : 1;

  const selectedAmount = useMemo(() => {
    if (customAmount.trim().length > 0) {
      return Number(customAmount);
    }
    return selectedTokens;
  }, [customAmount, selectedTokens]);

  const totalPoints = useMemo(
    () => selectedAmount * safePlayerCount,
    [selectedAmount, safePlayerCount],
  );

  const isDisabled =
    !selectedAmount ||
    selectedAmount > userTokens ||
    selectedAmount > minPlayerTokens;

  if (!isVisible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center"
      >
        {/* BACKDROP */}
        <LinearGradient
          colors={[
            "rgba(5,5,10,0.85)",
            "rgba(5,5,10,0.45)",
            "rgba(5,5,10,0.15)",
            "transparent",
          ]}
          locations={[0, 0.25, 0.5, 1]}
          className="absolute h-full w-full"
        />

        {/* IMPORTANT: keyboard safe container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full items-center"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ alignItems: "center" }}
            className="w-full"
          >
            <Pressable onPress={() => {}} className="w-full items-center">
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 14 }}
                className="w-[90%] max-w-sm overflow-hidden rounded-[32px]"
              >
                <BlurView intensity={70} tint="dark" className="p-6">
                  <View className="absolute inset-0 rounded-[32px] border border-white/10" />

                  {/* HEADER */}
                  <View className="mb-6 items-center">
                    <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
                      <Ionicons name="logo-bitcoin" size={28} color="#facc15" />
                    </View>

                    <Text className="font-main-bold text-xl text-white">
                      Entry Setup
                    </Text>

                    <Text className="mt-1 text-center text-sm text-white/40">
                      Choose entry tokens for this session
                    </Text>
                  </View>

                  {/* OPTIONS */}
                  <View className="flex-row flex-wrap justify-between">
                    {TOKEN_OPTIONS.map((tokens) => {
                      const isSelected =
                        !customAmount && selectedTokens === tokens;

                      const canAfford =
                        tokens <= userTokens && tokens <= minPlayerTokens;

                      return (
                        <TouchableOpacity
                          key={tokens}
                          onPress={() => {
                            if (canAfford) {
                              setSelectedTokens(tokens);
                              setCustomAmount("");
                            }
                          }}
                          className="mb-3 w-[47%]"
                          activeOpacity={0.85}
                        >
                          <LinearGradient
                            colors={
                              isSelected
                                ? ["#FACC1533", "#FACC1510"]
                                : ["rgba(255,255,255,0.05)", "transparent"]
                            }
                            className={`items-center rounded-2xl border p-4 ${
                              isSelected
                                ? "border-yellow-400"
                                : "border-white/10"
                            } ${!canAfford ? "opacity-30" : ""}`}
                          >
                            <Text
                              className={`font-main-bold text-lg ${
                                isSelected ? "text-yellow-400" : "text-white"
                              }`}
                            >
                              {tokens} 🪙
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* CUSTOM INPUT */}
                  <View className="mt-4">
                    <Text className="mb-2 text-xs uppercase tracking-widest text-white/40">
                      Or enter custom tokens
                    </Text>

                    <TextInput
                      value={customAmount}
                      onChangeText={(text) => {
                        setCustomAmount(text.replace(/[^0-9]/g, ""));
                        setSelectedTokens(0);
                      }}
                      placeholder="Enter amount"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white"
                    />
                  </View>

                  {/* TOTAL */}
                  <MotiView
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
                        Total Points
                      </Text>

                      <Text className="mt-1 font-main-bold text-3xl text-green-400">
                        {totalPoints || 0} 🪙
                      </Text>
                    </LinearGradient>
                  </MotiView>

                  {/* CTA */}
                  <TouchableOpacity
                    onPress={() => !isDisabled && onConfirm(selectedAmount)}
                    disabled={isDisabled}
                    className="overflow-hidden rounded-2xl"
                  >
                    <LinearGradient
                      colors={
                        isDisabled ? ["#333", "#222"] : ["#6366F1", "#8B5CF6"]
                      }
                      className="items-center py-4"
                    >
                      <Text
                        className={`font-main-bold ${
                          isDisabled ? "text-white/30" : "text-white"
                        }`}
                      >
                        {isDisabled
                          ? "Not available for all players"
                          : "Start Session"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* CANCEL */}
                  <TouchableOpacity
                    onPress={onClose}
                    className="mt-4 items-center"
                  >
                    <Text className="text-sm text-white/30">Cancel</Text>
                  </TouchableOpacity>
                </BlurView>
              </MotiView>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
