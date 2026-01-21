import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  CircleDot,
} from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";

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
    color: "bg-emerald-500",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    status: "In Game",
    lastSeen: "2m ago",
    color: "bg-indigo-500",
  },
  {
    id: "3",
    name: "Mike Ross",
    status: "Offline",
    lastSeen: "3h ago",
    color: "bg-slate-300",
  },
];

export default function FriendsScreen() {
  return (
    <ScreenWrapper
      title="Friends"
      subtitle="Connect • Play • Compete"
    >
      {/* 🔍 Search */}
      <View className="mb-5">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100">
          <Search size={18} color="#94a3b8" />
          <Text className="ml-3 text-slate-400 text-sm">
            Search friends...
          </Text>
        </View>
      </View>

      {/* 👥 Friends List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-y-4 pb-6">
          {FRIENDS_DATA.map((friend) => (
            <View
              key={friend.id}
              className="flex-row items-center rounded-2xl bg-white p-4 shadow-md border border-slate-100"
            >
              {/* Avatar */}
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${friend.color}`}
              >
                <Text className="font-black text-white">
                  {friend.name[0]}
                </Text>
              </View>

              {/* Info */}
              <View className="ml-4 flex-1">
                <Text className="font-bold text-slate-900">
                  {friend.name}
                </Text>
                <Text className="mt-0.5 text-xs text-slate-400">
                  {friend.lastSeen}
                </Text>
              </View>

              {/* Status */}
              <View className="items-end gap-y-2">
                <View className="flex-row items-center rounded-full bg-slate-100 px-3 py-1">
                  <CircleDot
                    size={10}
                    color={
                      friend.status === "Online"
                        ? "#10b981"
                        : friend.status === "In Game"
                        ? "#6366f1"
                        : "#94a3b8"
                    }
                  />
                  <Text className="ml-1 text-[10px] font-bold uppercase text-slate-500">
                    {friend.status}
                  </Text>
                </View>

                <TouchableOpacity className="rounded-lg p-1 active:scale-95">
                  <MoreHorizontal size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
