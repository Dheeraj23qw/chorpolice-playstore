import React from "react";
import VideoPlayerComponent from "@/components/IntroVideo";

/**
 * Round Transition Video
 */
const RoundVideoView = ({ g }: any) => {
  return <VideoPlayerComponent videoIndex={1} onVideoEnd={g.handleVideoEnd} />;
};

export default RoundVideoView;
