import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { videoData, gifData, imageData } from "@/constants/DynamicPopUpData";
import { styles } from "@/modal/_styles/DynamicOverlayPopCSS";
import {
  OverlayPopUpProps,
  PlayerData,
} from "@/types/models/DynamicpopUpModal";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/qiuzStyle";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const DynamicOverlayPopUp: React.FC<OverlayPopUpProps> = ({
  isPopUp,
  mediaId,
  mediaType,
  playerData = {} as PlayerData,
  closeVisibleDelay,
}) => {
  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset
  );

  /* ---------------- STATE ---------------- */

  const [modalVisible, setModalVisible] = useState(false);
  const [showCloseText, setShowCloseText] = useState(false);

  /* ---------------- ANIMATIONS ---------------- */

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const playerDataAnim = useRef(new Animated.Value(0)).current;
  const closeTextAnim = useRef(new Animated.Value(0)).current;
  const descriptionAnim = useRef(new Animated.Value(-50)).current;

  /* ---------------- SYNC VISIBILITY ---------------- */

  useEffect(() => {
    if (isGameReset) {
      setModalVisible(false);
      setShowCloseText(false);
      return;
    }

    setModalVisible(isPopUp);
  }, [isPopUp, isGameReset]);

  /* ---------------- MEDIA FETCH ---------------- */

  const getMediaData = (
    id: number,
    type: "image" | "video" | "gif" | null
  ) => {
    const dataMap = { video: videoData, gif: gifData, image: imageData };
    return type ? dataMap[type]?.find((item) => item.id === id) : null;
  };

  const mediaData = getMediaData(mediaId, mediaType);

  /* ---------------- VIDEO PLAYER ---------------- */

  const player = useVideoPlayer(
    !isGameReset && mediaType === "video" && mediaData
      ? mediaData.url
      : null,
    (player) => {
      if (isGameReset) return;
      player.loop = true;
      player.play();
    }
  );

  /* ---------------- ANIMATION EFFECT ---------------- */

  useEffect(() => {
    if (isGameReset) return;
    if (!modalVisible) return;
    if (!mediaData) return;

    const mainAnimation =
      mediaType === "image"
        ? Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        : mediaType === "video"
        ? Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          })
        : Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          });

    Animated.parallel([
      mainAnimation,
      Animated.timing(playerDataAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(closeTextAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(descriptionAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(
      () => setShowCloseText(true),
      closeVisibleDelay
    );

    return () => clearTimeout(timer);
  }, [modalVisible, mediaType, isGameReset, mediaData]);

  /* ---------------- SAFETY RETURN ---------------- */

  if (isGameReset || !modalVisible || !mediaData) return null;

  /* ---------------- UI ---------------- */

  return (
    <Modal visible animationType="fade" transparent>
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          {/* Player Info */}
          <Animated.View
            style={[
              chorPoliceQuizstyles.playerInfo,
              { opacity: playerDataAnim },
            ]}
          >
            {playerData.image && (
              <Image
                source={
                  typeof playerData.image === "string"
                    ? { uri: playerData.image }
                    : playerData.image
                }
                style={chorPoliceQuizstyles.playerImage}
              />
            )}
            <Text style={styles.playerNameStyle}>
              {playerData.name || playerData.message}
            </Text>
          </Animated.View>

          {/* Media Container */}
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
              mediaType === "gif" && {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.description,
                { transform: [{ translateY: descriptionAnim }] },
              ]}
            >
              {mediaData.description}
            </Animated.Text>

            {mediaType === "video" ? (
              <VideoView
                player={player}
                style={styles.fullMedia}
                contentFit="contain"
                nativeControls={false}
                surfaceType="textureView"
                fullscreenOptions={{ allowsFullscreen: false } as any}
                allowsPictureInPicture={false}
              />
            ) : (
              <Image
                source={
                  typeof mediaData.url === "string"
                    ? { uri: mediaData.url }
                    : mediaData.url
                }
                style={styles.media}
                resizeMode="contain"
              />
            )}

            {showCloseText && (
              <Pressable onPress={() => setModalVisible(false)}>
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
