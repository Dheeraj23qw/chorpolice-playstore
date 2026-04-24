import React, { memo, useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoPlayerComponentProps {
  index: number;
  onVideoEnd?: () => void;
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
};

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ index, onVideoEnd }) => {
    // ✅ Stable source resolution
    const videoSource = useMemo(
      () => VIDEO_SOURCES[index] || VIDEO_SOURCES[1],
      [index],
    );

    // ✅ Stable callback ref (prevents effect re-run spam)
    const onVideoEndRef = useRef(onVideoEnd);
    onVideoEndRef.current = onVideoEnd;

    // ✅ Let Expo fully control lifecycle
    const player = useVideoPlayer(videoSource, (instance) => {
      instance.loop = false;
      instance.play();
    });

    // ✅ Safe event subscription (no manual player control)
    useEffect(() => {
      if (!player) return;

      const subscription = player.addListener("playToEnd", () => {
        onVideoEndRef.current?.();
      });

      return () => {
        subscription.remove();
      };
    }, [player]);

    // ✅ Android optimization (stable)
    const androidProps = useMemo(
      () =>
        Platform.OS === "android"
          ? ({ surfaceType: "textureView" } as const)
          : {},
      [],
    );

    return (
      <View className="flex-1 bg-white">
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit="contain"
          nativeControls={false}
          allowsPictureInPicture={false}
          {...androidProps}
        />
      </View>
    );
  },
);

VideoPlayerComponent.displayName = "VideoPlayerComponent";

export default VideoPlayerComponent;
