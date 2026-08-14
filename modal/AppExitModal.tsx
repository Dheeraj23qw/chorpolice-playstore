import React, { useEffect, useRef } from "react";
import { Modal, View, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import * as Haptics from "expo-haptics";
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
      dispatch(closeModalUI());
    };
  }, [visible, dispatch]);

  const safeTap = (action: () => void) => {
    if (tapped.current) return;

    tapped.current = true;
    action();

    setTimeout(() => {
      tapped.current = false;
    }, 500);
  };

  const handleCancel = () => {
    if (tapped.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeTap(onCancel);
  };

  const handleConfirm = () => {
    if (tapped.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeTap(onConfirm);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* BACKDROP */}
        <View pointerEvents="none" className="absolute inset-0 bg-black/80" />

        <Pressable className="absolute inset-0" onPress={handleCancel} />

        {/* CARD */}
        <MotiView
          from={{
            scale: 0.9,
            opacity: 0,
            translateY: 24,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            translateY: 0,
          }}
          exit={{
            scale: 0.96,
            opacity: 0,
            translateY: 12,
          }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 170,
          }}
          className="w-full max-w-[430px]"
          style={{
            shadowColor: "#EF4444",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 25,
          }}
        >
          {/* OUTER GLOW BORDER */}
          <View
            className="overflow-hidden rounded-[40px] border border-red-400/40 bg-red-500/[0.06] p-[1px]"
            style={{
              shadowColor: "#F87171",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 18,
            }}
          >
            {/* GLASS */}
            <BlurView
              intensity={90}
              tint="dark"
              className="overflow-hidden rounded-[39px]"
            >
              {/* CARD */}
              <View className="rounded-[39px] bg-[#0F0F15]/90 px-7 pb-7 pt-7">
                {/* ICON */}
                <MotiView
                  from={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 18,
                    stiffness: 160,
                    delay: 100,
                  }}
                  className="mb-6 self-start"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 0.55,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  {/* ICON GLOW BORDER */}
                  <View className="rounded-full border border-red-300/30 bg-red-500/[0.08] p-[2px]">
                    <View className="h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/[0.10]">
                      <Ionicons name="exit-outline" size={30} color="#F87171" />
                    </View>
                  </View>
                </MotiView>

                {/* HEADING */}
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 10,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 150,
                  }}
                  className="font-main-bold text-[28px] leading-[34px] text-white"
                >
                  Exit Game?
                </MotiText>

                {/* DESCRIPTION */}
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 10,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 200,
                  }}
                  className="font-main-medium mt-3 text-[16px] leading-[24px] text-white/55"
                >
                  Are you sure you want to quit?
                </MotiText>

                {/* DIVIDER */}
                <View className="my-6 h-px w-full bg-white/[0.08]" />

                {/* CONTINUE */}
                <Pressable
                  onPress={handleCancel}
                  className="mb-3 h-14 w-full items-center justify-center rounded-3xl border border-white/[0.14] bg-white/[0.07]"
                >
                  {({ pressed }) => (
                    <View
                      className={`items-center justify-center ${
                        pressed ? "scale-[0.98] opacity-80" : ""
                      }`}
                    >
                      <Text className="font-main-bold text-[16px] text-white">
                        Continue Playing
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* EXIT */}
                <Pressable
                  onPress={handleConfirm}
                  className="h-14 w-full items-center justify-center rounded-3xl border border-red-300/30 bg-red-500"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: {
                      width: 0,
                      height: 7,
                    },
                    shadowOpacity: 0.4,
                    shadowRadius: 14,
                    elevation: 10,
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`items-center justify-center ${
                        pressed ? "scale-[0.98] opacity-85" : ""
                      }`}
                    >
                      <Text className="font-main-bold text-[16px] text-white">
                        Exit Now
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </BlurView>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
