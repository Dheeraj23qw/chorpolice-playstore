import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";
import { Ionicons } from "@expo/vector-icons";
import { MatchReview } from "./MatchReview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PersonalSummaryProps {
  matchHistory: any[];
  isHindi: boolean;
  translateFn: (text: string) => string;
  onViewTable: () => void;
  onFinish: () => void;
}

export const PersonalSummary: React.FC<PersonalSummaryProps> = ({
  matchHistory,
  isHindi,
  translateFn,
  onViewTable,
  onFinish,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(6),
          paddingTop: hp(4),
          paddingBottom: hp(15),
        }}
      >
        {/* Header Section */}
        <View className="items-center mb-8">
          <View className="bg-indigo-500/20 p-4 rounded-full mb-4">
            <Ionicons name="trophy" size={40} color="#818cf8" />
          </View>
          <Text style={{ fontSize: rf(2.8) }} className="font-main-bold text-white text-center">
            {isHindi ? "आपका प्रदर्शन (Your Performance)" : "Your Performance"}
          </Text>
          <Text style={{ fontSize: rf(1.4) }} className="font-main-md text-white/40 uppercase tracking-widest mt-1">
            Learning Summary
          </Text>
        </View>

        {/* Match Review List */}
        <MatchReview
          history={matchHistory}
          isHindi={isHindi}
          translateFn={translateFn}
          onViewTable={onViewTable}
        />
      </ScrollView>

      {/* Floating Finish Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + hp(2),
          paddingHorizontal: wp(6),
          paddingTop: hp(2),
        }}
        className="bg-black/80 backdrop-blur-xl border-t border-white/5"
      >
        <TouchableOpacity
          onPress={onFinish}
          activeOpacity={0.8}
          className="bg-indigo-600 h-16 rounded-2xl items-center justify-center shadow-2xl shadow-indigo-500/50"
        >
          <Text style={{ fontSize: rf(1.8) }} className="font-main-bold text-white uppercase tracking-widest">
            {isHindi ? "गेम समाप्त करें (Finish Game)" : "FINISH GAME"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
