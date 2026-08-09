import React, { useEffect, useState } from "react";
import { Modal, View, TouchableOpacity, Pressable } from "react-native";
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
    <Pressable onPress={() => onPress(index)} className="mx-1.5">
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
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    if (visible) {
      dispatch(openModalUI());
    } else {
      dispatch(closeModalUI());
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  /* HANDLE SUBMIT */
  const handleSubmit = async () => {
    if (rating === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await handleAppReview({
        rating,
        comment,
        onComplete: () => {
          setIsSubmitting(false);
          onClose();
        },
      });
    } catch (e) {
      console.warn("Submit failed:", e);
      setIsSubmitting(false);
    }
  };

  /* STAR CLICK */
  const handleStarPress = (value: number) => {
    setRating((prev) => {
      const newRating = prev === value ? 0 : value;

      if (newRating >= 4) {
        setComment(generateSmartReview(newRating));
      } else {
        setComment("");
      }

      return newRating;
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/85 px-[6%]">
        {/* CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 40, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: 20, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 120,
          }}
          className="overflow-hidden rounded-[40px] border border-white/10 bg-[#0a0a0f]"
          style={{ width: "100%", maxWidth: 400, alignItems: "center" }}
        >
          {/* TOP ACCENT */}
          <View className="absolute top-0 h-1.5 w-24 rounded-b-full bg-indigo-500" />

          <View className="p-8">
          {/* ICON */}
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
            className="rounded-[32px] border border-indigo-500/20 bg-indigo-500/10"
            style={{ marginBottom: 24 }}
          >
            <View className="h-24 w-24 items-center justify-center">
              <Text className="text-5xl">⭐</Text>
            </View>
          </MotiView>

          {/* TITLE */}
          <Text className="text-center font-main-bold text-[26px] text-white">
            {title}
          </Text>

          <Text className="mb-6 mt-3 text-center text-[14px] text-slate-400 opacity-50">
            {description}
          </Text>

          {/* STARS */}
          <View className="mb-6 h-16 flex-row">
            {[1, 2, 3, 4, 5].map((num) => (
              <StarButton
                key={num}
                index={num}
                rating={rating}
                onPress={handleStarPress}
              />
            ))}
          </View>

          {/* FEEDBACK TEXT */}
          {rating > 0 && (
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 font-main-bold text-sm text-indigo-400"
            >
              {rating === 5
                ? "LEGENDARY! 🌟"
                : rating >= 4
                  ? "AWESOME! 🔥"
                  : rating >= 3
                    ? "GOOD 🙂"
                    : "WE’LL IMPROVE 💪"}
            </MotiText>
          )}

          {/* INPUT */}
          {rating > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={{ marginBottom: 32, width: "100%" }}
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
                className="min-h-[100px] rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-white"
                multiline
              />
            </MotiView>
          )}

          {/* BUTTONS */}
          <View className="w-full gap-y-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`h-16 items-center justify-center rounded-[22px] ${
                rating === 0 || isSubmitting
                  ? "bg-slate-900/50 opacity-60"
                  : "bg-indigo-600"
              }`}
            >
              <Text className="font-main-bold text-lg text-white">
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="h-12 items-center justify-center"
            >
              <Text className="font-main-bold text-sm uppercase text-slate-500">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

export default CustomRatingModal;
