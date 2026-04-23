import React, { memo, useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoPlayerComponentProps {
  index: number;
  onVideoEnd?: () => void; // Added back as optional for flexibility
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
};

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ index, onVideoEnd }) => {
    // 1. Resolve source based on index
    const videoSource = useMemo(
      () => VIDEO_SOURCES[index] || VIDEO_SOURCES[1],
      [index],
    );

    // Using a Ref for the callback to prevent the Effect from re-running
    // unnecessarily if the parent component re-renders the function.
    const onVideoEndRef = useRef(onVideoEnd);
    onVideoEndRef.current = onVideoEnd;

    // 2. Initialize the player.
    const player = useVideoPlayer(videoSource, (instance) => {
      instance.loop = false;
      instance.play();
    });

    // 3. Handle Lifecycle and Events
    useEffect(() => {
      const subscription = player.addListener("playToEnd", () => {
        onVideoEndRef.current?.();
      });

      return () => {
        subscription.remove(); // Unsubscribe first
        try {
          player.pause();
        } catch {
          // Safe silence for native release
        }
      };
    }, [player]);

    // 4. Android performance tuning
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
          key={`video-view-${index}`}
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
