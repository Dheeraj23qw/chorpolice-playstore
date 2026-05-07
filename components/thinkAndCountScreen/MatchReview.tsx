import React, { useMemo, useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import { hp, rf } from "@/utils/responsive";
import { Text } from "../Text";
import { useSummaryNarration } from "@/hooks/useSummaryNarration";

export interface MatchReviewItem {
  question: string;
  correctAnswer: string;
  hint: string;
  questionId?: string;
}

interface MatchReviewProps {
  history: MatchReviewItem[];
  onViewTable: () => void;
  isHindi?: boolean;
  translateFn: (text: string) => string;
}

export const MatchReview: React.FC<MatchReviewProps> = ({
  history,
  onViewTable,
  isHindi,
  translateFn,
}) => {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const { speakReviewItem, narrationEnabled } = useSummaryNarration({
    isSummaryActive: true,
  });

  const items = useMemo(
    () =>
      history.map((item, index) => ({
        ...item,
        stableId: item.questionId || `question-${index}`,
      })),
    [history],
  );

  const toggleQuestion = (questionId: string) => {
    setOpenQuestionId((prev) => (prev === questionId ? null : questionId));
  };

  return (
    <View style={{ marginTop: hp(4) }} className="flex-1">
      <View className="mb-4 flex-row items-center justify-between px-2">
        <View className="flex-row items-center">
          <Ionicons name="school-outline" size={20} color="#818cf8" />
          <Text
            style={{ fontSize: rf(2) }}
            className="ml-2 font-main-bold text-indigo-400"
          >
            {isHindi ? "Review Section" : "Learning Review"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onViewTable}
          activeOpacity={0.7}
          className="flex-row items-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5"
        >
          <Ionicons name="grid-outline" size={16} color="#818cf8" />
          <Text
            style={{ fontSize: rf(1.2) }}
            className="ml-1.5 font-main-md text-indigo-400"
          >
            {isHindi ? "Table Dekho" : "VIEW TABLE"}
          </Text>
        </TouchableOpacity>
      </View>

      {items.map((item, index) => {
        const isOpen = openQuestionId === item.stableId;
        const localizedQuestion = isHindi
          ? translateFn(item.question)
          : item.question;
        const localizedAnswer = isHindi
          ? translateFn(item.correctAnswer)
          : item.correctAnswer;

        return (
        <Animated.View
          key={item.stableId}
          entering={FadeInDown.delay(index * 150)}
          layout={LinearTransition.springify().damping(10).stiffness(105).mass(0.9)}
          className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
        >
          <Pressable
            onPress={() => toggleQuestion(item.stableId)}
            className="border-b border-white/5 bg-white/5 px-4 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="mr-3 flex-1">
                <Text
                  style={{ fontSize: rf(1.25) }}
                  className="font-main-bold uppercase tracking-[2px] text-indigo-300/70"
                >
                  {`Question ${index + 1}`}
                </Text>

                <Text
                  style={{ fontSize: rf(1.45), lineHeight: rf(1.95) }}
                  className="mt-1 font-main-bold text-white"
                  numberOfLines={isOpen ? 4 : 2}
                >
                  {localizedQuestion}
                </Text>
              </View>

              <View
                className={`h-10 w-10 items-center justify-center rounded-full border ${
                  isOpen
                    ? "border-indigo-400/40 bg-indigo-500/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={isOpen ? "#A5B4FC" : "rgba(255,255,255,0.6)"}
                />
              </View>

              {/* Individual Narration Button */}
              {narrationEnabled && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    speakReviewItem(
                      localizedQuestion,
                      localizedAnswer,
                      item.hint,
                      !!isHindi
                    );
                  }}
                  className="ml-2 h-10 w-10 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10"
                >
                  <Ionicons name="volume-high" size={18} color="#818cf8" />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>

          {isOpen ? (
            <Animated.View
              entering={FadeInDown.springify().damping(11).stiffness(110)}
              exiting={FadeOut.duration(120)}
              className="p-4"
            >
              <View className="mb-4 flex-row items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <View className="ml-3 flex-1">
                  <Text
                    style={{ fontSize: rf(1.2) }}
                    className="font-main-md uppercase text-emerald-400/60"
                  >
                    {isHindi ? "Right Answer" : "Correct Answer"}
                  </Text>
                  <Text
                    style={{ fontSize: rf(1.6) }}
                    className="font-main-bold text-emerald-400"
                  >
                    {localizedAnswer}
                  </Text>
                </View>
              </View>

              <View className="rounded-xl border border-white/5 bg-white/5 p-4">
                <View className="mb-2 flex-row items-center">
                  <Ionicons name="bulb-outline" size={16} color="#fbbf24" />
                  <Text
                    style={{ fontSize: rf(1.4) }}
                    className="ml-2 font-main-bold text-amber-400"
                  >
                    {isHindi ? "Easy Explain" : "Explanation"}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: rf(1.5), lineHeight: rf(2.2) }}
                  className="font-main-md text-white/70"
                >
                  {item.hint}
                </Text>
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
        );
      })}

      <View className="h-10" />
    </View>
  );
};
