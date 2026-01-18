import React, { memo, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Asset } from "expo-asset";
import { styles as globalStyles } from "@/screens/RajaMantriGameScreen/styles";

interface VideoPlayerComponentProps {
  videoIndex: number;
  onVideoEnd: () => void;
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("../../assets/gif/chorPolicescreen/chorpolice.mp4"),
};

const preloadVideos = () => {
  Object.values(VIDEO_SOURCES).forEach((source) => {
    Asset.fromModule(source).downloadAsync();
  });
};
preloadVideos();

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ videoIndex, onVideoEnd }) => {
    const videoSource = VIDEO_SOURCES[videoIndex] || VIDEO_SOURCES[1];

    const player = useVideoPlayer(videoSource, (player) => {
      player.loop = false;
      player.play();
    });

    useEffect(() => {
      const subscription = player.addListener("playToEnd", () => {
        onVideoEnd();
      });

      return () => {
        subscription.remove();
      };
    }, [player, onVideoEnd]);

    return (
      <View style={styles.fullScreenContainer}>
        {/* Added translucent for a better full-screen splash effect */}
        <StatusBar backgroundColor={"transparent"} translucent />

        <VideoView
          player={player}
          style={styles.fullScreenVideo}
          contentFit="contain"
          nativeControls={false}
          surfaceType="textureView" // ✅ Add this workaround
          fullscreenOptions={{ allowsFullscreen: false } as any}
          allowsPictureInPicture={false}
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
