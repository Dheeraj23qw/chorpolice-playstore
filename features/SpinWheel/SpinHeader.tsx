import React from "react";
import { View } from "react-native";
import { Star } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import {  SpinHeaderProps } from "./types";



const SpinHeader = ({ status, result }: SpinHeaderProps) => {
  return (
    <>
      <View className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6 flex-row items-center">
        <Star size={12} color="#818cf8" fill="#818cf8" />
        <Text className="text-[10px] font-main-bold text-indigo-400 uppercase tracking-[3px] ml-2">
          Imperial Court
        </Text>
      </View>

      <Text
        style={{ fontSize: rf(2.8) }}
        className="text-white font-main-bold text-center tracking-tight"
      >
        {status === "DONE" ? result?.label : "CHOOSE YOUR FATE"}
      </Text>
    </>
  );
};

export default React.memo(SpinHeader);
