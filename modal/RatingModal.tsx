import React, { useEffect, useState } from "react";
import { Modal, View, TouchableOpacity, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  LinearTransition,
  withRepeat,
  useSharedValue,
} from "react-native-reanimated";
import { CustomRatingModalProps } from "@/types/models/RatingModal";
import { handleAppReview } from "@/utils/reviewHelper";
import { TextInput } from "@/components/Input";
import { Text } from "@/components/Text";
import { generateSmartReview } from "@/utils/handleAppReview";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ================= STAR BUTTON COMPONENT ================= */

interface StarButtonProps {
  index: number;
  rating: number;
  onPress: (value: number) => void;
}

const StarButton: React.FC<StarButtonProps> = ({ index, rating, onPress }) => {
  const isActive = index <= rating;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1.35 : 1, {
          damping: 14,
          stiffness: 180,
        }),
      },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(index)}
      style={animatedStyle}
      className="mx-1.5"
    >
      <Text
        className="text-5xl"
        style={{
          color: isActive ? "#6366f1" : "#1e293b", // indigo-500 / slate-800
          textShadowColor: isActive ? "rgba(99, 102, 241, 0.9)" : "transparent",
          textShadowRadius: isActive ? 18 : 0,
        }}
      >
        ★
      </Text>
    </AnimatedPressable>
  );
};

/* ================= MAIN MODAL ================= */

const CustomRatingModal: React.FC<CustomRatingModalProps> = ({
  visible,
  onClose,
  title = "Enjoying the game?",
  description = "Your feedback helps us create a better experience for everyone!",
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  const floating = useSharedValue(0);

  useEffect(() => {
    floating.value = withRepeat(withSpring(-6, { damping: 5 }), -1, true);
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floating.value }],
  }));

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
    } catch (error) {
      console.warn("Submit failed:", error);
      setIsSubmitting(false);
    }
  };
  const handleStarPress = async (value: number) => {
    setRating((prev) => {
      const newRating = prev === value ? 0 : value;

      // 🔥 Auto-fill suggestion only for 4 or 5 stars
      if (newRating === 4 || newRating === 5) {
        setComment(generateSmartReview(newRating));
      } else {
        setComment("");
      }

      return newRating;
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/85 items-center justify-center px-[6%]">
        <Animated.View
         entering={FadeInDown.duration(200)}
layout={LinearTransition.duration(200)}
          className="w-full max-w-[400px] bg-[#0a0a0f] rounded-[40px] border-[1.5px] border-white/10 p-8 items-center overflow-hidden"
        >
          {/* Decorative Glow */}
          <View className="absolute -top-10 w-32 h-10 bg-indigo-600/20 blur-2xl rounded-full" />
          <View className="absolute top-0 w-24 h-1.5 bg-indigo-500 rounded-b-full" />

          {/* Icon */}
          <Animated.View
            entering={ZoomIn.duration(500).springify()}
            className="w-24 h-24 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 items-center justify-center mb-6 shadow-xl shadow-indigo-500/20"
          >
            <Text className="text-5xl">⭐</Text>
          </Animated.View>

          {/* Title */}
          <Text className="text-white text-[26px] font-main-bold text-center leading-9">
            {title}
          </Text>

          <Text className="text-slate-400 text-[14px] font-main-md text-center mt-3 mb-6 px-4 leading-5 opacity-50">
            {description}
          </Text>

          {/* Stars */}
          <View className="flex-row justify-center items-center mb-6 h-16">
            {[1, 2, 3, 4, 5].map((num) => (
              <StarButton
                key={num}
                index={num}
                rating={rating}
                onPress={handleStarPress}
              />
            ))}
          </View>

          {/* Rating Feedback Text */}
          {rating > 0 && (
            <Animated.Text
              entering={FadeIn.duration(250)}
              className="text-indigo-400 text-sm font-main-bold mb-6 tracking-wide"
            >
              {rating === 5
                ? "LEGENDARY! 🌟"
                : rating >= 4
                  ? "AWESOME! 🔥"
                  : rating >= 3
                    ? "GOOD 🙂"
                    : "WE’LL IMPROVE 💪"}
            </Animated.Text>
          )}

          {/* Comment Input */}
          {rating > 0 && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="w-full mb-8"
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
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 text-white font-main-regular min-h-[100px]"
                multiline
                textAlignVertical="top"
              />
              {rating >= 4 && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  className="items-center mt-4"
                >
                  <Animated.Text style={floatingStyle} className="text-lg mb-1">
                    👇
                  </Animated.Text>

                  <Pressable
                    onPress={() => setComment(generateSmartReview(rating))}
                    className="bg-indigo-500/10 border border-indigo-500/30 rounded-full px-5 py-2 flex-row items-center gap-1"
                  >
                    <Text className="text-indigo-400 text-xs font-main-bold tracking-widest uppercase">
                      ✨ Shuffle Suggestion
                    </Text>
                  </Pressable>

                  <Text className="text-[10px] text-indigo-300/60 mt-1">
                    Tap to generate a new review
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {/* Submit Button */}
          <View className="w-full gap-y-3">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              activeOpacity={0.8}
              className={`h-16 rounded-[22px] items-center justify-center shadow-lg ${
                rating === 0 || isSubmitting
                  ? "bg-slate-900/50 border border-white/5 opacity-60"
                  : "bg-indigo-600 shadow-indigo-500/30"
              }`}
            >
              <Text
                className={`text-lg font-main-bold tracking-widest uppercase ${
                  rating === 0 || isSubmitting ? "text-slate-500" : "text-white"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={15}
              className="h-12 items-center justify-center"
            >
              <Text className="text-slate-500 text-sm font-main-bold uppercase opacity-80">
                Maybe  Later
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomRatingModal;
