import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, rf, wp } from "@/utils/responsive";
import { Text } from "../Text";
import { MatchReview, MatchReviewItem } from "./MatchReview";

interface PersonalSummaryProps {
  matchHistory: MatchReviewItem[];
  correctAnswers: number;
  totalQuestions: number;
  isHindi: boolean;
  translateFn: (text: string) => string;
  onViewTable: () => void;
  onContinue: () => void;
}

export const PersonalSummary: React.FC<PersonalSummaryProps> = ({
  matchHistory,
  correctAnswers,
  totalQuestions,
  isHindi,
  translateFn,
  onViewTable,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(6),
          paddingTop: insets.top + hp(2),
          paddingBottom: hp(15),
        }}
      >
        <View className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] px-5 py-6">
          <View className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/15" />
          <View className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-cyan-500/10" />

          <View className="items-center">
            <View className="mb-4 rounded-full border border-indigo-400/20 bg-indigo-500/20 p-4">
              <Ionicons name="trophy" size={36} color="#818cf8" />
            </View>

            <Text
              style={{ fontSize: rf(2.7) }}
              className="text-center font-main-bold text-white"
            >
              {isHindi ? "Match Summary" : "Match Summary"}
            </Text>

            <Text
              style={{ fontSize: rf(1.35), lineHeight: rf(2) }}
              className="mt-2 text-center font-main-md text-white/60"
            >
              {isHindi
                ? "Har question ko kholo, answer samjho, phir final leaderboard dekho."
                : "Open each question, review the answer, then head to the final leaderboard."}
            </Text>
          </View>

          <View className="mt-5 flex-row justify-between">
            <View className="mr-2 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Text
                style={{ fontSize: rf(1.15) }}
                className="font-main-bold uppercase tracking-[2px] text-white/40"
              >
                {isHindi ? "Questions" : "Questions"}
              </Text>
              <Text
                style={{ fontSize: rf(2.3) }}
                className="mt-1 font-main-bold text-white"
              >
                {totalQuestions}
              </Text>
            </View>

            <View className="ml-2 flex-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <Text
                style={{ fontSize: rf(1.15) }}
                className="font-main-bold uppercase tracking-[2px] text-emerald-300/60"
              >
                {isHindi ? "Correct" : "Correct"}
              </Text>
              <Text
                style={{ fontSize: rf(2.3) }}
                className="mt-1 font-main-bold text-emerald-300"
              >
                {`${correctAnswers}/${totalQuestions}`}
              </Text>
            </View>
          </View>
        </View>

        <MatchReview
          history={matchHistory}
          isHindi={isHindi}
          translateFn={translateFn}
          onViewTable={onViewTable}
        />
      </ScrollView>

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
        className="border-t border-white/5 bg-black/80 backdrop-blur-xl"
      >
        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.8}
          className="h-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/50"
        >
          <Text
            style={{ fontSize: rf(1.8) }}
            className="font-main-bold uppercase tracking-widest text-white"
          >
            {isHindi ? "Final Leaderboard" : "FINAL LEADERBOARD"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
