import React from "react";
import VideoPlayerComponent from "@/components/IntroVideo";
import { View } from "react-native";

/**
 * Round Transition Video
 */
const RoundVideoView = ({ g }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#050508" }}>
      <VideoPlayerComponent index={1} onVideoEnd={g.handleVideoEnd} />
    </View>
  );
};

export default RoundVideoView;
