import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Hammer, Construction,  ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { rf } from "@/utils/responsive";
import { Text } from "@/components/Text";

export default function FeaturePendingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#020205] items-center justify-center px-6">
      {/* --- HUD Background Element --- */}
      <View className="absolute top-20 opacity-10">
        <Construction size={300} color="#818cf8" />
      </View>

      {/* --- Main Glass Card --- */}
      <View className="w-full rounded-[40px] bg-[#08080a] p-8 border-t-[1.5px] border-l-[1px] border-white/20 shadow-2xl shadow-indigo-500/20">
        
        {/* Pulsing Icon Container */}
        <View className="items-center mb-6">
          <View className="bg-indigo-500/10 p-6 rounded-full border border-indigo-500/30">
            <Hammer size={48} color="#818cf8" strokeWidth={1.5} />
          </View>
          
          {/* Status Badge */}
          <View className="mt-4 bg-indigo-500/20 px-4 py-1 rounded-full border border-indigo-500/40">
            <Text className="text-[10px] font-main-bold text-indigo-400 uppercase tracking-[3px]">
              System Update In Progress
            </Text>
          </View>
        </View>

        {/* Text Content */}
        <Text
          style={{ fontSize: rf(2.4) }}
          className="text-white font-main-bold uppercase text-center tracking-tighter"
        >
          Feature Encrypted
        </Text>

        <Text className="mt-4 text-center text-white/50 leading-6 font-main-md">
          Our team is continuously working on this module to ensure a seamless
          experience.
        </Text>

        {/* --- Deployment Slab --- */}
        <View className="mt-8 bg-white/[0.03] rounded-3xl p-5 border border-white/10 items-center">
          <Text className="text-[10px] font-main-bold text-white/30 uppercase tracking-[4px] mb-2">
            Estimated Deployment
          </Text>
          <View className="flex-row items-center">
            <Text
              style={{ fontSize: rf(2) }}
              className="text-white font-main-bold"
            >
                 15 MARCH 2026
            </Text>
          </View>
        </View>

        <Text className="mt-6 text-center text-[11px] font-main-bold text-indigo-400/60 uppercase tracking-widest">
          Thanks for your patience, Traveler
        </Text>
      </View>

      {/* --- Back to Safety Button --- */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.8}
        className="mt-10 flex-row items-center bg-[#08080a] px-8 py-4 rounded-2xl border-t border-l border-white/10"
      >
        <ChevronLeft size={20} color="#818cf8" />
        <Text className="ml-2 text-white font-main-bold uppercase tracking-widest text-[12px]">
          Return to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}