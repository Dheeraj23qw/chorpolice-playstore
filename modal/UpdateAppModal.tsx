import React from "react";
import { View, Modal, Pressable, Linking } from "react-native";
import { BlurView } from "expo-blur";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { Rocket, Sparkles, X, Check, Zap } from "lucide-react-native";

import { Text } from "@/components/Text";

interface UpdateAppModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateUrl: string;
  latestVersion: string;
  isMandatory?: boolean;
  isOta?: boolean;
  onApplyOta?: () => void;
}

export const UpdateAppModal: React.FC<UpdateAppModalProps> = ({
  isVisible,
  onClose,
  updateUrl,
  latestVersion,
  isMandatory = false,
  isOta = false,
  onApplyOta,
}) => {
  const handleUpdate = async () => {
    if (isOta && onApplyOta) {
      onApplyOta();
      return;
    }
    
    if (!updateUrl) return;

    try {
      await Linking.openURL(updateUrl);
    } catch {
      // Ignore invalid/unavailable update URLs.
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* BACKDROP */}
        <View pointerEvents="none" className="absolute inset-0 bg-black/80" />

        <Pressable className="absolute inset-0" onPress={onClose} />

        <AnimatePresence>
          {isVisible && (
            <MotiView
              from={{
                opacity: 0,
                scale: 0.9,
                translateY: 24,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                translateY: 12,
              }}
              transition={{
                type: "spring",
                damping: 22,
                stiffness: 170,
              }}
              className="w-full max-w-[430px]"
              style={{
                shadowColor: "#8B5CF6",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.25,
                shadowRadius: 32,
                elevation: 25,
              }}
            >
              {/* GLOWING BORDER */}
              <View
                className="overflow-hidden rounded-[40px] border border-violet-400/35 bg-violet-500/[0.05] p-[1px]"
                style={{
                  shadowColor: "#A78BFA",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.45,
                  shadowRadius: 20,
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
                    {/* CLOSE BUTTON */}
                    {!isMandatory && (
                      <Pressable
                        onPress={onClose}
                        className="absolute right-5 top-5 z-20 h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05]"
                      >
                        {({ pressed }) => (
                          <View
                            className={`items-center justify-center ${
                              pressed ? "scale-90 opacity-70" : ""
                            }`}
                          >
                            <X size={18} color="rgba(255,255,255,0.55)" />
                          </View>
                        )}
                      </Pressable>
                    )}

                    {/* ICON */}
                    <MotiView
                      from={{
                        scale: 0,
                        opacity: 0,
                        rotate: "-10deg",
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotate: "0deg",
                      }}
                      transition={{
                        type: "spring",
                        damping: 16,
                        stiffness: 160,
                        delay: 100,
                      }}
                      className="mb-6 self-start"
                      style={{
                        shadowColor: "#8B5CF6",
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                        shadowOpacity: 0.55,
                        shadowRadius: 18,
                        elevation: 12,
                      }}
                    >
                      <View className="rounded-full border border-violet-300/35 bg-violet-500/[0.08] p-[2px]">
                        <View className="h-16 w-16 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/[0.12]">
                          <Rocket size={29} color="#A78BFA" strokeWidth={2.2} />
                        </View>
                      </View>
                    </MotiView>

                    {/* EYEBROW */}
                    <MotiText
                      from={{
                        opacity: 0,
                        translateY: 8,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                      }}
                      transition={{
                        type: "timing",
                        duration: 250,
                        delay: 140,
                      }}
                      className="font-main-bold text-[10px] uppercase tracking-[3px] text-violet-400/70"
                    >
                      New Update
                    </MotiText>

                    {/* TITLE */}
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
                        delay: 170,
                      }}
                      className="mt-2 font-main-bold text-[28px] leading-[34px] text-white"
                    >
                      New Version Available!
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
                        delay: 210,
                      }}
                      className="font-main-medium mt-3 text-[15px] leading-[23px] text-white/50"
                    >
                      Update now for the latest features, improvements, and a
                      smoother multiplayer experience.
                    </MotiText>

                    {/* DIVIDER */}
                    <View className="my-6 h-px w-full bg-white/[0.08]" />

                    {/* VERSION CARD */}
                    <MotiView
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
                        duration: 350,
                        delay: 250,
                      }}
                    >
                      <View
                        className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] px-4 py-4"
                        style={{
                          shadowColor: "#FBBF24",
                          shadowOffset: {
                            width: 0,
                            height: 0,
                          },
                          shadowOpacity: 0.1,
                          shadowRadius: 12,
                          elevation: 4,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          {/* LEFT */}
                          <View className="flex-row items-center">
                            <View className="h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/[0.10]">
                              <Sparkles size={19} color="#FBBF24" />
                            </View>

                            <View className="ml-3">
                              <Text className="font-main-bold text-[11px] uppercase tracking-[1.5px] text-white/45">
                                Latest Version
                              </Text>

                              <Text className="font-main-medium mt-1 text-[11px] text-white/35">
                                Ready to install
                              </Text>
                            </View>
                          </View>

                          {/* VERSION */}
                          <Text className="font-main-bold text-[21px] text-amber-400">
                            v{latestVersion}
                          </Text>
                        </View>
                      </View>
                    </MotiView>

                    {/* FEATURES */}
                    <MotiView
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
                        duration: 350,
                        delay: 300,
                      }}
                      className="mt-4"
                    >
                      <View className="flex-row items-center">
                        <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-500/[0.10]">
                          <Check size={15} color="#A78BFA" strokeWidth={2.5} />
                        </View>

                        <Text className="font-main-medium ml-3 text-[12px] text-white/45">
                          Improved stability & performance
                        </Text>
                      </View>

                      <View className="mt-2 flex-row items-center">
                        <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-500/[0.10]">
                          <Zap size={15} color="#A78BFA" strokeWidth={2.5} />
                        </View>

                        <Text className="font-main-medium ml-3 text-[12px] text-white/45">
                          Better multiplayer experience
                        </Text>
                      </View>
                    </MotiView>

                    {/* UPDATE BUTTON */}
                    <Pressable
                      onPress={handleUpdate}
                      className="mt-6 h-14 w-full items-center justify-center rounded-3xl border border-violet-300/30 bg-violet-600"
                      style={({ pressed }) => [
                        {
                          shadowColor: "#8B5CF6",
                          shadowOffset: {
                            width: 0,
                            height: 7,
                          },
                          shadowOpacity: 0.42,
                          shadowRadius: 15,
                          elevation: 10,
                        },
                        pressed && {
                          transform: [{ scale: 0.98 }],
                          opacity: 0.88,
                        },
                      ]}
                    >
                      <View className="flex-row items-center">
                        <Rocket size={18} color="white" strokeWidth={2.4} />

                        <Text className="ml-2 font-main-bold text-[14px] uppercase tracking-[2.5px] text-white">
                          {isOta ? "Restart Now" : "Update Now"}
                        </Text>
                      </View>
                    </Pressable>

                    {/* MAYBE LATER */}
                    {!isMandatory && (
                      <Pressable
                        onPress={onClose}
                        className="mt-4 self-center px-5 py-2"
                      >
                        {({ pressed }) => (
                          <Text
                            className={`text-[12px] uppercase tracking-[2px] ${
                              pressed ? "text-white/70" : "text-white/35"
                            }`}
                          >
                            Maybe Later
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                </BlurView>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};
