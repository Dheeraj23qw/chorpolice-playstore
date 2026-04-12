import React, { memo, useEffect, useRef } from "react";
import { View, InteractionManager } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Asset } from "expo-asset";

interface VideoPlayerComponentProps {
  videoIndex: number;
  onVideoEnd: () => void;
}

const VIDEO_SOURCES: Record<number, any> = {
  1: require("@/assets/gif/chorPolicescreen/chorpolice.mp4"),
};

/**
 * WHY removed module-scope preloadVideos():
 * It was calling Asset.downloadAsync() at IMPORT time — before the app even rendered.
 * This blocks the JS thread during boot, causing the splash screen to hang
 * and the first video frame to freeze.
 *
 * Now the video plays directly from the bundled asset (which is already
 * available on disk after install), so no preload is needed.
 */

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = memo(
  ({ videoIndex, onVideoEnd }) => {
    const videoSource = VIDEO_SOURCES[videoIndex] || VIDEO_SOURCES[1];
    const hasEnded = useRef(false);

    const player = useVideoPlayer(videoSource, (p) => {
      p.loop = false;
      p.play();

      p.addListener("playToEnd", () => {
        // Guard: prevent double-fire which can cause double navigation
        if (hasEnded.current) return;
        hasEnded.current = true;
        onVideoEnd();
      });
    });

    return (
      <View className="flex-1 bg-black">
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit="cover"
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
