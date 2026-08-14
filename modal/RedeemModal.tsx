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
import { LinearGradient } from "expo-linear-gradient";
import { Gift, Sparkles, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/Text";
import { useAppDispatch } from "@/hooks/useAppRedux";
import { updateCoins } from "@/features/wallet/walletSlice";
import { verifyReferralCode, generateNumericCode } from "@/utils/referral";
import { isCodeRedeemed, markCodeAsRedeemed } from "@/storage/redeemedCodesStorage";
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

  const localPlayerId = useSelector((s: RootState) => s.session.localPlayerId);

  const myCode = generateNumericCode(localPlayerId);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef<TextInput>(null);

  const canRedeem = localPlayerId != null;

  /*
   * RESPONSIVE MODAL
   */
  const cardWidth = Math.min(width - 32, 390);

  /*
   * RESPONSIVE 5-DIGIT INPUT
   */
  const digitGap = width < 350 ? 7 : width < 390 ? 9 : 10;

  const digitSize = Math.min(
    54,
    Math.max(44, (cardWidth - 40 - digitGap * (CODE_LENGTH - 1)) / CODE_LENGTH),
  );

  const digitHeight = digitSize * 1.12;

  const isReady =
    code.length === CODE_LENGTH &&
    !isSubmitting &&
    canRedeem;

  /*
   * AUTO FOCUS
   */
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timer);
    } else {
      setCode("");
      setShowSuccess(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
      onClose();
    }, 2200);

    return () => clearTimeout(timer);
  }, [showSuccess, onClose]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  /*
   * REDEEM
   */
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

    /*
     * SELF REFERRAL
     */
    if (inputCode === myCode) {
      setErrorMessage("You cannot redeem your own referral code!");
      setIsSubmitting(false);
      setCode("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }

    /*
     * VALIDATE REFERRAL CODE
     */
    const isValid = verifyReferralCode(inputCode) || inputCode === "ADMIN100";

    if (isValid) {
      if (isCodeRedeemed(inputCode)) {
        setErrorMessage("This code has already been used!");
        setIsSubmitting(false);
        setCode("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return;
      }

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
      {/* FULL-SCREEN BACKDROP - hides background content */}
      <View className="absolute inset-0">
        <Pressable
          className="flex-1"
          onPress={onClose}
        />
        <LinearGradient
          colors={["#080817", "#0B1A17", "#071210"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
          style={{ opacity: 0.85 }}
        />
      </View>

      {/* KEYBOARD-AWARE MODAL */}
      <KeyboardAvoidingView
        className="flex-1 justify-center items-center px-4"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.select({ 
          ios: insets.top + 24, 
          android: insets.bottom + 24 
        })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-1 justify-center items-center"
        >
          <MotiView
            from={{
              opacity: 0,
              scale: 0.92,
              translateY: 5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              translateY: -35,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              translateY: 5,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 180,
            }}
            style={{
              width: cardWidth,
              maxHeight: Math.min(height - insets.top - insets.bottom - 60, 600),
            }}
            className="overflow-hidden rounded-[28px] border border-emerald-400/35 bg-[#0B1A17]"
          >
            {/* SOFT TOP ACCENT */}
            <View className="h-1 w-full bg-emerald-400/70" />

            {/* SUCCESS BANNER */}
            {showSuccess && (
              <MotiView
                from={{ opacity: 0, scale: 0.8, translateY: -20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, translateY: -20 }}
                transition={{ type: "spring", damping: 15, stiffness: 180 }}
                className="mx-5 mt-4 items-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-5 py-5"
              >
                <MotiView
                  from={{ scale: 0, rotate: "-180deg" }}
                  animate={{ scale: 1, rotate: "0deg" }}
                  transition={{ type: "spring", damping: 12, stiffness: 180, delay: 100 }}
                  className="mb-3 h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400/50 bg-emerald-500/30"
                >
                  <Sparkles size={28} color="#6ee7b7" />
                </MotiView>
                <Text className="font-main-bold text-base text-emerald-300 text-center">
                  {successMessage}
                </Text>
                <Text className="mt-1 font-main text-[10px] text-emerald-200/70 text-center">
                  Your coins are ready to use!
                </Text>
              </MotiView>
            )}

            {/* ERROR BANNER */}
            {errorMessage && !showSuccess && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 300 }}
                className="mx-5 mt-4 flex-row items-center rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3"
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20">
                  <AlertCircle size={18} color="#f87171" />
                </View>
                <View className="flex-1">
                  <Text className="font-main-bold text-sm text-red-300">
                    {errorMessage}
                  </Text>
                </View>
              </MotiView>
            )}

            {/* HEADER */}
            <View className="px-5 pt-5 pb-4" style={{ paddingTop: Math.max(16, insets.top * 0.5) }}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <View className="mb-2 flex-row items-center">
                    {/* GIFT ICON */}
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-500/15">
                      <Ionicons name="gift-outline" size={21} color="#6ee7b7" />
                    </View>

                    {/* TITLE */}
                    <View>
                      <Text className="font-main-bold text-lg text-white">
                        Redeem Code
                      </Text>

                      <Text className="mt-0.5 font-main text-[10px] uppercase tracking-[1.5px] text-emerald-200/50">
                        Referral reward
                      </Text>
                    </View>
                  </View>
                </View>

                {/* CLOSE */}
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.8}
                  className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color="rgba(255,255,255,0.75)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CONTENT */}
            <View className="px-5 pb-6" style={{ paddingBottom: Math.max(20, insets.bottom) }}>
              {/* INPUT LABEL */}
               <Text className="mb-3 font-main-bold text-[10px] uppercase tracking-[1.5px] text-white/45">
                  Enter friend's 5-digit referral code
                </Text>

              {/* 5 DIGIT INPUT */}
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
                      <View
                        key={index}
                        style={{
                          width: digitSize,
                          height: digitHeight,
                          borderRadius: 13,
                        }}
                        className={`items-center justify-center border ${
                          digit
                            ? "border-emerald-300/50 bg-emerald-400/20"
                            : isCurrent
                              ? "border-emerald-300/45 bg-emerald-500/15"
                              : "border-white/[0.10] bg-white/[0.035]"
                        }`}
                      >
                        {/* DIGIT */}
                        {digit ? (
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
                              stiffness: 220,
                            }}
                          >
                            <Text className="font-main-bold text-xl text-emerald-100">
                              {digit}
                            </Text>
                          </MotiView>
                        ) : isCurrent ? (
                          /* CURSOR */
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
                      </View>
                    );
                  })}
                </View>

                {/* HIDDEN INPUT */}
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={(value) => {
                    setCode(value.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
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

              {/* CLAIM BUTTON */}
              <Pressable
                onPress={() => {
                  if (!isReady || isSubmitting) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleRedeem();
                }}
                disabled={!isReady}
                className="h-14 w-full overflow-hidden rounded-2xl"
                style={{
                  shadowColor: isReady ? "#10b981" : "transparent",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isReady ? 0.4 : 0,
                  shadowRadius: 16,
                  elevation: isReady ? 10 : 0,
                }}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed && isReady ? 0.97 : 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="h-full w-full overflow-hidden rounded-2xl"
                  >
                     {isReady ? (
                       <View className="h-full w-full flex-row items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/40 bg-emerald-600">
                         <View className="h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/25">
                           <Gift size={18} color="#6ee7b7" />
                         </View>
                         <Text className="ml-3 font-main-bold text-sm uppercase tracking-[2px] text-emerald-50">
                           {isSubmitting ? "Verifying..." : "Claim 100,000 Coins"}
                         </Text>
                       </View>
                     ) : (
                       <View className="h-full w-full flex-row items-center justify-center border border-white/10 bg-white/[0.06]">
                         <Ionicons
                           name="lock-closed"
                           size={18}
                           color="#66677D"
                         />
                         <Text className="ml-2.5 font-main-bold text-sm uppercase tracking-[1.5px] text-white/35">
                           {canRedeem ? "Enter Code Above" : "Profile Required"}
                         </Text>
                       </View>
                     )}
                  </MotiView>
                )}
              </Pressable>

              {/* FOOTER */}
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
    </Modal>
  );
};
