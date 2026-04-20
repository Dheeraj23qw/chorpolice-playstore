import React, { memo, useEffect } from "react";
import { View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

import { assetLoader } from "@/service/assetLoader";

interface VideoPlayerComponentProps {
  videoIndex: number;
  onVideoEnd: () => void;
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
};

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ videoIndex, onVideoEnd }) => {
    const videoSource = VIDEO_SOURCES[videoIndex] || VIDEO_SOURCES[1];

    const player = useVideoPlayer(videoSource, (instance) => {
      instance.loop = false;
      instance.play();
    });

    useEffect(() => {
      void assetLoader.preloadBackgroundAssets();

      const subscription = player.addListener("playToEnd", () => {
        onVideoEnd();
      });

      return () => {
        subscription.remove();
      };
    }, [onVideoEnd, player]);

    return (
      <View className="flex-1 bg-white">
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit="contain"
          nativeControls={false}
          surfaceType="textureView"
          fullscreenOptions={{ allowsFullscreen: false } as any}
          allowsPictureInPicture={false}
        />
      </View>
    );
  },
);

export default VideoPlayerComponent;
