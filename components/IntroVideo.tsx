import React, { memo, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Asset } from "expo-asset";

interface VideoPlayerComponentProps {
  videoIndex: number;
  onVideoEnd: () => void;
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
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
      <View className="flex-1 bg-white">
     

        <VideoView
          player={player}
          style={{ flex: 1 }}
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



export default VideoPlayerComponent;