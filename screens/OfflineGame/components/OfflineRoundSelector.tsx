import React, { useCallback } from "react";
import { View, Pressable } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppDispatch, RootState } from "@/redux/store";
import { setTotalRounds } from "@/redux/reducers/offlineSessionSlice";
import { rf } from "@/utils/responsive";
import { toast } from "@/components/feedback/toast";
import { AudioEngine } from "@/audio/audioEngine";
import { Text } from "@/components/Text";

const ROUND_OPTIONS = [3, 5, 7, 10, 15];

const OfflineRoundSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const totalRounds = useSelector(
    (state: RootState) => state.offlineSession.totalRounds,
  );

  const handleRoundSelect = useCallback(
    (round: number) => {
      if (round === totalRounds) return;

      AudioEngine.play("select", "ui");
      dispatch(setTotalRounds(round));

      toast.success(
        "Rounds Set",
        `Game set to ${round} ${round === 1 ? "round" : "rounds"}.`,
        1000,
      );
    },
    [dispatch, totalRounds],
  );

  return (
    <View className="mt-7 w-full">
      <View className="mb-4 flex-row items-center justify-between px-1">
        <View className="flex-row items-center">
          <View className="mr-3 h-5 w-1.5 rounded-full bg-indigo-500" />

          <View>
            <Text
              style={{ fontSize: rf(1.1) }}
              className="font-main-bold uppercase tracking-[3px] text-white/45"
            >
              Game Rounds
            </Text>

            <Text style={{ fontSize: rf(1.25) }} className="mt-1 text-white/70">
              Choose how long the fun should last
            </Text>
          </View>
        </View>

        <View className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
          <Text
            style={{ fontSize: rf(1.05) }}
            className="font-main-bold text-indigo-200"
          >
            {totalRounds} Rounds
          </Text>
        </View>
      </View>

      <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-3">
        <LinearGradient
          colors={["rgba(99,102,241,0.16)", "rgba(255,255,255,0.02)"]}
          className="absolute h-full w-full"
        />

        <View className="flex-row justify-between">
          {ROUND_OPTIONS.map((round) => {
            const isSelected = totalRounds === round;

            return (
              <Pressable
                key={`round-${round}`}
                onPress={() => handleRoundSelect(round)}
                style={{ width: "18%", aspectRatio: 0.92 }}
                className={`items-center justify-center overflow-hidden rounded-2xl border ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-500"
                    : "border-white/10 bg-white/[0.06]"
                }`}
              >
                {isSelected && (
                  <LinearGradient
                    colors={["#818CF8", "#4F46E5"]}
                    className="absolute h-full w-full"
                  />
                )}

                <Text
                  style={{ fontSize: rf(1.55) }}
                  className={`font-main-bold ${
                    isSelected ? "text-white" : "text-white/35"
                  }`}
                >
                  {round}
                </Text>

                <Text
                  style={{ fontSize: rf(0.75) }}
                  className={`mt-0.5 ${
                    isSelected ? "text-white/75" : "text-white/20"
                  }`}
                >
                  rounds
                </Text>

                {isSelected && (
                  <View className="absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <Ionicons name="checkmark" size={13} color="white" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default React.memo(OfflineRoundSelector);
