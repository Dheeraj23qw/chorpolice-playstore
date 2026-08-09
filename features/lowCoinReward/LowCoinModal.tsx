import React, { useEffect } from "react";
import { Modal, View, TouchableOpacity, Image } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { useDispatch } from "react-redux";
import { closeModalUI, openModalUI } from "@/redux/reducers/uiStateSlice";

interface Props {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  onDisable: () => void;
  referralCode: string;
}

export const LowCoinModal = ({
  visible,
  onClose,
  onShare,
  onDisable,
  referralCode,
}: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible) {
      dispatch(openModalUI());
    } else {
      dispatch(closeModalUI());
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        {/* GLASS CONTAINER */}
        <MotiView
          from={{ scale: 0.9, opacity: 0, translateY: 20 }}
          animate={{ scale: 1, opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-full max-w-sm overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0f]"
        >
          <BlurView intensity={60} tint="dark">
            <View className="items-center p-8">
              {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 top-4 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/5"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>

            {/* HEADER ICON */}
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/20">
              <Ionicons name="wallet-outline" size={40} color="#f59e0b" />
            </View>

            {/* TITLE */}
            <Text className="text-center font-main-bold text-2xl text-white">
              Low on Coins?
            </Text>
            <Text className="mt-2 text-center text-sm text-white/50">
              Complete quick tasks to refill your bag and keep playing!
            </Text>

            {/* TASKS */}
            <View className="mt-8 w-full gap-y-4">
              {/* REFERRAL CODE DISPLAY */}
              <View className="items-center rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-[10px] uppercase tracking-widest text-white/40">Your Referral Code</Text>
                <Text className="mt-1 font-main-bold text-2xl tracking-[4px] text-amber-500">{referralCode}</Text>
              </View>

              {/* SHARE TASK */}
              <TouchableOpacity
                onPress={onShare}
                activeOpacity={0.7}
                className="overflow-hidden rounded-2xl border border-white/5 bg-indigo-600"
              >
                <View className="flex-row items-center p-5">
                  <Ionicons name="share-social" size={24} color="white" />
                  <View className="ml-4 flex-1">
                    <Text className="font-main-bold text-white">Share with Friends</Text>
                    <Text className="text-[10px] text-white/70">Invite friends using your code</Text>
                  </View>
                  <View className="rounded-lg bg-black/20 px-2 py-1">
                    <Text className="font-main-bold text-[10px] text-white">+5000</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View className="mt-8 w-full flex-row items-center justify-between border-t border-white/5 pt-6">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-[10px] font-main-bold uppercase tracking-widest text-white/30">
                  Maybe Later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onDisable}>
                <Text className="text-[10px] font-main-bold uppercase tracking-widest text-indigo-400/40">
                  Don&apos;t show again
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
};
