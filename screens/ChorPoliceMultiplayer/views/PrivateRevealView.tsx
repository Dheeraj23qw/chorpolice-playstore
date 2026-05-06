import React, { useEffect, memo } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { MotiView, MotiText } from "moti";
import { BlurView } from "expo-blur";
import { rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

const { width } = Dimensions.get("window");

interface PrivateRevealViewProps {
  role: string | null;
}

const roleData: Record<string, { title: string; color: string; icon: any; subtitle: string }> = {
  King: {
    title: "YOU ARE KING",
    color: "#FACC15", // Gold
    icon: require("@/assets/images/chorsipahi/king.webp"),
    subtitle: "Rule with justice. Your life is in the Police's hands.",
  },
  Police: {
    title: "YOU ARE POLICE",
    color: "#3B82F6", // Blue
    icon: require("@/assets/images/chorsipahi/police.webp"),
    subtitle: "Investigate carefully. Find the Thief to win points.",
  },
  Thief: {
    title: "YOU ARE THIEF",
    color: "#EF4444", // Red
    icon: require("@/assets/images/chorsipahi/thief.webp"),
    subtitle: "Blend in. If you remain hidden, you win the round.",
  },
  Advisor: {
    title: "YOU ARE ADVISOR",
    color: "#10B981", // Green
    icon: require("@/assets/images/chorsipahi/advisor.webp"),
    subtitle: "The King trusts you. Keep the secret safe.",
  },
};

const PrivateRevealView = ({ role }: PrivateRevealViewProps) => {
  const data = role ? roleData[role] : null;

  if (!data) return null;

  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}
        style={StyleSheet.absoluteFill}
      >
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0.8, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 12, delay: 200 }}
        className="w-[85%] items-center overflow-hidden rounded-[40px] border border-white/20 bg-white/5 p-8 shadow-2xl"
      >
        <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
        
        {/* Glow effect based on role */}
        <View 
            style={{ backgroundColor: data.color }}
            className="absolute -top-20 h-40 w-40 rounded-full blur-[60px] opacity-20" 
        />

        <MotiView
          from={{ rotateY: "90deg", opacity: 0 }}
          animate={{ rotateY: "0deg", opacity: 1 }}
          transition={{ type: "timing", duration: 800, delay: 400 }}
          className="aspect-[3/4] w-full items-center justify-center rounded-[30px] border border-white/10 bg-black/40 shadow-2xl"
        >
          <Image
            source={data.icon}
            style={{ width: "80%", height: "80%" }}
            resizeMode="contain"
          />
          
          <View className="absolute bottom-6 rounded-full border border-white/20 bg-black/60 px-6 py-2">
             <Text style={{ color: data.color }} className="font-main-bold text-sm uppercase tracking-[4px]">
                {role}
             </Text>
          </View>
        </MotiView>

        <View className="mt-8 items-center">
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 1000 }}
            style={{ fontSize: rf(2.5), color: data.color }}
            className="font-main-bold text-center uppercase tracking-widest"
          >
            {data.title}
          </MotiText>
          
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1200 }}
            className="mt-2 text-center font-main text-xs italic text-white"
          >
            {data.subtitle}
          </MotiText>
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1500 }}
          className="mt-10 rounded-full border border-white/10 bg-white/5 px-4 py-2"
        >
          <Text className="font-main text-[10px] uppercase tracking-widest text-white/40">
            Keep it secret • Only you can see this
          </Text>
        </MotiView>
      </MotiView>
    </View>
  );
};

export default memo(PrivateRevealView);
