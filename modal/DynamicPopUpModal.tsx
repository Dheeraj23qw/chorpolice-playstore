import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { videoData, gifData, imageData } from "@/constants/DynamicPopUpData";
import { styles } from "@/modal/_styles/DynamicOverlayPopCSS";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";
import {
  OverlayPopUpProps,
  PlayerData,
} from "@/types/models/DynamicpopUpModal";
import { playSound } from "@/redux/reducers/soundReducer";
import { useDispatch } from "react-redux";

const DynamicOverlayPopUp: React.FC<OverlayPopUpProps> = ({
  isPopUp,
  mediaId,
  mediaType,
  playerData = {} as PlayerData,
  closeVisibleDelay,
}) => {
  const [modalVisible, setModalVisible] = useState(isPopUp);
  const [showCloseText, setShowCloseText] = useState(false);

  // Animation references for main media types
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Additional animations
  const playerDataAnim = useRef(new Animated.Value(0)).current; // for player data
  const closeTextAnim = useRef(new Animated.Value(0)).current; // for close text
  const descriptionAnim = useRef(new Animated.Value(-50)).current; // for description
  const dispatch = useDispatch();
  const getMediaData = (id: number, type: "image" | "video" | "gif") => {
    let data;
    switch (type) {
      case "video":
        data = videoData.find((item) => item.id === id);
        break;
      case "gif":
        data = gifData.find((item) => item.id === id);
        break;
      case "image":
        data = imageData.find((item) => item.id === id);
        break;
      default:
        return null;
    }

    if (!data) {
      console.warn(`No media data found for ID: ${id} and type: ${type}`);
    }

    return data;
  };

  const mediaData = getMediaData(mediaId, mediaType);
  if (!mediaData) return null;

  const { url, description } = mediaData;

  const getSource = (url: string | any) => {
    return typeof url === "string" ? { uri: url } : url;
  };

  const getPlayerImageSource = (image: any, imageType: string) => {
    return imageType === "local" ? image : { uri: image };
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible && mediaType === "gif" && [2, 4, 7].includes(mediaId)) {
      dispatch(playSound("winning"));
    // } else if (
    //   modalVisible &&
    //   mediaType === "gif" &&
    //   [1, 3, 6].includes(mediaId)
    // ) {
    //   dispatch(playSound("lose"));
    }
  }, [modalVisible, mediaType, mediaId, dispatch]);

  // Start animations when modal becomes visible
  useEffect(() => {
    if (modalVisible) {
      // Main content animation based on mediaType
      const mainAnimation =
        mediaType === "image"
          ? Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            })
          : mediaType === "video"
          ? Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true })
          : Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true,
            });

      // Additional animations
      const playerDataAnimation = Animated.timing(playerDataAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      });
      const closeTextBounce = Animated.spring(closeTextAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      });
      const descriptionSlide = Animated.spring(descriptionAnim, {
        toValue: 0,
        useNativeDriver: true,
      });

      // Start all animations together
      Animated.parallel([
        mainAnimation,
        playerDataAnimation,
        closeTextBounce,
        descriptionSlide,
      ]).start();

      // Show "Tap to Close" text after a specific delay
      const timer = setTimeout(() => {
        setShowCloseText(true);
      }, closeVisibleDelay);

      return () => clearTimeout(timer); // Clean up the timeout on unmount
    }
  }, [
    modalVisible,
    mediaType,
    fadeAnim,
    slideAnim,
    scaleAnim,
    playerDataAnim,
    closeTextAnim,
    descriptionAnim,
    closeVisibleDelay,
  ]);

  return (
    <Modal visible={modalVisible} animationType="fade" transparent>
      <StatusBar backgroundColor={"#000000CC"} />

      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.overlay}>
          {/* Player Data Section */}
          {playerData && (
            <Animated.View
              style={[
                chorPoliceQuizstyles.playerInfo,
                { opacity: playerDataAnim },
              ]}
            >
              {playerData.image && (
                <Image
                  source={getPlayerImageSource(
                    playerData.image,
                    playerData.imageType || "uri"
                  )}
                  style={chorPoliceQuizstyles.playerImage}
                />
              )}
              {playerData.name && (
                <Text style={styles.playerNameStyle}>{playerData.name}</Text>
              )}
              {playerData.message && (
                <Text style={styles.playerNameStyle}>{playerData.message}</Text>
              )}
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.container,
              mediaType === "video"
                ? styles.videoContainer
                : styles.defaultContainer,
              mediaType === "image" && { opacity: fadeAnim },
              mediaType === "video" && {
                transform: [{ translateY: slideAnim }],
              },
              mediaType === "gif" && { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Animated.Text
              style={[
                styles.description,
                { transform: [{ translateY: descriptionAnim }] },
              ]}
            >
              {description}
            </Animated.Text>

            {mediaType === "image" || mediaType === "gif" ? (
              <Image
                source={getSource(url)}
                style={styles.media}
                resizeMode="contain"
              />
            ) : mediaType === "video" ? (
              <Video
                source={getSource(url)}
                style={styles.fullMedia}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            ) : null}

            {/* Tap to close text */}
            {showCloseText && (
              <Pressable onPress={closeModal}>
                <Animated.Text
                  style={[
                    styles.closeText,
                    { transform: [{ scale: closeTextAnim }] },
                  ]}
                >
                  Tap to Close
                </Animated.Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DynamicOverlayPopUp;
