import React, { useEffect, useState } from "react";
import { Modal, View, TouchableOpacity, Pressable, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, MotiText } from "moti";

import { CustomRatingModalProps } from "@/types/models/RatingModal";
import { handleAppReview } from "@/utils/reviewHelper";
import { TextInput } from "@/components/Input";
import { Text } from "@/components/Text";
import { generateSmartReview } from "@/utils/handleAppReview";
import { useDispatch } from "react-redux";
import { closeModalUI, openModalUI } from "@/redux/reducers/uiStateSlice";

/* ================= STAR BUTTON ================= */

interface StarButtonProps {
  index: number;
  rating: number;
  onPress: (value: number) => void;
}

const StarButton: React.FC<StarButtonProps> = ({ index, rating, onPress }) => {
  const isActive = index <= rating;

  return (
    <Pressable onPress={() => onPress(index)} className="mx-1.5" hitSlop={8}>
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

/* ================= MAIN MODAL ================= */

const CustomRatingModal: React.FC<CustomRatingModalProps> = ({
  visible,
  onClose,
  title = "Enjoying the game?",
  description = "Your feedback helps us create a better experience!",
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentKey, setCommentKey] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      dispatch(openModalUI());
    } else {
      dispatch(closeModalUI());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
      setCommentKey(0);
      setIsKeyboardVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (rating === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await handleAppReview({
        rating,
        comment,
        onComplete: () => {
          onSuccess?.();
          setIsSubmitting(false);
          onClose();
        },
      });
    } catch (e) {
      console.warn("Submit failed:", e);
      setIsSubmitting(false);
    }
  };

  /* ================= STAR CLICK ================= */

  const handleStarPress = (value: number) => {
    setRating((prev) => {
      const newRating = prev === value ? 0 : value;

      if (newRating >= 4) {
        setComment(generateSmartReview(newRating));
        setCommentKey((prev) => prev + 1);
      } else {
        setComment("");
      }

      return newRating;
    });
  };

  /* ================= GENERATE ANOTHER ================= */

  const handleGenerateAnother = () => {
    if (rating < 4) return;

    setComment(generateSmartReview(rating));
    setCommentKey((prev) => prev + 1);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade">
      {/* BACKDROP */}
      <View className="absolute inset-0">
        <Pressable
          className="flex-1"
          onPress={onClose}
        />
        <View className="absolute inset-0 bg-black/85" />
      </View>

      {/* KEYBOARD-AWARE MODAL */}
      <KeyboardAvoidingView
        className="flex-1 justify-center items-center px-[6%]"
        behavior="padding"
        keyboardVerticalOffset={Platform.select({ 
          ios: insets.top + 24, 
          android: insets.bottom + 24 
        })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-1 items-center justify-center"
        >
          <MotiView
            from={{
              opacity: 0,
              translateY: 40,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              translateY: 20,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 120,
            }}
            className="w-full overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0f]"
          >
            {/* TOP ACCENT */}
            <View className="absolute left-1/2 top-0 h-1.5 w-24 -translate-x-1/2 rounded-b-full bg-indigo-500" />

            <View className="items-center p-8" style={{ paddingBottom: Math.max(24, insets.bottom) }}>
              {/* ICON */}
              {!isKeyboardVisible && (
                <MotiView
                  from={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    delay: 100,
                  }}
                  className="rounded-[32px] border border-indigo-500/20 bg-indigo-500/10"
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <View className="h-24 w-24 items-center justify-center">
                    <Text className="text-5xl">⭐</Text>
                  </View>
                </MotiView>
              )}

              {/* TITLE */}
              <Text className="text-center font-main-bold text-[26px] text-white">
                {title}
              </Text>

              {!isKeyboardVisible && (
                <MotiText
                  from={{ opacity: 0, translateY: 6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -6 }}
                  transition={{ type: "timing", duration: 250 }}
                  className="mb-6 mt-3 text-center text-[14px] text-slate-400 opacity-50"
                >
                  {description}
                </MotiText>
              )}

              {/* STARS */}
              {!isKeyboardVisible && (
                <MotiView
                  from={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
                  transition={{ type: "timing", duration: 200 }}
                  className="mb-6 h-16 flex-row items-center justify-center"
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

              {/* FEEDBACK TEXT */}
              {rating > 0 && (
                <MotiText
                  from={{
                    opacity: 0,
                    translateY: 6,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  className="mb-6 text-center font-main-bold text-sm text-indigo-400"
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

              {/* INPUT */}
              {rating > 0 && (
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 20,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  style={{
                    marginBottom: 24,
                    width: "100%",
                  }}
                >
                  <TextInput
                    key={commentKey}
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
                    className="min-h-[100px] rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-white"
                    multiline
                    textAlignVertical="top"
                  />

                  {/* GENERATE ANOTHER COMMENT */}
                  {rating >= 4 && (
                    <TouchableOpacity
                      onPress={handleGenerateAnother}
                      activeOpacity={0.7}
                      className="mt-2.5 self-end rounded-xl px-2 py-2"
                      hitSlop={6}
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

              {/* BUTTONS */}
              <View className="w-full gap-y-3 px-1">
                {/* SUBMIT */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  activeOpacity={0.8}
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
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="min-h-[48px] w-full items-center justify-center rounded-2xl px-6"
                  hitSlop={6}
                >
                  <Text className="font-main-bold text-xs uppercase tracking-wider text-slate-500">
                    Maybe Later
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

export default CustomRatingModal;
