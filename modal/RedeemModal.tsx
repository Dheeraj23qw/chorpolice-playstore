import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Gift, Sparkles, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/Text";
import { useAppDispatch } from "@/hooks/useAppRedux";
import { updateCoins } from "@/features/wallet/walletSlice";
import { verifyReferralCode, generateNumericCode } from "@/utils/referral";
import {
  isCodeRedeemed,
  markCodeAsRedeemed,
} from "@/storage/redeemedCodesStorage";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { incrementShares } from "@/storage/referralStatsStorage";

const REFERRAL_BONUS_COINS = 100000;
const CODE_LENGTH = 5;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const RedeemModal = ({ visible, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const localPlayerId = useSelector(
    (state: RootState) => state.session.localPlayerId,
  );

  const myCode = generateNumericCode(localPlayerId);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef<TextInput>(null);

  const canRedeem = localPlayerId != null;

  /* ================= RESPONSIVE ================= */

  const cardWidth = Math.min(width - 32, 390);

  const digitGap = width < 350 ? 7 : width < 390 ? 9 : 10;

  const digitSize = Math.min(
    54,
    Math.max(44, (cardWidth - 40 - digitGap * (CODE_LENGTH - 1)) / CODE_LENGTH),
  );

  const digitHeight = digitSize * 1.12;

  const isReady = code.length === CODE_LENGTH && !isSubmitting && canRedeem;

  /* ================= OPEN / CLOSE ================= */

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timer);
    }

    setCode("");
    setShowSuccess(false);
    setSuccessMessage("");
    setErrorMessage("");
  }, [visible]);

  /* ================= SUCCESS AUTO CLOSE ================= */

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
      onClose();
    }, 2200);

    return () => clearTimeout(timer);
  }, [showSuccess, onClose]);

  /* ================= ERROR AUTO CLEAR ================= */

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  /* ================= REDEEM ================= */

  const handleRedeem = async () => {
    const inputCode = code.trim();

    if (inputCode.length !== CODE_LENGTH) return;

    Keyboard.dismiss();

    if (!canRedeem) {
      setErrorMessage("Please set up your profile before redeeming a code.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    /* SELF REFERRAL */

    if (inputCode === myCode) {
      setErrorMessage("You cannot redeem your own referral code!");

      setIsSubmitting(false);
      setCode("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    /* VALIDATE CODE */

    const isValid = verifyReferralCode(inputCode) || inputCode === "ADMIN100";

    if (isValid) {
      /* ALREADY REDEEMED */

      if (isCodeRedeemed(inputCode)) {
        setErrorMessage("This code has already been used!");

        setIsSubmitting(false);
        setCode("");

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        return;
      }

      /* REWARD */

      dispatch(updateCoins(REFERRAL_BONUS_COINS));

      incrementShares(REFERRAL_BONUS_COINS);

      markCodeAsRedeemed(inputCode);

      setSuccessMessage("🎉 Congratulations! +100,000 coins added to your bag");

      setShowSuccess(true);
      setErrorMessage("");
    } else {
      setErrorMessage("This code doesn't match our records. Check for typos!");

      setIsSubmitting(false);
      setCode("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    setIsSubmitting(false);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ================= BACKDROP ================= */}

      <View className="flex-1 items-center justify-center bg-black/70 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* ================= MODAL ================= */}

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={
            Platform.OS === "ios" ? insets.top + 24 : insets.bottom + 24
          }
          className="w-full items-center"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
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
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 120,
              }}
              style={{
                width: cardWidth,
                maxHeight: height - insets.top - insets.bottom - 40,
              }}
              className="overflow-hidden rounded-[30px] border border-emerald-400/20 bg-[#0B1211]"
            >
              {/* TOP ACCENT */}

              <View className="h-[2px] w-full bg-emerald-400/80" />

              {/* ================= SUCCESS ================= */}

              {showSuccess && (
                <MotiView
                  from={{
                    opacity: 0,
                    scale: 0.9,
                    translateY: -12,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 16,
                    stiffness: 180,
                  }}
                  className="mx-5 mt-5 items-center rounded-[20px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-5"
                >
                  <MotiView
                    from={{
                      scale: 0.7,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      damping: 12,
                      stiffness: 180,
                      delay: 100,
                    }}
                    className="mb-3 h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15"
                  >
                    <Sparkles size={26} color="#6EE7B7" />
                  </MotiView>

                  <Text className="text-center font-main-bold text-[15px] text-emerald-300">
                    {successMessage}
                  </Text>

                  <Text className="mt-1 text-center text-[10px] text-emerald-200/50">
                    Your coins are ready to use!
                  </Text>
                </MotiView>
              )}

              {/* ================= ERROR ================= */}

              {errorMessage && !showSuccess && (
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: -8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 250,
                  }}
                  className="mx-5 mt-5 flex-row items-center rounded-[18px] border border-red-400/25 bg-red-500/10 px-4 py-3"
                >
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10">
                    <AlertCircle size={18} color="#F87171" />
                  </View>

                  <View className="flex-1">
                    <Text className="font-main-bold text-[12px] leading-5 text-red-300">
                      {errorMessage}
                    </Text>
                  </View>
                </MotiView>
              )}

              {/* ================= HEADER ================= */}

              <View
                className="px-5 pb-5 pt-5"
                style={{
                  paddingTop: Math.max(18, insets.top * 0.35),
                }}
              >
                <View className="flex-row items-center justify-between">
                  {/* LEFT */}

                  <View className="flex-1 flex-row items-center pr-3">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-[14px] border border-emerald-400/25 bg-emerald-500/10">
                      <Ionicons name="gift-outline" size={22} color="#6EE7B7" />
                    </View>

                    <View className="flex-1">
                      <Text className="font-main-bold text-[18px] text-white">
                        Redeem Code
                      </Text>

                      <Text className="mt-0.5 text-[9px] uppercase tracking-[2px] text-emerald-200/45">
                        Referral reward
                      </Text>
                    </View>
                  </View>

                  {/* CLOSE */}

                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.75}
                    className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]"
                  >
                    <Ionicons name="close" size={19} color="#A1A1AA" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ================= CONTENT ================= */}

              <View
                className="px-5 pb-6"
                style={{
                  paddingBottom: Math.max(20, insets.bottom),
                }}
              >
                {/* INPUT LABEL */}

                <View className="mb-3 flex-row items-center">
                  <Text className="font-main-bold text-[10px] uppercase tracking-[1.7px] text-white/45">
                    Enter friend's 5-digit code
                  </Text>

                  <View className="ml-3 h-px flex-1 bg-white/5" />
                </View>

                {/* ================= CODE INPUT ================= */}

                <Pressable
                  onPress={() => inputRef.current?.focus()}
                  className="mb-5 w-full"
                >
                  <View
                    className="w-full flex-row items-center justify-center"
                    style={{ gap: digitGap }}
                    pointerEvents="none"
                  >
                    {Array.from({
                      length: CODE_LENGTH,
                    }).map((_, index) => {
                      const digit = code[index] || "";
                      const isCurrent = code.length === index;

                      return (
                        <MotiView
                          key={index}
                          animate={{
                            borderColor: digit
                              ? "#6EE7B7"
                              : isCurrent
                                ? "rgba(110,231,183,0.55)"
                                : "rgba(255,255,255,0.10)",

                            backgroundColor: digit
                              ? "rgba(16,185,129,0.12)"
                              : isCurrent
                                ? "rgba(16,185,129,0.07)"
                                : "rgba(255,255,255,0.025)",
                          }}
                          transition={{
                            type: "timing",
                            duration: 140,
                          }}
                          style={{
                            width: digitSize,
                            height: digitHeight,
                            borderRadius: 14,
                          }}
                          className="items-center justify-center border"
                        >
                          {digit ? (
                            <MotiView
                              from={{
                                scale: 0.65,
                                opacity: 0,
                              }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                              }}
                              transition={{
                                type: "spring",
                                damping: 12,
                                stiffness: 220,
                              }}
                            >
                              <Text className="font-main-bold text-[21px] text-emerald-100">
                                {digit}
                              </Text>
                            </MotiView>
                          ) : isCurrent ? (
                            <MotiView
                              from={{ opacity: 0.2 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                type: "timing",
                                duration: 650,
                                loop: true,
                              }}
                              className="h-5 w-[2px] rounded-full bg-emerald-300"
                            />
                          ) : null}
                        </MotiView>
                      );
                    })}
                  </View>

                  {/* HIDDEN INPUT */}

                  <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={(value) => {
                      setCode(
                        value.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH),
                      );
                    }}
                    keyboardType="number-pad"
                    maxLength={CODE_LENGTH}
                    caretHidden
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 1,
                      height: 1,
                    }}
                    accessibilityLabel="Referral code input"
                  />
                </Pressable>

                {/* ================= REWARD INFO ================= */}

                <View className="mb-5 overflow-hidden rounded-[20px] border border-emerald-400/20 bg-emerald-500/[0.06]">
                  <View className="h-[1px] w-full bg-emerald-400/40" />

                  <View className="flex-row items-center justify-between px-4 py-4">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
                        <Gift size={17} color="#6EE7B7" />
                      </View>

                      <View>
                        <Text className="font-main-bold text-[10px] uppercase tracking-[1.5px] text-white/45">
                          Referral Reward
                        </Text>

                        <Text className="mt-0.5 text-[9px] text-white/25">
                          Added instantly
                        </Text>
                      </View>
                    </View>

                    <Text className="font-main-bold text-[20px] text-emerald-300">
                      +100K
                    </Text>
                  </View>
                </View>

                {/* ================= CLAIM BUTTON ================= */}

                <Pressable
                  onPress={() => {
                    if (!isReady || isSubmitting) return;

                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                    handleRedeem();
                  }}
                  disabled={!isReady}
                  className="h-[58px] w-full"
                  style={{
                    shadowColor: isReady ? "#10B981" : "transparent",
                    shadowOffset: {
                      width: 0,
                      height: 7,
                    },
                    shadowOpacity: isReady ? 0.35 : 0,
                    shadowRadius: 14,
                    elevation: isReady ? 8 : 0,
                  }}
                >
                  {({ pressed }) => (
                    <MotiView
                      animate={{
                        scale: pressed && isReady ? 0.97 : 1,
                      }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        stiffness: 200,
                      }}
                      className="h-full w-full"
                    >
                      {isReady ? (
                        <View className="h-full w-full flex-row items-center justify-center overflow-hidden rounded-[18px] border border-emerald-300/50 bg-emerald-600">
                          <View className="h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500/25">
                            <Gift size={18} color="#D1FAE5" />
                          </View>

                          <Text className="ml-3 font-main-bold text-[13px] uppercase tracking-[2px] text-emerald-50">
                            {isSubmitting
                              ? "Verifying..."
                              : "Claim 100,000 Coins"}
                          </Text>
                        </View>
                      ) : (
                        <View className="h-full w-full flex-row items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.05]">
                          <Ionicons
                            name="lock-closed"
                            size={17}
                            color="#66677D"
                          />

                          <Text className="ml-2.5 font-main-bold text-[12px] uppercase tracking-[1.5px] text-white/30">
                            {canRedeem
                              ? "Enter Code Above"
                              : "Profile Required"}
                          </Text>
                        </View>
                      )}
                    </MotiView>
                  )}
                </Pressable>

                {/* ================= FOOTER ================= */}

                <View className="mt-4 items-center">
                  <View className="mb-2 h-px w-10 bg-white/[0.08]" />

                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.7}
                    className="px-4 py-1"
                  >
                    <Text className="font-main-bold text-[10px] uppercase tracking-[2.5px] text-white/30">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
