import React, { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import BackgroundOrbs from "@/components/GameModeScreen/BackgroundOrbs";
import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import { AudioEngine } from "@/audio/audioEngine";
import { AppDispatch, RootState } from "@/redux/store";
import { setIsGameReset } from "@/redux/reducers/playerReducer";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset
  );

  useEffect(() => {
    try {
      AudioEngine.stopAllExceptQuiz();
      const timer = setTimeout(() => {
        dispatch(setIsGameReset(false));
      }, 500);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error in GameModeScreen effect:", err);
    }
  }, [dispatch, isGameReset]);

  return (
    <View className="flex-1 bg-[#050508]">
      <BackgroundOrbs />

      <View style={{ paddingTop: insets.top }} className="flex-1">
        <HeaderSection />
        <GameModeList />
      </View>
    </View>
  );
};

export default React.memo(GameModeScreen);
