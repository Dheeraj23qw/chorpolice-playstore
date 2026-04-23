import React from "react";
import { View } from "react-native";

import VideoPlayerComponent from "@/components/IntroVideo";

interface VideoScreenProps {
  onComplete: () => void;
}

export default function VideoScreen({ onComplete }: VideoScreenProps) {
  return (
    <View className="flex-1 bg-[#050508]">
      <VideoPlayerComponent index={1} onVideoEnd={onComplete} />
    </View>
  );
}
