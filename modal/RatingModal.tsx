import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Text,
  Pressable,
  View,
  Animated,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import * as StoreReview from "expo-store-review"; // Import expo-store-review

import { style } from "@/modal/_styles/ratingModalCSS";
import { CustomRatingModalProps } from "@/types/models/RatingModal";

const CustomRatingModal: React.FC<CustomRatingModalProps> = ({
  visible,
  onClose,
  title,
  description,
}) => {
  const [rating, setRating] = useState(0); // Rating state
  const [comment, setComment] = useState(""); // Comment state
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale value
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity value

  // Animate the modal appearance when visible
  useEffect(() => {
    const animationConfig = {
      useNativeDriver: true,
    };

    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          ...animationConfig,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          ...animationConfig,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          ...animationConfig,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          ...animationConfig,
        }),
      ]).start();
    }
  }, [visible]);

  // Handle the star selection
  const handleRating = (star: number) => {
    setRating(star);
  };

  // Handle submitting the rating
  const handleClose = () => {
    setComment(""); // Reset comment state when submit is clicked
    onClose(); // Close the modal when rating is submitted
    triggerReview(); // Trigger review after submitting the rating
  };

  // Cancel the modal and clear comment
  const handleCancel = () => {
    setComment(""); // Reset comment state when cancel is clicked
    onClose(); // Close the modal
  };

  // Limit comment input to 80 characters
  const handleCommentChange = (text: string) => {
    if (text.length <= 80) {
      setComment(text);
    } else {
      // If the length exceeds 80, only allow the first 80 characters
      setComment(text.substring(0, 80));
    }
  };

  // Function to trigger review prompt or Play Store review section
  const triggerReview = () => {
    if (Platform.OS === "ios") {
      // Trigger review prompt on iOS
      StoreReview.requestReview();
    } else if (Platform.OS === "android") {
      // Redirect Android users to Play Store review section
      const androidPackageName = "com.dheeraj_kumar_yadav.chorpolice"; // Replace with your app's package name
      Linking.openURL(
        `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor={"#000000CC"} />

      <View style={style.modalContainer}>
        <Animated.View
          style={[
            style.modalContent,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Text style={style.modaltitle}>{title}</Text>
          {description && <Text style={style.modalText}>{description}</Text>}

          {/* Rating stars */}
          <View style={style.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <Text
                  style={[
                    style.star,
                    { color: star <= rating ? "gold" : "gray" },
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment TextInput */}
          <TextInput
            style={style.textInput}
            placeholder="Write your feedback (up to 80 characters)"
            value={comment}
            onChangeText={handleCommentChange}
            multiline
          />
          <Text
            style={style.wordCount}
          >{`Characters: ${comment.length}/80`}</Text>

          {/* Action buttons */}
          <View style={style.buttonRow}>
            <Pressable style={style.modalButton} onPress={handleClose}>
              <Text style={style.modalButtonText}>Submit</Text>
            </Pressable>
            <Pressable style={style.modalButton} onPress={handleCancel}>
              <Text style={style.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomRatingModal;
