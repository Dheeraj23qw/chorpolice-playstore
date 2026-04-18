import React from "react";
import { Modal, View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onRate: () => void;
  onDisable: () => void;
}

export const LowCoinModal = ({
  visible,
  onClose,
  onShare,
  onRate,
  onDisable,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/80 px-6"
      >
        <Pressable onPress={() => {}} className="w-full">
          {/* 🔥 OUTER GLOW */}
          <View className="rounded-3xl border-4 border-yellow-400 bg-yellow-400/20 p-[2px] shadow-2xl shadow-yellow-400">
            {/* 🎮 MAIN CARD */}
            <View className="rounded-3xl bg-[#0b1020] p-1">
              {/* 🧱 INNER PANEL */}
              <View className="rounded-2xl bg-[#111827] p-6">
                {/* HEADER */}
                <Text className="text-center font-main-bold text-2xl text-yellow-300">
                  LOW COINS ⚡
                </Text>

                <Text className="mt-2 text-center text-sm text-slate-300">
                  You need more coins to continue!
                </Text>

                {/* ACTIONS */}
                <View className="mt-6 gap-4">
                  {/* SHARE BUTTON */}
                  <TouchableOpacity onPress={onShare} activeOpacity={0.85}>
                    <LinearGradient
                      colors={["#facc15", "#f59e0b"]}
                      className="rounded-2xl py-4"
                    >
                      <Text className="text-center font-main-bold text-base text-black">
                        📢 SHARE & GET COINS
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* RATE BUTTON */}
                  <TouchableOpacity onPress={onRate} activeOpacity={0.85}>
                    <LinearGradient
                      colors={["#22c55e", "#16a34a"]}
                      className="rounded-2xl py-4"
                    >
                      <Text className="text-center font-main-bold text-base text-white">
                        ⭐ RATE & EARN
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* SECONDARY */}
                  <TouchableOpacity onPress={onClose}>
                    <Text className="mt-2 text-center text-xs text-slate-400">
                      Remind me later
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onDisable}>
                    <Text className="mt-1 text-center text-xs text-red-400">
                      Don’t show again
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
