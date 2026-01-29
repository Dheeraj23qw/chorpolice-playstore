import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setGameRound } from "@/redux/reducers/playerReducer";
import { rf } from "@/utils/responsive";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

const RoundSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound,
  );

  const roundOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleRoundSelect = useCallback((round: number) => {
    dispatch(setGameRound(round));

    // Simple, non-intrusive feedback
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Duration Set',
      textBody: `Mission updated to ${round} ${round === 1 ? 'round' : 'rounds'}.`,
      autoClose: 1000, 
    });
  }, [dispatch]);

  return (
    <View className="w-full">
      {/* --- Label --- */}
      <View className="flex-row items-center mb-4 px-2">
        <View className="w-1.5 h-4 bg-indigo-500 rounded-full mr-3" />
        <Text
          style={{ fontSize: rf(1.1) }}
          className="text-white/50 font-black uppercase tracking-[4px]"
        >
          Mission Rounds
        </Text>
      </View>

      {/* --- Glass Grid Container --- */}
      <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-4 flex-row flex-wrap justify-between">
        {roundOptions.map((round) => {
          const isSelected = selectedRounds === round;

          return (
            <Pressable
              key={`round-${round}`}
              onPress={() => handleRoundSelect(round)}
              style={{
                width: "18%",
                aspectRatio: 1,
                backgroundColor: isSelected
                  ? "#6366f1"
                  : "rgba(255,255,255,0.05)",
                borderColor: isSelected ? "#818cf8" : "rgba(255,255,255,0.05)",
              }}
              className="items-center justify-center rounded-2xl mb-3 border"
            >
              <Text
                style={{ fontSize: rf(1.3) }}
                className={`font-black ${isSelected ? "text-white" : "text-white/20"}`}
              >
                {round}
              </Text>

              {/* Active Indicator Dot */}
              {isSelected && (
                <View className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* --- Bottom Status Bar --- */}
      <View className="mt-4 bg-indigo-500/10 self-center px-4 py-1.5 rounded-full border border-indigo-500/20">
        <Text
          style={{ fontSize: rf(0.9) }}
          className="text-indigo-300 font-bold uppercase tracking-[2px]"
        >
          Duration: {selectedRounds} {selectedRounds === 1 ? "Round" : "Rounds"}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(RoundSelector);
