import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

interface RenderButtonsProps {
  handleShare: () => void;
  handleHome: () => void;
  toggleModal: () => void;
}

export const RenderButtons: React.FC<RenderButtonsProps> = memo(({
  handleShare,
  handleHome,
  toggleModal,
}) => {
  return (
    <View style={{ marginTop: hp(4), paddingHorizontal: wp(4) }} className="flex-row justify-between">
      
      {/* --- Share Button (Indigo) --- */}
      <ActionButton 
        onPress={handleShare}
        label="Share"
        icon="share-social-outline"
        baseColor="bg-indigo-600"
        borderColor="border-indigo-800"
      />

      {/* --- Home Button (Emerald) --- */}
      <ActionButton 
        onPress={handleHome}
        label="Home"
        icon="home-outline"
        baseColor="bg-emerald-600"
        borderColor="border-emerald-800"
      />

      {/* --- Rate Button (Amber) --- */}
      <ActionButton 
        onPress={toggleModal}
        label="Rate"
        icon="star-outline"
        baseColor="bg-amber-500"
        borderColor="border-amber-700"
      />
      
    </View>
  );
});

/* ======================================================
    Reusable Aesthetic Button Sub-Component
====================================================== */

const ActionButton = ({ onPress, label, icon, baseColor, borderColor }: any) => (
  <Pressable
    onPress={onPress}
    style={{ height: hp(10), marginHorizontal: wp(1.5) }}
    className={`flex-1 rounded-2xl ${baseColor} ${borderColor} border-b-4 active:border-b-0 active:translate-y-[2px] active:scale-95 transition-all overflow-hidden`}
  >
    <View className="flex-1 items-center justify-center relative">
      {/* Top Shine Reflection */}
      <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
      
      {/* Icon Area */}
      <View className="mb-1 bg-white/10 p-2 rounded-full border border-white/10">
        <Ionicons name={icon} size={rf(2.2)} color="white" />
      </View>

      {/* Label */}
      <Text 
        style={{ fontSize: rf(1.4) }} 
        // Swapped font-black for font-main-bold
        className="text-white font-main-bold tracking-[2px] uppercase"
      >
        {label}
      </Text>
    </View>
  </Pressable>
);