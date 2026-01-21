import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Settings, RefreshCw, ChevronLeft } from "lucide-react-native";

export default function MaintenanceScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 bg-slate-50 items-center justify-center px-8">
        
        {/* Simple Icon Badge */}
        <Animated.View 
          entering={FadeIn.duration(800)}
          className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-amber-100"
        >
          <Settings size={48} color="#d97706" strokeWidth={1.5} />
        </Animated.View>

        {/* Content */}
        <View className="items-center">
          <Text className="text-2xl font-bold text-slate-900 mb-3">
            System Maintenance
          </Text>
          <Text className="text-center text-slate-500 leading-6 mb-10">
            We're currently fine-tuning this feature to improve your experience. 
            We'll be back online shortly.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-y-3">
          <Pressable 
            className="h-14 w-full flex-row items-center justify-center rounded-2xl bg-slate-900 active:opacity-90"
          >
            <RefreshCw size={18} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Check for Updates</Text>
          </Pressable>

          <Link href="/" asChild>
            <Pressable className="h-14 w-full flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white active:bg-slate-50">
              <ChevronLeft size={18} color="#64748b" />
              <Text className="text-slate-600 font-semibold ml-1">Go Back</Text>
            </Pressable>
          </Link>
        </View>

        {/* Minimal Footer */}
        <Text className="absolute bottom-12 text-xs font-medium uppercase tracking-tighter text-slate-400">
          Estimated downtime: 30 mins
        </Text>
        
      </View>
    </>
  );
}