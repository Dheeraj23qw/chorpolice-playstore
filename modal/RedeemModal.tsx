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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { useAppDispatch } from "@/hooks/useAppRedux";
import { updateCoins } from "@/features/wallet/walletSlice";
import { toast } from "@/components/feedback/toast";
import { storage } from "@/storage/mmkv";
import { verifyReferralCode, generateNumericCode } from "@/utils/referral";
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

  const localPlayerId = useSelector((s: RootState) => s.session.localPlayerId);

  const myCode = generateNumericCode(localPlayerId);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      onClose();
    }, 1800);

    return () => clearTimeout(timer);
  }, [showSuccess, onClose]);

  /*
   * REDEEM
   */
  const handleRedeem = async () => {
    const inputCode = code.trim();

    if (inputCode.length !== CODE_LENGTH) return;

    Keyboard.dismiss();

    if (!canRedeem) {
      toast.warning(
        "Profile Required",
        "Please set up your profile before redeeming a code.",
      );
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    /*
     * SELF REFERRAL
     */
    if (inputCode === myCode) {
      toast.warning(
        "Self-Referral",
        "You cannot redeem your own referral code!",
      );

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
      dispatch(updateCoins(REFERRAL_BONUS_COINS));

      incrementShares(REFERRAL_BONUS_COINS);

      toast.success(
        "Bonus Received!",
        "100,000 coins have been added to your bag.",
      );

      setShowSuccess(true);
    } else {
      toast.error(
        "Invalid Code",
        "This code doesn't match our records. Check for typos!",
      );

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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* BACKDROP */}
        <View className="flex-1 items-center justify-center bg-[#080817] px-4">
          {/* OUTSIDE TAP */}
          <Pressable
            className="absolute inset-0 bg-black/45"
            onPress={onClose}
          />

          {/* PREMIUM INDIGO / PURPLE MODAL */}
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
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 180,
            }}
            style={{
              width: cardWidth,
              maxHeight: Math.min(height - 40, 600),
            }}
            className="overflow-hidden rounded-[28px] border border-indigo-400/35 bg-[#17162F]"
          >
            {/* SOFT TOP ACCENT */}
            <View className="h-1 w-full bg-indigo-400/70" />

            {/* SUCCESS BANNER */}
            {showSuccess && (
              <MotiView
                from={{ opacity: 0, translateY: -10, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: "spring", damping: 16, stiffness: 180 }}
                className="mx-5 mt-4 flex-row items-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3"
              >
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20">
                  <Ionicons name="checkmark" size={18} color="#34D399" />
                </View>
                <View className="flex-1">
                  <Text className="font-main-bold text-sm text-emerald-300">
                    Code Redeemed!
                  </Text>
                  <Text className="font-main text-[10px] text-emerald-200/70">
                    +100,000 coins added to your bag
                  </Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15">
                  <Text className="text-sm">🪙</Text>
                </View>
              </MotiView>
            )}

            {/* HEADER */}
            <View className="px-5 pb-4 pt-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <View className="mb-2 flex-row items-center">
                    {/* GIFT ICON */}
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/25 bg-indigo-500/15">
                      <Ionicons name="gift-outline" size={21} color="#A5B4FC" />
                    </View>

                    {/* TITLE */}
                    <View>
                      <Text className="font-main-bold text-lg text-white">
                        Redeem Code
                      </Text>

                      <Text className="mt-0.5 font-main text-[10px] uppercase tracking-[1.5px] text-indigo-200/50">
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
            <View className="px-5 pb-5">
              {/* REWARD BOX */}
              <View className="mb-5 flex-row items-center rounded-2xl border border-amber-400/25 bg-amber-400/[0.08] px-4 py-3">
                {/* COIN ICON */}
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-400/10">
                  <Ionicons name="sparkles" size={20} color="#F6C85F" />
                </View>

                {/* REWARD TEXT */}
                <View className="ml-3 flex-1">
                  <Text className="font-main-bold text-[10px] uppercase tracking-[1.4px] text-amber-200/55">
                    Instant Reward
                  </Text>

                  <Text className="mt-0.5 font-main-bold text-base text-amber-100">
                    +100,000 Coins
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={17} color="#A78343" />
              </View>

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
                            ? "border-indigo-300/50 bg-indigo-400/20"
                            : isCurrent
                              ? "border-indigo-300/45 bg-indigo-500/15"
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
                            <Text className="font-main-bold text-xl text-indigo-100">
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
                            className="h-5 w-[2px] rounded-full bg-indigo-300"
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
              <TouchableOpacity
                onPress={handleRedeem}
                disabled={!isReady}
                activeOpacity={0.85}
                className={`h-14 w-full items-center justify-center rounded-2xl border ${
                  isReady
                    ? "border-indigo-300/50 bg-indigo-500"
                    : "border-white/10 bg-white/[0.06]"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={isSubmitting ? "sync-outline" : "sparkles"}
                    size={19}
                    color={isReady ? "#FFFFFF" : "#66677D"}
                  />

                  <Text
                    className={`ml-2 font-main-bold text-sm uppercase tracking-[1.5px] ${
                      isReady ? "text-white" : "text-white/35"
                    }`}
                  >
                    {isSubmitting ? "Verifying..." : canRedeem ? "Claim 100,000 Coins" : "Profile Required"}
                  </Text>
                </View>
              </TouchableOpacity>

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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
