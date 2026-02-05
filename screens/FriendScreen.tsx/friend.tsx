import React from "react";
import { View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  CircleDot,
  MessageSquare,
  Gamepad2,
} from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

type Friend = {
  id: string;
  name: string;
  status: "Online" | "In Game" | "Offline";
  lastSeen: string;
  color: string;
};

const FRIENDS_DATA: Friend[] = [
  {
    id: "1",
    name: "Jordan Smith",
    status: "Online",
    lastSeen: "Active now",
    color: "#10b981", // Emerald
  },
  {
    id: "2",
    name: "Sarah Wilson",
    status: "In Game",
    lastSeen: "In: Chor Police",
    color: "#6366f1", // Indigo
  },
  {
    id: "3",
    name: "Mike Ross",
    status: "Offline",
    lastSeen: "3h ago",
    color: "#64748b", // Slate
  },
];

export default function FriendsScreen() {
  return (
    <ScreenWrapper
      title="Social"
      variant="dark"
      subtitle="Connect • Play • Compete"
      rightAction={
        <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
          <UserPlus size={20} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-slate-950 px-5">
        {/* ================= 🔍 Premium Search Bar ================= */}
        <View className="mb-6 mt-4">
          <View className="flex-row items-center rounded-2xl bg-slate-900 px-5 py-4 border border-slate-800">
            <Search size={18} color="#64748b" />
            <Text className="ml-3 text-slate-500 text-sm font-main-md">
              Find players by name or ID...
            </Text>
          </View>
        </View>

        {/* ================= 👥 Friends List ================= */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
          <Text className="mb-4 px-1 text-[12px] font-main-bold uppercase tracking-[2px] text-slate-500">
            Current Active ({FRIENDS_DATA.length})
          </Text>

          <View className="space-y-4">
            {FRIENDS_DATA.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                activeOpacity={0.7}
                className="flex-row items-center rounded-[32px] bg-slate-900 p-5 border border-slate-800"
              >
                {/* Avatar with Status Ring */}
                <View className="relative">
                  <View 
                    style={{ borderColor: friend.status !== 'Offline' ? friend.color : 'transparent' }}
                    className="h-14 w-14 items-center justify-center rounded-[22px] border-2 bg-slate-800 p-1"
                  >
                    <View 
                        style={{ backgroundColor: friend.color }}
                        className="h-full w-full items-center justify-center rounded-[18px]"
                    >
                        <Text className="text-lg font-main-bold text-white">
                        {friend.name[0]}
                        </Text>
                    </View>
                  </View>
                  {/* Small Pulse Dot for Online */}
                  {friend.status === 'Online' && (
                    <View className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-4 border-slate-900 bg-emerald-500" />
                  )}
                </View>

                {/* Info */}
                <View className="ml-4 flex-1">
                  <Text className="text-base font-main-bold text-white">
                    {friend.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    {friend.status === "In Game" && <Gamepad2 size={12} color="#6366f1" className="mr-1" />}
                    <Text className={`text-[11px] font-main-md ${friend.status === "In Game" ? "text-indigo-400" : "text-slate-500"}`}>
                      {friend.lastSeen}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                     <MessageSquare size={18} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                     <MoreHorizontal size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ================= 🚀 Global Discovery Card ================= */}
          <TouchableOpacity className="mt-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 p-6 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
                <Text className="text-indigo-400 font-main-bold text-lg">Meet New Rivals</Text>
                <Text className="text-indigo-200/60 text-xs font-main-md mt-1">
                    Discover players near your skill level and climb the ranks together.
                </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
                <Search size={20} color="white" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}