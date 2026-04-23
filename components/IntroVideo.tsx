import React, { memo, useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
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
    const hasEndedRef = useRef(false);
    const androidVideoViewProps = useMemo(
      () =>
        Platform.OS === "android"
          ? ({ surfaceType: "surfaceView" } as const)
          : {},
      [],
    );

    const player = useVideoPlayer(videoSource, (instance) => {
      instance.loop = false;
      instance.play();
    });

    useEffect(() => {
      hasEndedRef.current = false;
      void assetLoader.preloadBackgroundAssets();

      const subscription = player.addListener("playToEnd", () => {
        if (hasEndedRef.current) {
          return;
        }

        hasEndedRef.current = true;
        onVideoEnd();
      });

      return () => {
        subscription.remove();
        try {
          player.pause();
        } catch {
          // ignore player cleanup errors during fast refresh
        }
      };
    }, [onVideoEnd, player]);

    return (
      <View className="flex-1 bg-white">
        <VideoView
          key={`intro-video-${videoIndex}`}
          player={player}
          style={{ flex: 1 }}
          contentFit="contain"
          nativeControls={false}
          fullscreenOptions={{ allowsFullscreen: false } as any}
          allowsPictureInPicture={false}
          {...androidVideoViewProps}
        />
      </View>
    );
  },
);

VideoPlayerComponent.displayName = "VideoPlayerComponent";

export default VideoPlayerComponent;
