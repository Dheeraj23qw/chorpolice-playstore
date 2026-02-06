import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { RotateCcw, Zap, Lock } from "lucide-react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface SpinCardProps {
  isEnabled: boolean;
  onPress: () => void;
}

export const SpinToWinCard = ({ isEnabled, onPress }: SpinCardProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!isEnabled}
      activeOpacity={0.85}
      // Toggle border color and opacity based on state
      className={`relative mt-4 mb-10 overflow-hidden rounded-[40px] bg-slate-900 border-2 ${
        isEnabled ? 'border-indigo-500/30' : 'border-slate-800 opacity-60'
      }`}
      style={isEnabled ? {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 15
      } : {}}
    >
      {/* Background Glows - Only visible when enabled */}
      {isEnabled && (
        <>
          <View className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
          <View className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
        </>
      )}
      
      <View className="flex-row items-center justify-between p-6">
        
        {/* Left Side: Content */}
        <View className="z-10 flex-1 pr-4">
          <View className="flex-row items-center mb-1">
            <View className={`h-2 w-2 rounded-full mr-2 ${
              isEnabled ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
            }`} />
            <Text className={`text-[10px] font-main-bold uppercase tracking-[3px] ${
              isEnabled ? 'text-indigo-300' : 'text-slate-500'
            }`}>
              {isEnabled ? "Daily Bonus" : "Used Today"}
            </Text>
          </View>
          
          <Text style={{ fontSize: rf(2.8) }} className="font-main-bold text-white leading-tight">
            Lucky <Text className={isEnabled ? "text-indigo-400" : "text-slate-500"}>Spin</Text>{"\n"}
            Extreme
          </Text>
          
          {/* Action Button */}
          <View className={`mt-4 flex-row items-center self-start rounded-2xl px-5 py-2.5 ${
            isEnabled ? 'bg-indigo-500 shadow-xl shadow-indigo-500/40' : 'bg-slate-800'
          }`}>
            {isEnabled ? (
              <Zap size={14} color="white" fill="white" className="mr-2" />
            ) : (
              <Lock size={14} color="#64748b" className="mr-2" />
            )}
            <Text className={`text-[11px] font-main-bold uppercase tracking-wider ${
              isEnabled ? 'text-white' : 'text-slate-500'
            }`}>
              {isEnabled ? "Play Now" : "Locked"}
            </Text>
          </View>
        </View>

        {/* Right Side: The Wheel Visual */}
        <View className="relative items-center justify-center">
          {/* Animated Orbit - only spins when enabled */}
          <View 
            className={`absolute h-40 w-40 rounded-full border border-dashed ${
              isEnabled ? 'border-indigo-500/20 animate-spin' : 'border-slate-800'
            }`} 
            style={{ animationDuration: '12s' }} 
          />
          
          <View className={`h-32 w-32 items-center justify-center rounded-full bg-indigo-950 border-[4px] ${
            isEnabled ? 'border-slate-900 shadow-2xl' : 'border-slate-900 grayscale'
          }`}>
            
            {/* Visual Segments */}
            <View className={`absolute inset-0 rounded-full border-[10px] opacity-60 ${
              isEnabled 
                ? 'border-t-indigo-500 border-r-blue-500 border-b-indigo-700 border-l-violet-500' 
                : 'border-slate-800'
            }`} />
            
            <View className="z-20 h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
               <RotateCcw size={22} color={isEnabled ? "white" : "#475569"} strokeWidth={2.5} />
            </View>

            {/* Floating Prizes - Faded when disabled */}
            <View className={`absolute top-2 opacity-${isEnabled ? '100' : '20'}`}><Text className="text-lg">💎</Text></View>
            <View className={`absolute right-2 opacity-${isEnabled ? '100' : '20'}`}><Text className="text-lg">🪙</Text></View>
            <View className={`absolute bottom-2 opacity-${isEnabled ? '100' : '20'}`}><Text className="text-lg">⚡</Text></View>
            <View className={`absolute left-2 opacity-${isEnabled ? '100' : '20'}`}><Text className="text-lg">💰</Text></View>
          </View>
          
          {/* Pointer */}
          <View className={`absolute -top-2 z-30 h-5 w-[6px] rounded-full ${
            isEnabled ? 'bg-indigo-400 shadow-sm shadow-white' : 'bg-slate-700'
          }`} />
        </View>
      </View>
    </TouchableOpacity>
  );
};