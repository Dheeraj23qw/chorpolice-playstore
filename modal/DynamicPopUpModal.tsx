import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Image,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { gifData, imageData } from "@/constants/DynamicPopUpData";
import {
  OverlayPopUpProps,
  PlayerData,
} from "@/types/models/DynamicpopUpModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Text } from "@/components/Text";

const DynamicOverlayPopUp: React.FC<OverlayPopUpProps> = ({
  isPopUp,
  mediaId,
  mediaType,
  playerData = {} as PlayerData,
  closeVisibleDelay,
}) => {
  const { width, height } = useWindowDimensions();

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

  const [showCloseText, setShowCloseText] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const mediaData = useMemo(() => {
    if (!mediaType) return null;

    if (mediaType === "image") {
      return imageData.find((item) => item.id === mediaId);
    }

    if (mediaType === "gif") {
      return gifData.find((item) => item.id === mediaId);
    }

    return null;
  }, [mediaType, mediaId]);

  useEffect(() => {
    if (isGameReset) {
      setIsReady(false);
      setShowCloseText(false);
      return;
    }

    if (isPopUp && mediaData) {
      const readyTimer = setTimeout(() => setIsReady(true), 100);
      const closeTimer = setTimeout(
        () => setShowCloseText(true),
        closeVisibleDelay || 2000,
      );

      return () => {
        clearTimeout(readyTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setIsReady(false);
      setShowCloseText(false);
    }
  }, [isPopUp, isGameReset, mediaData]);

  if (isGameReset || !isPopUp || !mediaData) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 top-0 flex-1 bg-white">
      <View style={styles.container}>
        {/* Decorative Elements */}
        <View style={styles.topGlass} />
        <View style={styles.rightGlass} />

        {/* Header */}
        <View
          style={[
            styles.header,
            {
              opacity: isReady ? 1 : 0,
              transform: [{ translateY: isReady ? 0 : -20 }],
            },
          ]}
        >
          {playerData.image && (
            <Image
              source={
                typeof playerData.image === "string"
                  ? { uri: playerData.image }
                  : playerData.image
              }
              style={styles.avatar}
            />
          )}
          <View style={{ marginLeft: 16, flexShrink: 1 }}>
            {playerData.name ? (
              <Text style={styles.nameText} className="font-main-bold">
                {playerData.name}
              </Text>
            ) : null}
            <Text style={styles.messageText} className="font-main-bold">
              {playerData.message}
            </Text>
          </View>
        </View>

        {/* Media Section */}
        <View
          style={[
            styles.mediaContainer,
            {
              opacity: isReady ? 1 : 0,
              transform: [{ scale: isReady ? 1 : 0.95 }],
            },
          ]}
        >
          <Image
            source={
              typeof mediaData.url === "string"
                ? { uri: mediaData.url }
                : mediaData.url
            }
            style={{ width: width * 0.9, height: height * 0.4 }}
            resizeMode="contain"
          />

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText} className="font-main-bold">
              {mediaData.description}
            </Text>
          </View>
        </View>

        {/* Tap Hint */}
        <View style={[styles.tapHint, { opacity: showCloseText ? 0.4 : 0 }]}>
          <Text style={styles.tapText} className="font-main-bold">
            TAP TO CONTINUE
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DynamicOverlayPopUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  topGlass: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "120%",
    height: "40%",
    backgroundColor: "#f4f4f5",
    opacity: 0.5,
    transform: [{ rotate: "-15deg" }],
    borderRadius: 100,
  },

  rightGlass: {
    position: "absolute",
    top: "20%",
    right: "-20%",
    width: "100%",
    height: "30%",
    backgroundColor: "rgba(244,244,245,0.4)",
    transform: [{ rotate: "10deg" }],
    borderRadius: 100,
  },

  header: {
    position: "absolute",
    top: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    elevation: 5,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },

  nameText: {
    color: "#18181b",
    fontSize: 18,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  messageText: {
    color: "#52525b",
    fontSize: 14,
    textTransform: "uppercase",
  },

  mediaContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  descriptionBox: {
    marginTop: 16,
    marginHorizontal: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    elevation: 6,
  },

  descriptionText: {
    color: "#18181b",
    textAlign: "center",
    fontSize: 18,
    textTransform: "uppercase",
    lineHeight: 26,
  },

  tapHint: {
    position: "absolute",
    bottom: 60,
  },

  tapText: {
    color: "#a1a1aa",
    fontSize: 10,
    letterSpacing: 4,
  },
});
