import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Image,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
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
  const [modalVisible, setModalVisible] = useState(false);
  const [showCloseText, setShowCloseText] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Memoize media data
  const mediaData = useMemo(() => {
    if (!mediaType) return null;

    // Handle each type separately
    if (mediaType === "image") {
      return imageData.find((item) => item.id === mediaId);
    } else if (mediaType === "gif") {
      return gifData.find((item) => item.id === mediaId);
    } else {
      return null; // video is ignored
    }
  }, [mediaType, mediaId]);

  useEffect(() => {
    if (isGameReset) {
      setModalVisible(false);
      setIsReady(false);
      setShowCloseText(false);
      return;
    }

    if (isPopUp && mediaData) {
      setModalVisible(true);

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
      setModalVisible(false);
    }
  }, [isPopUp, isGameReset, mediaData]);

  if (isGameReset || !modalVisible || !mediaData) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View className="flex-1 bg-white items-center justify-center overflow-hidden">
          {/* Glass Shine Decorative Elements */}
          <View className="absolute -top-[10%] -left-[10%] w-[120%] h-[40%] bg-zinc-50 opacity-50 rotate-[-15deg] rounded-[100px]" />
          <View className="absolute top-[20%] -right-[20%] w-[100%] h-[30%] bg-zinc-100/40 rotate-[10deg] rounded-[100px]" />

          {/* Header */}
          <View
            className={`absolute top-24 z-50 flex-row items-center bg-white/90 px-8 py-4 rounded-full border border-zinc-100 shadow-md
              transition-all duration-500 ${isReady ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}
          >
            {playerData.image && (
              <Image
                source={
                  typeof playerData.image === "string"
                    ? { uri: playerData.image }
                    : playerData.image
                }
                className="w-12 h-12 rounded-full border border-zinc-200"
              />
            )}
            <Text className="ml-4 text-zinc-600 font-main-bold text-[16px] uppercase tracking-[1px]">
              {playerData.message}
            </Text>
          </View>

          {/* Media & Description */}
          <View
            className={`items-center justify-center w-full transition-all duration-700 
              ${isReady ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <View className="shadow-2xl shadow-zinc-200">
              <Image
                source={
                  typeof mediaData.url === "string"
                    ? { uri: mediaData.url }
                    : mediaData.url
                }
                style={{ width: width * 0.9, height: height * 0.4 }}
                resizeMode="contain"
              />
            </View>

            <View
              className="mt-4 mx-6 px-6 py-4 bg-white/95 rounded-2xl shadow-md"
              style={{
                elevation: 6, // Android shadow
              }}
            >
              <Text className="text-zinc-900 text-center text-lg font-main-bold uppercase leading-7">
                {mediaData.description}
              </Text>
            </View>
          </View>

          {/* Tap Hint */}
          <View
            className={`absolute bottom-16 transition-opacity duration-1000 ${showCloseText ? "opacity-40" : "opacity-0"}`}
          >
            <Text className="text-zinc-400 font-main-bold tracking-[8px] uppercase text-[9px]">
              Tap to continue
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DynamicOverlayPopUp;
