import React from "react";
import { View, Modal, TouchableOpacity, Pressable } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";

interface BoostScoreModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const BoostScoreModal: React.FC<BoostScoreModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept();
  };

  const handleDecline = () => {
    Haptics.selectionAsync();
    onDecline();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDecline}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        <Pressable className="absolute inset-0" onPress={handleDecline} />

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
                    <Ionicons name="rocket" size={26} color="black" />
                  </View>
                </MotiView>

                <Text className="mt-4 font-main-bold text-2xl tracking-widest text-white">
                  BOOST SCORE
                </Text>
                <Text className="mt-1 text-[11px] uppercase tracking-[3px] text-amber-500/80">
                  Special Reward
                </Text>
              </View>

              {/* REWARD UI (Modeled after EntryModal's Enhanced Balance UI) */}
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 400, delay: 150 }}
                className="mb-8"
              >
                <View className="overflow-hidden rounded-2xl border-x border-b border-t-2 border-x-amber-500/20 border-b-amber-500/20 border-t-amber-400 bg-amber-900/40 px-5 py-4 shadow-lg shadow-black/50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20">
                        <Ionicons name="trophy" size={20} color="#FBBF24" />
                      </View>
                      <Text className="font-main-bold text-[12px] tracking-wider text-white/70">
                        POTENTIAL REWARD
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className="font-main-bold text-2xl text-amber-400"
                        numberOfLines={1}
                      >
                        +8,000
                      </Text>
                      <Text className="mt-0.5 text-[11px] tracking-wide text-white/50">
                        Points
                      </Text>
                    </View>
                  </View>
                </View>
              </MotiView>

              {/* ACTIVATE BUTTON */}
              <TouchableOpacity
                onPress={handleAccept}
                activeOpacity={0.8}
                className="mt-2"
              >
                <MotiView
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <View
                    className="rounded-2xl border border-amber-400 bg-amber-500"
                    style={{
                      shadowColor: "#FBBF24",
                      shadowOpacity: 0.4,
                      shadowRadius: 15,
                      shadowOffset: { width: 0, height: 6 },
                    }}
                  >
                    <View className="h-16 flex-row items-center justify-center">
                      <Ionicons name="flash" size={18} color="black" />
                      <Text className="ml-2 font-main-bold text-[14px] uppercase tracking-[3px] text-black">
                        LET'S GO!
                      </Text>
                    </View>
                  </View>
                </MotiView>
              </TouchableOpacity>

              {/* CANCEL / SKIP */}
              <TouchableOpacity
                onPress={handleDecline}
                className="mt-5 self-center p-2"
              >
                <Text className="text-[12px] uppercase tracking-[2px] text-white/40 hover:text-white/70">
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
};
