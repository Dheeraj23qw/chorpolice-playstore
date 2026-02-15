import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import * as LucideIcons from "lucide-react-native"; // Import all icons for lookup
import { Lock, Shield, Star } from "lucide-react-native";
import { Text } from "@/components/Text";

// Updated to match the high-performance AwardItem structure
interface AwardItem {
  id: number;
  status: string;
  rarity: string;
  iconName: string;
  percent: number;
  title: string;
  desc: string;
}

interface AwardCardProps {
  award: AwardItem;
  cardWidth: number;
  rarityStyles: string;
}

const AwardCard = memo(({ award, cardWidth, rarityStyles }: AwardCardProps) => {
  const isLocked = award.status === "locked";
  const isUnlocked = award.status === "unlocked";
  const isCompleted = award.percent === 100;

  // Theme color based on rarity
  const themeColor = useMemo(() => {
    switch (award.rarity) {
      case "Legendary": return "#fbbf24";
      case "Epic": return "#a78bfa";
      case "Rare": return "#60a5fa";
      default: return "#818cf8";
    }
  }, [award.rarity]);

  const IconComponent = (LucideIcons as any)[award.iconName] || LucideIcons.Trophy;

  // Card background changes if completed
  const cardBgColor = isCompleted ? "#1e293b" : isUnlocked ? "#0f172a" : "rgba(15, 23, 42, 0.6)";
  const borderColor = isCompleted ? "border-yellow-400/40" : isUnlocked ? "border-white/10" : "border-white/5";

  return (
    <View
      style={[styles.card, { width: cardWidth, backgroundColor: cardBgColor, shadowColor: isCompleted ? themeColor : "transparent" }]}
      className={`mr-4 rounded-[40px] border p-6 overflow-hidden ${borderColor}`}
    >
      {/* Completed Glow */}
      {isCompleted && (
        <View 
          className="absolute -right-5 -top-5 h-36 w-36 rounded-full opacity-40 animate-pulse" 
          style={{ backgroundColor: themeColor }} 
        />
      )}

      {/* Header: Rarity & Badge */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className={`rounded-full border px-3 py-1.5 flex-row items-center ${rarityStyles}`}>
          {award.rarity === "Legendary" && (
            <Star size={8} color={themeColor} fill={themeColor} className="mr-1" />
          )}
          <Text className="text-[8px] font-main-bold uppercase tracking-[1.5px]">
            {award.rarity}
          </Text>
        </View>

        {isLocked ? (
          <View className="h-6 w-6 rounded-full bg-slate-800 items-center justify-center border border-white/5">
            <Lock size={12} color="#475569" />
          </View>
        ) : (
          <Shield size={16} color={themeColor} strokeWidth={2.5} />
        )}
      </View>

      {/* Main Icon Section */}
      <View className="relative mb-8 h-20 w-20 items-center justify-center self-center">
        {isUnlocked && (
          <>
            <View className="absolute h-16 w-16 rounded-3xl blur-2xl opacity-40" style={{ backgroundColor: themeColor }} />
            {isCompleted && (
              <View className="absolute h-20 w-20 rounded-full border-2 border-yellow-400 animate-pulse" />
            )}
          </>
        )}
        <View
          className={`h-20 w-20 items-center justify-center rounded-[24px] border ${
            isUnlocked ? "bg-slate-800 shadow-inner" : "bg-slate-900 border-white/5"
          }`}
          style={isUnlocked ? { borderColor: `${themeColor}40` } : {}}
        >
          {!isLocked ? (
            <IconComponent size={28} color={isCompleted ? "#facc15" : themeColor} strokeWidth={2.2} />
          ) : (
            <Lock size={28} color="#1e293b" />
          )}
        </View>
      </View>

      {/* Info Section */}
      <View className="items-center">
        <Text numberOfLines={1} className={`text-lg font-main-bold uppercase tracking-tight ${isLocked ? "text-slate-600" : isCompleted ? "text-yellow-400" : "text-white"}`}>
          {isLocked ? "Classified" : award.title}
        </Text>
        <Text numberOfLines={2} className="mt-2 text-center text-xs leading-5 font-main-md text-slate-500 px-2">
          {isLocked ? "Keep playing to reveal this achievement." : isCompleted ? "✅ Completed!" : award.desc}
        </Text>
      </View>

      {/* Progress Section */}
      <View className={`mt-8 p-4 rounded-[24px] border ${isCompleted ? "border-yellow-400 bg-yellow-400/10" : "border-white/5 bg-black/30"}`}>
        <View className="mb-2 flex-row justify-between items-center">
          <Text className="text-[9px] font-main-bold uppercase tracking-widest text-slate-500">
            {isCompleted ? "Completed" : isUnlocked ? "In Progress" : "Locked"}
          </Text>
          <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: isCompleted ? "#fbbf24/20" : `${themeColor}20` }}>
            <Text className="text-[10px] font-main-bold" style={{ color: isCompleted ? "#fbbf24" : themeColor }}>
              {award.percent}%
            </Text>
          </View>
        </View>

        <View className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <View
            style={{
              width: `${award.percent}%`,
              backgroundColor: isCompleted ? "#fbbf24" : themeColor,
              shadowColor: isCompleted ? "#fbbf24" : themeColor,
              shadowRadius: 5,
              shadowOpacity: 0.5
            }}
            className="h-full rounded-full"
          />
        </View>
      </View>
    </View>
  );
});


export default AwardCard;

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5, // for Android shadow performance
  },
});
