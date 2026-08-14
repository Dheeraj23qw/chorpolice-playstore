import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { setPermissionReminderSuppressed } from "@/storage/appStorage";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onGrant: () => void;
  onContinue: () => void;
}

export const PermissionReminderModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onGrant,
  onContinue,
}) => {
  const { width, height } = useWindowDimensions();

  const [isProcessing, setIsProcessing] = useState(false);

  const cardWidth = Math.min(width - 32, 390);

  const handleGrant = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    onGrant();
  }, [isProcessing, onGrant]);

  const handleContinue = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    onContinue();
  }, [isProcessing, onContinue]);

  const handleNeverAsk = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      await setPermissionReminderSuppressed(true);
    } catch (error) {
      console.warn(
        "[PermissionReminderModal] Failed to suppress reminder:",
        error,
      );
    }

    onContinue();
  }, [isProcessing, onContinue]);

  useEffect(() => {
    if (!isVisible) {
      setIsProcessing(false);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* =========================================================
          BACKDROP
      ========================================================= */}

      <View className="flex-1 items-center justify-center">
        <BlurView intensity={22} tint="dark" className="absolute inset-0" />

        <View className="absolute inset-0 bg-[#05050B]/80" />

        {/* Tap outside to close */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* =======================================================
            MODAL CARD
        ======================================================= */}

        <AnimatePresence>
          {isVisible && (
            <MotiView
              from={{
                opacity: 0,
                scale: 0.92,
                translateY: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                translateY: 12,
              }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 180,
                mass: 0.8,
              }}
              style={{
                width: cardWidth,
                maxHeight: Math.min(height - 40, 620),
              }}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0A12]"
            >
              {/* =================================================
                  TOP ACCENT
              ================================================= */}

              <View className="h-1 w-full bg-indigo-500/80" />

              {/* =================================================
                  HEADER / CONTENT
              ================================================= */}

              <View className="items-center px-6 pb-6 pt-7">
                {/* =================================================
                    ICON
                ================================================= */}

                <MotiView
                  from={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 13,
                    stiffness: 190,
                    delay: 80,
                  }}
                  className="mb-5 h-[78px] w-[78px] items-center justify-center rounded-[26px] border border-amber-400/20 bg-amber-500/10"
                >
                  <View className="h-[58px] w-[58px] items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10">
                    <MaterialCommunityIcons
                      name="wifi-lock"
                      size={30}
                      color="#fbbf24"
                    />
                  </View>
                </MotiView>

                {/* =================================================
                    EYEBROW
                ================================================= */}

                <Text className="mb-1.5 font-main-bold text-[10px] uppercase tracking-[2px] text-amber-300/60">
                  Multiplayer setup
                </Text>

                {/* =================================================
                    TITLE
                ================================================= */}

                <Text className="text-center font-main-bold text-[25px] leading-[31px] text-white">
                  Host Multiplayer?
                </Text>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <Text className="mt-2.5 max-w-[335px] text-center font-main-md text-[13px] leading-[19px] text-white/45">
                  To host a game and play with friends, we need location and
                  nearby device permissions to find people on your WiFi.
                </Text>

                {/* =================================================
                    PERMISSION INFO
                ================================================= */}

                <View className="mt-5 w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                      <MaterialCommunityIcons
                        name="access-point-network"
                        size={19}
                        color="#818cf8"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="font-main-bold text-[12px] text-white/80">
                        Required for hosting
                      </Text>

                      <Text className="mt-0.5 font-main-md text-[10px] leading-[15px] text-white/35">
                        Used only to discover nearby players.
                      </Text>
                    </View>

                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={19}
                      color="#6ee7b7"
                    />
                  </View>
                </View>

                {/* =================================================
                    SPACE
                ================================================= */}

                <View className="h-5" />

                {/* =================================================
                    GRANT PERMISSIONS
                ================================================= */}

                <Pressable
                  onPress={handleGrant}
                  disabled={isProcessing}
                  className="h-14 w-full overflow-hidden rounded-2xl"
                >
                  {({ pressed }) => (
                    <MotiView
                      animate={{
                        scale: pressed && !isProcessing ? 0.975 : 1,
                      }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 210,
                      }}
                      className={`h-full w-full flex-row items-center justify-center rounded-2xl border ${
                        isProcessing
                          ? "border-indigo-300/20 bg-indigo-600/60"
                          : "border-indigo-400/40 bg-indigo-600"
                      }`}
                    >
                      <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-xl border border-indigo-300/30 bg-indigo-500/30">
                        <MaterialCommunityIcons
                          name={
                            isProcessing ? "loading" : "shield-check-outline"
                          }
                          size={18}
                          color="#c7d2fe"
                        />
                      </View>

                      <Text className="font-main-bold text-[13px] uppercase tracking-[1.7px] text-white">
                        {isProcessing ? "Opening..." : "Grant Permissions"}
                      </Text>
                    </MotiView>
                  )}
                </Pressable>

                {/* =================================================
                    REMIND ME LATER
                ================================================= */}

                <Pressable
                  onPress={handleContinue}
                  disabled={isProcessing}
                  className="mt-2.5 h-14 w-full overflow-hidden rounded-2xl"
                >
                  {({ pressed }) => (
                    <View
                      className={`h-full w-full items-center justify-center rounded-2xl border ${
                        pressed && !isProcessing
                          ? "border-white/[0.12] bg-white/[0.07]"
                          : "border-white/[0.07] bg-white/[0.04]"
                      }`}
                    >
                      <Text className="font-main-bold text-[13px] text-white/65">
                        Remind me later
                      </Text>
                    </View>
                  )}
                </Pressable>

                {/* =================================================
                    DIVIDER
                ================================================= */}

                <View className="mb-1 mt-4 h-px w-10 bg-white/[0.08]" />

                {/* =================================================
                    DON'T ASK AGAIN
                ================================================= */}

                <TouchableOpacity
                  onPress={handleNeverAsk}
                  disabled={isProcessing}
                  activeOpacity={0.65}
                  hitSlop={8}
                  className="h-10 items-center justify-center px-4"
                >
                  <Text className="font-main-bold text-[10px] uppercase tracking-[2.2px] text-white/25">
                    Don't ask again
                  </Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};
