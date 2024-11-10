import React, { memo, useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Asset } from "expo-asset";
import { styles as globalStyles } from "@/screens/RajaMantriGameScreen/styles";

interface VideoPlayerComponentProps {
  videoIndex: number;
  onVideoEnd: () => void;
}

// Define video sources with an index signature
const VIDEO_SOURCES: Record<number, any> = {
  1: require("../../assets/gif/chorPolicescreen/chorpolice.mp4"),
};

// Preload the video assets
const preloadVideos = () => {
  Object.values(VIDEO_SOURCES).forEach((source) => {
    Asset.fromModule(source).downloadAsync();
  });
};
preloadVideos();

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ videoIndex, onVideoEnd }) => {
    const videoRef = useRef<Video>(null);

    useEffect(() => {
      return () => {
        // Unload the video when the component unmounts to free up resources
        videoRef.current?.unloadAsync();
      };
    }, []);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        onVideoEnd();
      }
    };

    // Safeguard against invalid videoIndex
    const videoSource = VIDEO_SOURCES[videoIndex] || VIDEO_SOURCES[1];

    return (
      <View style={styles.fullScreenContainer}>
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.fullScreenVideo}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  fullScreenContainer: globalStyles.fullScreenContainer,
  fullScreenVideo: globalStyles.fullScreenVideo,
});

export default VideoPlayerComponent;
