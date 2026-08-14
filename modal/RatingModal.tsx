import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, MotiText } from "moti";
import { useDispatch } from "react-redux";

import { CustomRatingModalProps } from "@/types/models/RatingModal";
import { handleAppReview } from "@/utils/reviewHelper";
import { TextInput } from "@/components/Input";
import { Text } from "@/components/Text";
import { generateSmartReview } from "@/utils/handleAppReview";
import { closeModalUI, openModalUI } from "@/redux/reducers/uiStateSlice";

/* ============================================================
   CONSTANTS
============================================================ */

const CARD_MAX_WIDTH = 430;
const CARD_HORIZONTAL_MARGIN = 24;

const REVIEW_INPUT_HEIGHT = 112;

const KEYBOARD_COMPACT_DELAY = 40;

/* ============================================================
   STAR BUTTON
============================================================ */

interface StarButtonProps {
  index: number;
  rating: number;
  onPress: (value: number) => void;
}

const StarButton: React.FC<StarButtonProps> = ({ index, rating, onPress }) => {
  const isActive = index <= rating;

  return (
    <Pressable
      onPress={() => onPress(index)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`${index} star${index > 1 ? "s" : ""}`}
      accessibilityState={{
        selected: isActive,
      }}
      className="mx-1.5"
    >
      <MotiText
        animate={{
          scale: isActive ? 1.35 : 1,
        }}
        transition={{
          type: "spring",
          damping: 14,
          stiffness: 180,
        }}
        className="text-5xl"
        style={{
          color: isActive ? "#6366f1" : "#1e293b",
          textShadowColor: isActive ? "rgba(99, 102, 241, 0.9)" : "transparent",
          textShadowRadius: isActive ? 18 : 0,
        }}
      >
        ★
      </MotiText>
    </Pressable>
  );
};

/* ============================================================
   MAIN MODAL
============================================================ */

