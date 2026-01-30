import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Edit3,
  Settings,
  MapPin,
  Calendar,
  Star,
  Mail,
} from "lucide-react-native";

import ScreenWrapper from "@/components/screenwrapper";

type StatProps = {
  value: string;
  label: string;
};

type InfoRowProps = {
  icon: React.ReactNode;
  text: string;
};

export default function ProfileScreen() {
  // 🔐 Replace this later with real auth state
  const isLoggedIn = false;

  return (
    <ScreenWrapper
      title="Profile"
      rightAction={
        isLoggedIn ? (
          <TouchableOpacity className="rounded-xl bg-slate-100 p-2">
            <Settings size={20} color="#0f172a" />
          </TouchableOpacity>
        ) : null
      }
    >
      {!isLoggedIn ? <LoggedOutView /> : <LoggedInView />}
    </ScreenWrapper>
  );
}

/* ========================================================= */
/* ===================== LOGGED OUT UI ===================== */
/* ========================================================= */

function LoggedOutView() {
  return (
    <View className="mt-10 items-center rounded-3xl bg-white p-8 shadow-lg border border-slate-100">
      <Text className="text-5xl">👋</Text>

      <Text className="mt-4 text-2xl font-black text-slate-900">
        Welcome Player
      </Text>

      <Text className="mt-2 text-center text-sm text-slate-500">
        Login to sync your awards, coins, progress and unlock cloud backup.
      </Text>

      {/* Google Login */}
      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-8 w-full flex-row items-center justify-center gap-x-3 rounded-2xl bg-indigo-600 py-4 shadow-lg"
      >
        <Mail size={20} color="white" />
        <Text className="text-base font-bold text-white">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Guest hint */}
      <Text className="mt-4 text-xs text-slate-400">
        You can continue offline without login.
      </Text>
    </View>
  );
}

/* ========================================================= */
/* ===================== LOGGED IN UI ======================= */
/* ========================================================= */

function LoggedInView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Avatar Card */}
      <View className="mt-2 items-center rounded-[32px] bg-white p-8 shadow-xl border border-slate-100">
        <View className="relative">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-indigo-100 border-4 border-white shadow-lg">
            <Text className="text-5xl">👤</Text>
          </View>

          <TouchableOpacity className="absolute bottom-1 right-1 rounded-full bg-indigo-600 p-2.5 shadow-lg">
            <Edit3 size={16} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="mt-5 text-2xl font-black text-slate-900">
          Alex Rivera
        </Text>

        <Text className="mt-1 text-sm font-medium text-slate-500">
          @arivera_pro
        </Text>

        <View className="mt-4 flex-row items-center rounded-full bg-indigo-50 px-4 py-1.5">
          <Star size={14} color="#6366f1" />
          <Text className="ml-2 text-xs font-bold text-indigo-600">
            PRO MEMBER
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="mt-6 flex-row justify-between rounded-[28px] bg-white p-6 shadow-lg border border-slate-100">
        <Stat label="Friends" value="1.2k" />
        <Divider />
        <Stat label="Awards" value="48" />
        <Divider />
        <Stat label="Rating" value="9.4" />
      </View>

      {/* About */}
      <View className="mt-8">
        <Text className="mb-3 text-lg font-black text-slate-900">
          About Me
        </Text>

        <View className="rounded-2xl bg-white p-5 shadow-md border border-slate-100">
          <Text className="leading-6 text-slate-600">
            Product designer by day, competitive gamer by night 🚀
          </Text>
        </View>
      </View>

      {/* Meta Info */}
      <View className="mt-6 mb-6 space-y-4 rounded-2xl bg-white p-5 shadow-md border border-slate-100">
        <InfoRow
          icon={<MapPin size={18} color="#64748b" />}
          text="Tokyo, Japan"
        />
        <InfoRow
          icon={<Calendar size={18} color="#64748b" />}
          text="Joined March 2023"
        />
      </View>
    </ScrollView>
  );
}

/* ========================================================= */
/* ===================== COMPONENTS ========================= */
/* ========================================================= */

function Stat({ value, label }: StatProps) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xl font-black text-slate-900">{value}</Text>
      <Text className="mt-1 text-xs font-medium text-slate-400">
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="mx-2 w-[1px] bg-slate-100" />;
}

function InfoRow({ icon, text }: InfoRowProps) {
  return (
    <View className="flex-row items-center">
      {icon}
      <Text className="ml-3 text-sm font-medium text-slate-500">
        {text}
      </Text>
    </View>
  );
}
