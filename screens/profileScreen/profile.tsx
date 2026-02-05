import React from "react";
import { View, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import {
  Edit3,
  Settings,
  MapPin,
  Calendar,
  Star,
  Mail,
  ChevronRight,
  ShieldCheck,
  ArrowRightLeft,
  Crown
} from "lucide-react-native";

import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

export default function ProfileScreen() {
  const isLoggedIn = true;

  return (
    <ScreenWrapper
      title="Profile"
      variant="dark"
      subtitle={isLoggedIn ? "Elite Level 14" : "Join the Arena"}
      rightAction={
        isLoggedIn ? (
          <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Settings size={20} color="#F8FAFC" />
          </TouchableOpacity>
        ) : null
      }
    >
      <View className="flex-1 bg-slate-950 px-5">
        {!isLoggedIn ? <LoggedOutView /> : <LoggedInView />}
      </View>
    </ScreenWrapper>
  );
}

function LoggedInView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12 pt-4">
      
      {/* ================= Profile Header (Premium Layering) ================= */}
      <View className="relative overflow-hidden rounded-[48px] bg-slate-900 border border-white/5 p-8 shadow-2xl">
        {/* Decorative Glows */}
        <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <View className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <View className="items-center">
          <View className="relative">
            {/* Outer Glow Ring */}
            <View className="absolute -inset-1 rounded-[48px] border-2 border-indigo-500/50 blur-sm" />
            
            <View className="h-32 w-32 items-center justify-center rounded-[44px] bg-slate-800 border-2 border-slate-700 shadow-2xl">
              <Text className="text-6xl">👤</Text>
            </View>

            <TouchableOpacity className="absolute -bottom-1 -right-1 rounded-2xl bg-indigo-600 p-2.5 border-[3px] border-slate-900 shadow-xl">
              <Edit3 size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View className="mt-6 items-center">
            <View className="flex-row items-center space-x-2">
              <Text className="text-2xl font-main-bold text-white">Alex Rivera</Text>
              <Crown size={18} color="#fbbf24" />
            </View>
            <Text className="mt-1 text-sm font-main-md text-slate-500 tracking-tight">@arivera_pro</Text>
          </View>

          <View className="mt-5 flex-row items-center rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
            <ShieldCheck size={14} color="#10b981" />
            <Text className="ml-2 text-[10px] font-main-bold text-emerald-400 tracking-[1.5px] uppercase">
              Identity Verified
            </Text>
          </View>
        </View>
      </View>

      {/* ================= Stats (Glassmorphism) ================= */}
      <View className="mt-4 flex-row justify-between rounded-[32px] bg-indigo-600/90 p-7 border border-indigo-400/30">
        <StatItem label="Friends" value="1.2k" />
        <View className="w-[1px] h-8 bg-white/20 self-center" />
        <StatItem label="Awards" value="48" />
        <View className="w-[1px] h-8 bg-white/20 self-center" />
        <StatItem label="Rating" value="9.4" />
      </View>

      {/* ================= Detailed Info Section ================= */}
      <View className="mt-8 space-y-4">
        <Text className="px-2 text-[12px] font-main-bold text-slate-500 uppercase tracking-[2px]">
          Personal Dossier
        </Text>

        <View className="rounded-[32px] bg-slate-900 border border-white/5 p-6 space-y-6">
          <View>
            <Text className="text-xs font-main-bold text-indigo-400 mb-2 uppercase tracking-tighter">Bio</Text>
            <Text className="leading-6 font-main-md text-slate-300">
              Product designer by day, competitive gamer by night. I don't just play games; I master the mechanics. 🚀
            </Text>
          </View>

          <View className="h-[1px] bg-white/5" />

          <View className="space-y-4">
             <InfoRow icon={<MapPin size={18} color="#818cf8" />} text="Tokyo, Japan" />
             <InfoRow icon={<Calendar size={18} color="#818cf8" />} text="Seasoned Oct 2023" />
             <InfoRow icon={<ArrowRightLeft size={18} color="#818cf8" />} text="Public Profile Visible" />
          </View>
        </View>
      </View>

      {/* ================= Logout (Tinted Glass) ================= */}
      <TouchableOpacity 
        activeOpacity={0.7}
        className="mt-8 mb-6 h-16 flex-row items-center justify-center rounded-[24px] bg-rose-500/5 border border-rose-500/20 shadow-sm"
      >
        <Text className="text-rose-500 font-main-bold tracking-wide">Secure Logout</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

/* ===================== COMPONENTS ========================= */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-main-bold text-white">{value}</Text>
      <Text className="mt-1 text-[9px] font-main-bold uppercase tracking-[2px] text-indigo-100/60">
        {label}
      </Text>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 border border-white/5 mr-4">
            {icon}
        </View>
        <Text className="text-sm font-main-md text-slate-300">{text}</Text>
      </View>
      <ChevronRight size={14} color="#475569" />
    </View>
  );
}

function LoggedOutView() {
  return (
    <View className="mt-10 overflow-hidden rounded-[48px] bg-slate-900 border border-white/5 p-10">
      <View className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-600/10 blur-3xl rounded-full" />
      
      <View className="items-center">
        <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-slate-800 border border-white/10 shadow-2xl">
          <Text className="text-5xl">🏆</Text>
        </View>

        <Text className="mt-8 text-3xl font-main-bold text-white text-center">Ready to Play?</Text>
        <Text className="mt-3 text-center text-sm font-main-md text-slate-400 px-4 leading-6">
          Sign in to secure your rewards, track progress across devices, and join the global leaderboard.
        </Text>

        <TouchableOpacity className="mt-10 w-full flex-row items-center justify-center space-x-3 rounded-[28px] bg-white py-5 shadow-2xl shadow-white/10">
          <Mail size={20} color="#0f172a" strokeWidth={2.5} />
          <Text className="text-base font-main-bold text-slate-900">Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-6 py-2">
          <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-[3px]">Guest Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}