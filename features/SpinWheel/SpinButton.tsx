import React, { memo } from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { SpinButtonProps } from "./types";

const SpinButton = ({ status, onSpin, onClose }: SpinButtonProps) => {
  return (
    <TouchableOpacity
      onPress={status === "DONE" ? onClose : onSpin}
      disabled={status === "SPINNING"}
      activeOpacity={0.9}
      className={`w-full py-5 rounded-[22px] items-center border-b-4 ${
        status === "SPINNING"
          ? "bg-zinc-900 border-zinc-950"
          : status === "DONE"
          ? "bg-white border-zinc-300"
          : "bg-indigo-600 border-indigo-800"
      }`}
    >
      <Text
        className={`font-main-bold text-lg tracking-[2px] ${
          status === "DONE" ? "text-black" : "text-white"
        }`}
      >
        {status === "SPINNING"
          ? "LUCK IN MOTION..."
          : status === "DONE"
          ? "COLLECT REWARD"
          : "SPIN THE WHEEL"}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(SpinButton);
