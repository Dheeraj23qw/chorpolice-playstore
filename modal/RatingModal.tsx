import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CustomRatingModalProps } from "@/types/models/RatingModal";
import { styles } from "./_styles/ratingModalCSS";
// --- IMPORT YOUR UTILS ---
import { handleAppReview } from "@/utils/reviewHelper";
const CustomRatingModal: React.FC<CustomRatingModalProps> = ({
  visible,
  onClose,
  title = "Do you like the game?",
  description = "Please give us a star rating to help us improve!",
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    await handleAppReview({
      rating,
      comment,
      onComplete: onClose,
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.modalBox}
        >
          <View style={styles.accentLine} />

          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 40 }}>⭐</Text>
          </View>

          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.descText}>{description}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => setRating(num)}
                activeOpacity={0.6}
                style={{ marginHorizontal: 6 }}
              >
                <Text
                  style={[
                    styles.starIcon,
                    { color: num <= rating ? "#818cf8" : "#1e293b" },
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Write a message (Optional)"
              placeholderTextColor="#475569"
              value={comment}
              onChangeText={setComment}
              style={styles.textInput}
              multiline
            />
          </View>

          <View style={{ width: "100%" }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === 0}
              activeOpacity={0.8}
              style={[
                styles.submitBtn,
                { backgroundColor: rating === 0 ? "#1e293b" : "#4f46e5" },
              ]}
            >
              <Text style={styles.submitBtnText}>Submit Rating</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
              <Text style={styles.laterBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomRatingModal;