const CustomRatingModal: React.FC<CustomRatingModalProps> = ({
  visible,
  onClose,
  title = "Enjoying the game?",
  description = "Your feedback helps us create a better experience!",
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isKeyboardTransitioning, setIsKeyboardTransitioning] = useState(false);

  /* ==========================================================
     DEVICE
  ========================================================== */

  const screenHeight = Dimensions.get("window").height;

  /*
   * Keep enough space for the compact modal even on smaller
   * Android devices.
   */
  const compactCardMaxHeight = Math.min(
    390,
    screenHeight - insets.top - insets.bottom - 32,
  );

  /* ==========================================================
     MODAL UI STATE
  ========================================================== */

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

  /* ==========================================================
     RESET STATE
  ========================================================== */

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
      setIsSubmitting(false);
      setIsKeyboardVisible(false);
      setIsKeyboardTransitioning(false);
    }
  }, [visible]);

  /* ==========================================================
     KEYBOARD HANDLING
  ========================================================== */

  useEffect(() => {
    if (!visible) return;

    let compactTimer: ReturnType<typeof setTimeout> | undefined;
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;

    const handleKeyboardShow = () => {
      setIsKeyboardTransitioning(true);

      if (compactTimer) {
        clearTimeout(compactTimer);
      }

      compactTimer = setTimeout(() => {
        setIsKeyboardVisible(true);
        setIsKeyboardTransitioning(false);
      }, KEYBOARD_COMPACT_DELAY);
    };

    const handleKeyboardHide = () => {
      setIsKeyboardTransitioning(true);

      if (restoreTimer) {
        clearTimeout(restoreTimer);
      }

      restoreTimer = setTimeout(() => {
        setIsKeyboardVisible(false);
        setIsKeyboardTransitioning(false);
      }, 80);
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(
      showEvent,
      handleKeyboardShow,
    );

    const hideSubscription = Keyboard.addListener(
      hideEvent,
      handleKeyboardHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();

      if (compactTimer) {
        clearTimeout(compactTimer);
      }

      if (restoreTimer) {
        clearTimeout(restoreTimer);
      }
    };
  }, [visible]);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    Keyboard.dismiss();
    onClose();
  }, [isSubmitting, onClose]);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      Keyboard.dismiss();

      await handleAppReview({
        rating,
        comment: comment.trim(),
        onComplete: () => {
          onSuccess?.();
          onClose();
        },
      });
    } catch (error) {
      console.warn("Rating submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, isSubmitting, onSuccess, onClose]);

  /* ==========================================================
     STAR PRESS
  ========================================================== */

  const handleStarPress = useCallback((value: number) => {
    setRating((previousRating) => {
      const nextRating = previousRating === value ? 0 : value;

      /*
       * Only automatically generate a review for positive
       * ratings.
       */
      if (nextRating >= 4) {
        setComment(generateSmartReview(nextRating));
      } else {
        setComment("");
      }

      return nextRating;
    });
  }, []);

  /* ==========================================================
     GENERATE ANOTHER
  ========================================================== */

  const handleGenerateAnother = useCallback(() => {
    if (rating < 4 || isSubmitting) {
      return;
    }

    setComment(generateSmartReview(rating));
  }, [rating, isSubmitting]);

  /* ==========================================================
     DO NOT RENDER
  ========================================================== */

  if (!visible) {
    return null;
  }

  /*
   * Compact mode intentionally hides the unnecessary visual
   * content while the keyboard is open.
   *
   * IMPORTANT:
   * The actual card does NOT scale based on keyboard state.
   * Only its contents change.
   */
  const compactMode = isKeyboardVisible || isKeyboardTransitioning;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* ======================================================
          BACKDROP
      ====================================================== */}

      <View className="absolute inset-0 bg-black/85">
        <Pressable
          className="absolute inset-0"
          onPress={handleClose}
          disabled={isSubmitting}
        />
      </View>

      {/* ======================================================
          KEYBOARD CONTAINER
      ====================================================== */}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        {/*
         * IMPORTANT:
         *
         * No ScrollView here.
         *
         * ScrollView + flex:1 + center alignment was the main
         * reason the card could appear to shrink when the
         * keyboard opened.
         */}

        <View
          className="flex-1 items-center justify-center px-6"
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          }}
        >
          {/* ==================================================
              CARD
          ================================================== */}

          <MotiView
            from={{
              opacity: 0,
              translateY: 30,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              translateY: compactMode ? -4 : 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              translateY: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 150,
            }}
            style={{
              width: "100%",
              maxWidth: CARD_MAX_WIDTH,
              maxHeight: compactMode ? compactCardMaxHeight : undefined,
            }}
            className="overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0f]"
          >
            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <View className="absolute left-1/2 top-0 z-10 h-1.5 w-24 -translate-x-1/2 rounded-b-full bg-indigo-500" />

            {/* =================================================
                CARD CONTENT
            ================================================= */}

            <View
              className="items-center px-8 pt-8"
              style={{
                paddingBottom: Math.max(20, insets.bottom),
              }}
            >
              {/* =================================================
                  HERO ICON
              ================================================= */}

              {!compactMode && (
                <MotiView
                  from={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 14,
                    stiffness: 180,
                    delay: 80,
                  }}
                  className="rounded-[32px] border border-indigo-500/20 bg-indigo-500/10"
                  style={{
                    marginBottom: 20,
                  }}
                >
                  <View className="h-24 w-24 items-center justify-center">
                    <Text className="text-5xl">⭐</Text>
                  </View>
                </MotiView>
              )}

              {/* =================================================
                  TITLE
              ================================================= */}

              <MotiView
                animate={{
                  translateY: compactMode ? -2 : 0,
                }}
                transition={{
                  type: "timing",
                  duration: 180,
                }}
                className="w-full items-center"
              >
                <Text
                  numberOfLines={2}
                  className="text-center font-main-bold text-[26px] text-white"
                >
                  {title}
                </Text>
              </MotiView>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {!compactMode && (
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 6,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 220,
                  }}
                  className="mb-5 mt-3 text-center text-[14px] text-slate-400 opacity-50"
                >
                  {description}
                </MotiText>
              )}

              {/* =================================================
                  STARS
              ================================================= */}

              {!compactMode && (
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 6,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 220,
                  }}
                  className="mb-5 h-16 flex-row items-center justify-center"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <StarButton
                      key={num}
                      index={num}
                      rating={rating}
                      onPress={handleStarPress}
                    />
                  ))}
                </MotiView>
              )}

              {/* =================================================
                  RATING MESSAGE
              ================================================= */}

              {!compactMode && rating > 0 && (
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 6,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "timing",
                    duration: 200,
                  }}
                  className="mb-5 text-center font-main-bold text-sm text-indigo-400"
                >
                  {rating === 5
                    ? "LEGENDARY! 🌟"
                    : rating >= 4
                      ? "AWESOME! 🔥"
                      : rating >= 3
                        ? "GOOD 🙂"
                        : "WE'LL IMPROVE 💪"}
                </MotiText>
              )}

              {/* =================================================
                  REVIEW INPUT
              ================================================= */}

              {rating > 0 && (
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 15,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 18,
                    stiffness: 180,
                  }}
                  style={{
                    width: "100%",
                    marginBottom: compactMode ? 16 : 20,
                  }}
                >
                  <TextInput
                    placeholder={
                      rating <= 2
                        ? "Tell us what went wrong..."
                        : rating === 3
                          ? "How can we improve?"
                          : "Want to add something extra?"
                    }
                    placeholderTextColor="#475569"
                    value={comment}
                    onChangeText={setComment}
                    editable={!isSubmitting}
                    multiline
                    textAlignVertical="top"
                    style={{
                      height: REVIEW_INPUT_HEIGHT,
                      minHeight: REVIEW_INPUT_HEIGHT,
                      maxHeight: REVIEW_INPUT_HEIGHT,
                    }}
                    className="w-full rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white"
                    accessibilityLabel="Review comment"
                    returnKeyType="default"
                  />

                  {/* =================================================
                      GENERATE ANOTHER
                  ================================================= */}

                  {rating >= 4 && !compactMode && (
                    <TouchableOpacity
                      onPress={handleGenerateAnother}
                      disabled={isSubmitting}
                      activeOpacity={0.7}
                      className="mt-2.5 self-end rounded-xl px-2 py-2"
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel="Generate another review"
                    >
                      <View className="flex-row items-center">
                        <Text className="mr-1.5 text-base text-indigo-400">
                          ↻
                        </Text>

                        <Text className="font-main-bold text-xs text-indigo-400">
                          Try another comment
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </MotiView>
              )}

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <View className="w-full gap-y-3 px-1">
                {/* SUBMIT */}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Submit rating"
                  accessibilityState={{
                    disabled: rating === 0 || isSubmitting,
                    busy: isSubmitting,
                  }}
                  className={`min-h-[56px] w-full items-center justify-center rounded-2xl px-6 ${
                    rating === 0 || isSubmitting
                      ? "bg-slate-900/50 opacity-60"
                      : "bg-indigo-600"
                  }`}
                >
                  <Text className="font-main-bold text-[15px] text-white">
                    {isSubmitting ? "Submitting..." : "Submit Rating"}
                  </Text>
                </TouchableOpacity>

                {/* MAYBE LATER */}

                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Maybe later"
                  className="min-h-[44px] w-full items-center justify-center rounded-2xl px-6"
                  hitSlop={6}
                >
                  <Text className="font-main-bold text-xs uppercase tracking-wider text-slate-500">
                    Maybe Later
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

export default CustomRatingModal;
