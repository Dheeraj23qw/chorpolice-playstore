import React, { memo } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp, rf } from "@/utils/responsive";

interface ResultInfoProps {
  Correct: number;
  Total: number;
  Message: string;
  coinsMessage: string;
  isWinner: boolean;
}

export const ResultInfo: React.FC<ResultInfoProps> = memo(
  ({ Correct, Total, Message, coinsMessage, isWinner }) => {
    return (
      <View className="items-center px-8 pt-6">
        
        {/* --- 1. Top Achievement Badge (Replaces Image) --- */}
        <View style={{ marginBottom: hp(4) }} className="items-center justify-center">
          {/* Outer Glow Orb */}
          <View 
            style={{ 
              width: wp(45), 
              height: wp(45), 
              backgroundColor: isWinner ? '#10b981' : '#ef4444',
              opacity: 0.15 
            }} 
            className="absolute rounded-full blur-3xl" 
          />

          {/* Decorative Ring */}
          <View 
            style={{ width: wp(35), height: wp(35) }}
            className={`rounded-full border-2 items-center justify-center ${isWinner ? 'border-emerald-500/30' : 'border-red-500/30'}`}
          >
             {/* Inner Solid Circle */}
             <View 
              style={{ width: wp(28), height: wp(28) }}
              className={`rounded-full items-center justify-center bg-[#121212] border border-white/10 shadow-2xl`}
            >
              <Ionicons 
                name={isWinner ? "trophy-outline" : "close-circle-outline"} 
                size={rf(8)} 
                color={isWinner ? "#10b981" : "#ef4444"} 
              />
            </View>
          </View>
        </View>

        {/* --- 2. Title Section --- */}
        <Text 
          style={{ fontSize: rf(1.4) }}
          className="text-white/40 font-bold tracking-[4px] uppercase mb-1"
        >
          Session Ended
        </Text>

        <Text
          style={{ fontSize: rf(4.8) }}
          className={`font-black tracking-tighter text-center ${isWinner ? "text-emerald-400" : "text-red-500"}`}
        >
          {isWinner ? "VICTORY" : "DEFEAT"}
        </Text>

        {/* --- 3. Glassmorphism Score Card --- */}
        <View 
          style={{ marginTop: hp(3), width: wp(86), padding: wp(1) }}
          className="rounded-[32px] bg-white/5 border border-white/10"
        >
          <View style={{ padding: wp(6) }} className="bg-[#121212]/50 rounded-[30px] items-center">
            <View className="flex-row items-center justify-center w-full">
               <View className="h-[1px] flex-1 bg-white/10" />
               <Text style={{ fontSize: rf(1.4) }} className="mx-4 text-white/30 font-bold tracking-widest uppercase">
                 Scorecard
               </Text>
               <View className="h-[1px] flex-1 bg-white/10" />
            </View>
            
            <View className="flex-row items-baseline mt-4">
              <Text style={{ fontSize: rf(7) }} className="font-black text-white">
                {Correct}
              </Text>
              <Text style={{ fontSize: rf(3) }} className="font-bold text-white/20 ml-2">
                / {Total}
              </Text>
            </View>

            <Text style={{ fontSize: rf(1.8) }} className="text-center text-slate-400 mt-2 italic">
              "{Message}"
            </Text>
          </View>
        </View>

        {/* --- 4. Reward Pill --- */}
        {!!coinsMessage && (
          <View 
            style={{ marginTop: hp(3), paddingHorizontal: wp(6), paddingVertical: hp(1.2) }}
            className="rounded-full bg-yellow-400/10 border border-yellow-400/30 flex-row items-center"
          >
            <Ionicons name="sparkles" size={rf(1.8)} color="#facc15" className="mr-2" />
            <Text style={{ fontSize: rf(1.6) }} className="font-bold text-yellow-400 ml-2">
              {coinsMessage}
            </Text>
          </View>
        )}

      </View>
    );
  },
);