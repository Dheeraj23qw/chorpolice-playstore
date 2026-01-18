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
// Import from expo-video
import { VideoView, useVideoPlayer } from "expo-video"; 
import { videoData, gifData, imageData } from "@/constants/DynamicPopUpData";
import { styles } from "@/modal/_styles/DynamicOverlayPopCSS";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";
import { OverlayPopUpProps, PlayerData } from "@/types/models/DynamicpopUpModal";
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
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const playerDataAnim = useRef(new Animated.Value(0)).current;
  const closeTextAnim = useRef(new Animated.Value(0)).current;
  const descriptionAnim = useRef(new Animated.Value(-50)).current;

  // Data Fetching
  const getMediaData = (id: number, type: "image" | "video" | "gif" | null) => {
    const dataMap = { video: videoData, gif: gifData, image: imageData };
    const data = type ? dataMap[type]?.find((item) => item.id === id) : null;
    if (!data && type) console.warn(`No media data found for ID: ${id}`);
    return data;
  };

  const mediaData = getMediaData(mediaId, mediaType);
  if (!mediaData) return null;

  // Setup expo-video player
  // useVideoPlayer handles the source and playback logic
  const player = useVideoPlayer(mediaType === 'video' ? mediaData.url : null, (player) => {
    player.loop = true;
    player.play();
  });

  const closeModal = () => {
    setModalVisible(false);
  };

  // Sound Logic
  useEffect(() => {
    if (modalVisible && mediaType === "gif") {
      if ([2, 4, 7].includes(mediaId)) dispatch(playSound("winning"));
      else if ([1, 3, 6].includes(mediaId)) dispatch(playSound("losing"));
    }
  }, [modalVisible, mediaType, mediaId]);

  // Animation Logic
  useEffect(() => {
    if (modalVisible) {
      const mainAnimation =
        mediaType === "image"
          ? Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true })
          : mediaType === "video"
          ? Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true })
          : Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true });

      Animated.parallel([
        mainAnimation,
        Animated.timing(playerDataAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(closeTextAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.spring(descriptionAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => setShowCloseText(true), closeVisibleDelay);
      return () => clearTimeout(timer);
    }
  }, [modalVisible, mediaType]);

  return (
    <Modal visible={modalVisible} animationType="fade" transparent>
      <StatusBar backgroundColor={"#000000CC"} />
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.overlay}>
          {/* Player Info */}
          <Animated.View style={[chorPoliceQuizstyles.playerInfo, { opacity: playerDataAnim }]}>
            {playerData.image && (
              <Image 
                source={typeof playerData.image === 'string' ? { uri: playerData.image } : playerData.image} 
                style={chorPoliceQuizstyles.playerImage} 
              />
            )}
            <Text style={styles.playerNameStyle}>{playerData.name || playerData.message}</Text>
          </Animated.View>

          {/* Media Container */}
          <Animated.View
            style={[
              styles.container,
              mediaType === "video" ? styles.videoContainer : styles.defaultContainer,
              mediaType === "image" && { opacity: fadeAnim },
              mediaType === "video" && { transform: [{ translateY: slideAnim }] },
              mediaType === "gif" && { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Animated.Text style={[styles.description, { transform: [{ translateY: descriptionAnim }] }]}>
              {mediaData.description}
            </Animated.Text>

            {mediaType === "video" ? (
              <VideoView
                player={player}
                style={styles.fullMedia}
                contentFit="contain"
                nativeControls={false}
                surfaceType="textureView" // ✅ Add this workaround
                fullscreenOptions={{ allowsFullscreen: false } as any}
                allowsPictureInPicture={false}
              />
            ) : (
              <Image
                source={typeof mediaData.url === 'string' ? { uri: mediaData.url } : mediaData.url}
                style={styles.media}
                resizeMode="contain"
              />
            )}

            {showCloseText && (
              <Pressable onPress={closeModal}>
                <Animated.Text style={[styles.closeText, { transform: [{ scale: closeTextAnim }] }]}>
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