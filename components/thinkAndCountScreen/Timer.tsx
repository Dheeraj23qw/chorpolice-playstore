import React, { memo } from "react";
import { View, Text } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";

interface TimerProps {
  countdown: number;
}

const Timer: React.FC<TimerProps> = ({ countdown }) => {
  const danger = countdown <= 5;
  const warning = countdown <= 10 && countdown > 5;

  // Dynamic Tailwind Mappings
  const accentText = danger ? "text-red-500" : warning ? "text-amber-500" : "text-indigo-500";
  const accentBorder = danger ? "border-red-500" : warning ? "border-amber-500" : "border-indigo-500";
  const glowBg = danger ? "bg-red-500" : warning ? "bg-amber-500" : "bg-indigo-500";
  const labelText = danger ? "text-red-400" : "text-amber-400";
  const badgeBg = danger ? "bg-red-500/20" : "bg-amber-500/20";

  return (
    <View style={{ height: hp(15) }} className="items-center justify-center">
      
      {/* 1. Ambient Glow */}
      <View 
        style={{ width: wp(35), height: wp(35) }}
        className={`absolute rounded-full blur-3xl ${glowBg} ${danger ? "opacity-25" : "opacity-10"}`}
      />

      {/* 2. Main Outer Shell */}
      <View 
        style={{ width: wp(26), height: wp(26) }}
        className="items-center justify-center rounded-full bg-[#0d0d0f]/90 border border-white/10 shadow-2xl"
      >
        
        {/* 3. The Tech Ring (Dashed) */}
        <View 
          style={{ width: wp(22), height: wp(22) }}
          className={`rounded-full items-center justify-center border-2 border-dashed opacity-70 ${accentBorder}`}
        >
          
          {/* 4. Content Area */}
          <View className="items-center justify-center">
            <Text 
              style={{ fontSize: rf(1) }} 
              className={`font-bold uppercase tracking-[2px] mb-[-2px] opacity-80 ${accentText}`}
            >
              Time
            </Text>
            
            <Text 
              style={{ fontSize: rf(4.8), lineHeight: rf(5.5) }} 
              className="font-black text-white tabular-nums shadow-black"
            >
              {countdown}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Warning Label */}
      <View className="absolute -bottom-2 items-center justify-center w-full">
        {(danger || warning) && (
          <View className={`px-4 py-1.5 rounded-full border border-white/10 ${badgeBg}`}>
            <Text 
              style={{ fontSize: rf(1.2) }} 
              className={`font-black uppercase tracking-[2px] ${labelText}`}
            >
              {danger ? "• Critical •" : "Warning"}
            </Text>
          </View>
        )}
      </View>
      
    </View>
  );
};

export default memo(Timer);