import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, TouchableOpacity, View, Animated, Easing } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { claimAward } from "@/features/awards/awardsSlice";
import { ACHIEVEMENT_DATA } from "@/constants/achievements";
import { Text } from "@/components/Text";

export default function UnlockedAwardModal() {
  const dispatch = useDispatch();
  const unlocked = useSelector((state: any) => state.awards.unlocked);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unlocked.length > 0) {
      // Entrance "Pop" effect
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Continuous Sunburst Rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [unlocked.length]);

  if (unlocked.length === 0) return null;

  const awardId = unlocked[0];
  const award = ACHIEVEMENT_DATA.find((a) => a.id === awardId);
  if (!award) return null;

  const handleClose = () => {
    // Exit animation before dispatching
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => dispatch(claimAward(awardId)));
  };

  const IconComponent = (LucideIcons as any)[award.iconName] || LucideIcons.Trophy;

  // Dynamic colors for that "Glow"
  const theme = {
    Legendary: { color: "#fcd34d", glow: "shadow-yellow-500/50" },
    Epic: { color: "#c084fc", glow: "shadow-purple-500/50" },
    Rare: { color: "#60a5fa", glow: "shadow-blue-500/50" },
    Common: { color: "#818cf8", glow: "shadow-indigo-500/50" },
  }[award.rarity as string] || { color: "#818cf8", glow: "" };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal transparent visible={true} animationType="none">
      <View className="flex-1 items-center justify-center bg-black/80 p-6">
        
        {/* Animated Container */}
        <Animated.View 
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm items-center"
        >
          {/* BACKGROUND SUNBURST (Arcade rays) */}
          <Animated.View 
            style={{ transform: [{ rotate: spin }] }}
            className="absolute -top-10 h-80 w-80 opacity-20"
          >
             {/* Simple Ray Effect using Borders */}
            <View className="absolute h-full w-full border-[60px] border-dashed border-white/40 rounded-full" />
          </Animated.View>

          {/* MAIN CARD */}
          <View className={`w-full items-center rounded-[40px] border-4 border-white/20 bg-slate-900 p-8 shadow-2xl ${theme.glow}`}>
            
            <View className="absolute -top-12 self-center">
                <View className="rounded-full bg-slate-900 p-2 border-4 border-white/10">
                    <View 
                        style={{ backgroundColor: theme.color }}
                        className="h-24 w-24 items-center justify-center rounded-full shadow-lg"
                    >
                        <IconComponent size={48} color="white" strokeWidth={2.5} />
                    </View>
                </View>
            </View>

            <View className="mt-12 items-center">
              <Text className="text-xs font-main-bold uppercase tracking-widest text-white/50">
                {award.rarity} Unlocked
              </Text>
              
              <Text className="mt-2 text-center text-3xl font-main-bold text-white">
                CONGRATS!
              </Text>

              <View className="my-4 h-[2px] w-12 bg-white/10" />

              <Text style={{ color: theme.color }} className="text-xl font-main-bold text-center">
                {award.title}
              </Text>
              
              <Text className="mt-2 text-center text-slate-400 font-main-md leading-5">
                {award.desc}
              </Text>
            </View>

            {/* HIGH-GLOSS CLAIM BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClose}
              className="mt-8 w-full overflow-hidden rounded-2xl bg-green-500 py-4 shadow-lg shadow-green-500/40"
            >
              <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/20" /> 
              <Text className="text-center text-lg font-main-bold uppercase tracking-tighter text-white">
                Tap to Claim
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-6 text-slate-500 font-main-bold animate-pulse">
            SHINY NEW ITEM!
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}