import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Bug, Send, Info, AlertTriangle } from "lucide-react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

type BugsScreenProps = {
  navigation?: {
    goBack: () => void;
  };
};

const BugsScreen: React.FC<BugsScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <ScreenWrapper 
      title="Report Bug" 
      variant="dark" 
      subtitle="Help Us Improve the Arena"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerClassName="pb-10 pt-4 px-5 bg-slate-950"
      >
        {/* ================= 🛡️ Status Header Card ================= */}
        <View className="mb-8 flex-row items-center rounded-[32px] bg-amber-500/10 p-5 border border-amber-500/20">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20">
            <AlertTriangle size={24} color="#fbbf24" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-amber-400 font-main-bold text-sm">Experimental Feature</Text>
            <Text className="text-amber-200/60 text-[11px] font-main-md">
              Reports are processed by our dev team within 24 hours.
            </Text>
          </View>
        </View>

        {/* ================= 📝 Form Container ================= */}
        <View className="rounded-[40px] bg-slate-900 p-8 border border-white/5 shadow-2xl">
          
          {/* Issue Title Field */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-[2px]">
                Issue Title
              </Text>
              <Bug size={14} color="#475569" />
            </View>
            
            <View className="rounded-2xl border border-slate-800 bg-slate-950/50 p-1">
              <TextInput
                placeholder="e.g. App crashes on login"
                placeholderTextColor="#475569"
                value={title}
                onChangeText={setTitle}
                className="p-4 text-white font-main-md text-sm"
                selectionColor="#6366f1"
              />
            </View>
          </View>

          {/* Description Field */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-[2px]">
                Detailed Description
              </Text>
              <Info size={14} color="#475569" />
            </View>

            <View className="rounded-2xl border border-slate-800 bg-slate-950/50 p-1">
              <TextInput
                placeholder="Provide as much detail as possible..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                className="h-32 p-4 text-white font-main-md text-sm"
                selectionColor="#6366f1"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-[24px] bg-indigo-600 py-5 shadow-xl shadow-indigo-500/40"
          >
            <Text className="mr-2 text-base font-main-bold text-white">
              Send Report
            </Text>
            <Send size={18} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ================= 💬 Support Footer ================= */}
        <View className="mt-8 items-center">
            <Text className="text-slate-600 text-[11px] font-main-md text-center">
                Attaching device logs automatically...{"\n"}
                System Version: <Text className="text-slate-500">v2.4.1-stable</Text>
            </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default BugsScreen;