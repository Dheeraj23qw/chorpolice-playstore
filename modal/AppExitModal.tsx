import React, { useEffect, useRef } from "react";
import { Modal, View, Pressable, Platform } from "react-native";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { useDispatch } from "react-redux";
import { openModalUI, closeModalUI } from "@/redux/reducers/uiStateSlice";
interface AppExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AppExitModal({
  visible,
  onCancel,
  onConfirm,
}: AppExitModalProps) {
  const tapped = useRef(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (visible) {
      dispatch(openModalUI());
    } else {
      dispatch(closeModalUI());
    }

    return () => {
      dispatch(closeModalUI()); // safety cleanup
    };
  }, [visible]);

  const safeTap = (action: () => void) => {
    if (tapped.current) return;
    tapped.current = true;
    action();
    setTimeout(() => (tapped.current = false), 500);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        {/* BACKDROP TAP */}
        <Pressable
          className="absolute h-full w-full"
          onPress={() => safeTap(onCancel)}
        />

        {/* CARD ANIMATION */}
        <MotiView
          from={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 14,
            stiffness: 140,
          }}
          style={{ width: "100%", maxWidth: 380 }}
        >
          {/* GLASS CARD */}
          <BlurView
            intensity={25}
            tint="dark"
            className="overflow-hidden rounded-[32px] border border-white/10"
            style={{
              backgroundColor:
                Platform.OS === "android"
                  ? "rgba(15,15,25,0.85)"
                  : "transparent",
            }}
          >
            {/* TOP ACCENT */}
            <View className="h-[3px] w-full bg-gradient-to-r from-red-500 via-pink-500 to-red-500" />

            {/* HEADER */}
            <View className="items-center pb-3 pt-8">
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-red-500/10 shadow-lg">
                <Ionicons name="exit-outline" size={40} color="#ff5c7a" />
              </View>

              <Text className="mt-2 font-main-bold text-2xl text-white">
                Exit Game?
              </Text>
            </View>

            {/* DIVIDER */}
            <View className="mx-6 my-4 h-[1px] bg-white/5" />

            {/* BUTTONS */}
            <View className="p-6 pt-3">
              {/* CANCEL */}
              <Pressable
                onPress={() => safeTap(onCancel)}
                className="mb-3 h-[52px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10"
              >
                <Text className="font-main-bold text-white">
                  Continue Playing
                </Text>
              </Pressable>

              {/* EXIT */}
              <Pressable
                onPress={() => safeTap(onConfirm)}
                className="h-[52px] w-full items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10"
              >
                <Text className="font-main-bold text-red-400">Exit Now</Text>
              </Pressable>
            </View>
          </BlurView>
        </MotiView>
      </View>
    </Modal>
  );
}
