import React from "react";
import { View } from "react-native";

const BackgroundOrbs = () => {
  return (
    <>
      {/* Main Top Left */}
      <View className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />

      {/* Bottom Right */}
      <View className="absolute bottom-40 -right-20 w-72 h-72 rounded-full bg-blue-600/5 blur-3xl" />

      {/* New Medium Bubble - Top Right */}
      <View className="absolute top-32 -right-10 w-56 h-56 rounded-full bg-indigo-600/10 blur-3xl" />

      {/* Small Bubble - Center Left */}
      <View className="absolute top-1/2 -left-10 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Small Bubble - Bottom Center */}
      <View className="absolute bottom-20 left-1/3 w-44 h-44 rounded-full bg-indigo-600/5 blur-3xl" />

      {/* Tiny Accent Bubble */}
      <View className="absolute top-1/4 right-1/3 w-28 h-28 rounded-full bg-blue-600/10 blur-3xl" />
    </>
  );
};

export default React.memo(BackgroundOrbs);
