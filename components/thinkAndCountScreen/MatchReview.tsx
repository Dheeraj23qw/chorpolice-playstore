import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "../Text";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

interface MatchReviewProps {
  history: any[];
  onViewTable: () => void;
  isHindi?: boolean;
  translateFn: (text: string) => string;
}

export const MatchReview: React.FC<MatchReviewProps> = ({ 
  history, 
  onViewTable, 
  isHindi, 
  translateFn 
}) => {
  return (
    <View style={{ marginTop: hp(4) }} className="flex-1">
      <View className="mb-4 flex-row items-center justify-between px-2">
        <View className="flex-row items-center">
          <Ionicons name="school-outline" size={20} color="#818cf8" />
          <Text
            style={{ fontSize: rf(2) }}
            className="ml-2 font-main-bold text-indigo-400"
          >
            Learning Review
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={onViewTable}
          activeOpacity={0.7}
          className="flex-row items-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5"
        >
          <Ionicons name="grid-outline" size={16} color="#818cf8" />
          <Text style={{ fontSize: rf(1.2) }} className="ml-1.5 font-main-md text-indigo-400">
            VIEW TABLE
          </Text>
        </TouchableOpacity>
      </View>

      {history.map((item, index) => (
        <Animated.View
          key={item.questionId || index}
          entering={FadeInDown.delay(index * 150)}
          className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          {/* Header */}
          <View className="bg-white/5 px-4 py-3 border-b border-white/5">
            <Text style={{ fontSize: rf(1.4) }} className="font-main-bold text-white/50 uppercase">
              Question {index + 1}
            </Text>
          </View>

          <View className="p-4">
            {/* Question Text */}
            <Text style={{ fontSize: rf(1.8) }} className="font-main-md text-white mb-4">
              {isHindi ? translateFn(item.question) : item.question}
            </Text>

            {/* Answer Box */}
            <View className="mb-4 flex-row items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <View className="ml-3">
                <Text style={{ fontSize: rf(1.2) }} className="font-main-md text-emerald-400/60 uppercase">
                  Correct Answer
                </Text>
                <Text style={{ fontSize: rf(1.6) }} className="font-main-bold text-emerald-400">
                  {isHindi ? translateFn(item.correctAnswer) : item.correctAnswer}
                </Text>
              </View>
            </View>

            {/* Explanation/Hint Section */}
            <View className="rounded-xl bg-white/5 p-4 border border-white/5">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="bulb-outline" size={16} color="#fbbf24" />
                <Text style={{ fontSize: rf(1.4) }} className="ml-2 font-main-bold text-amber-400">
                  Explanation
                </Text>
              </View>
              <Text style={{ fontSize: rf(1.5), lineHeight: rf(2.2) }} className="font-main-md text-white/70">
                {item.hint}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}

      <View className="h-10" />
    </View>
  );
};
