import React, { useState } from "react";
import { View, Text, Image, Modal, Pressable } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { videoData, gifData, imageData } from "@/constants/DynamicPopUpData";
import { styles } from "@/modal/_styles/DynamicOverlayPopCSS";
import { chorPoliceQuizstyles } from "@/screens/chorPoliceQuizScreen/quizStyle";

interface PlayerData {
  image?: any; // URL or local image source
  name?: string | null;
  message?: any;
  imageType?: any; // Indicates if image is local or a URI
}

interface OverlayPopUpProps {
  isPopUp: boolean;
  mediaId: number;
  mediaType: "image" | "video" | "gif";
  playerData?: PlayerData; // Optional playerData prop
}

const DynamicOverlayPopUp: React.FC<OverlayPopUpProps> = ({
  isPopUp,
  mediaId,
  mediaType,
  playerData = {} as PlayerData, // Default to an empty object if not provided
}) => {
  const [modalVisible, setModalVisible] = useState(isPopUp);

  const getMediaData = (id: number, type: "image" | "video" | "gif") => {
    switch (type) {
      case "video":
        return videoData.find((item) => item.id === id);
      case "gif":
        return gifData.find((item) => item.id === id);
      case "image":
        return imageData.find((item) => item.id === id);
      default:
        return null;
    }
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
    setModalVisible(false); // Close the modal by setting the state to false
  };

  return (
    <Modal visible={modalVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        {/* Player Data Section */}
        {playerData && (
          <View style={chorPoliceQuizstyles.playerInfo}>
            {playerData?.image && (
              <Image
                source={getPlayerImageSource(
                  playerData.image,
                  playerData.imageType || "uri"
                )}
                style={chorPoliceQuizstyles.playerImage}
              />
            )}
            {playerData?.name && (
              <Text style={chorPoliceQuizstyles.playerName}>
                {playerData.name}
              </Text>
            )}
            {playerData?.message && (
              <Text style={chorPoliceQuizstyles.question}>
                {playerData.message}
              </Text>
            )}
          </View>
        )}
        <View
          style={[
            styles.container,
            mediaType === "video"
              ? styles.videoContainer
              : styles.defaultContainer,
          ]}
        >
          <Text style={styles.description}>{description}</Text>

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
          <Pressable onPress={closeModal}>
            <Text style={styles.closeText}>Tap to Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default DynamicOverlayPopUp;
