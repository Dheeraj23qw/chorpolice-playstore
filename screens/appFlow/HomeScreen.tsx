import React, { useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { AudioEngine } from "@/audio/audioEngine";
import { useAppSelector } from "@/hooks/useAppRedux";
import { useRatingPrompt } from "@/hooks/useRatingPrompt";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import store from "@/redux/store";
import { cleanupStaleNetworkResources } from "@/service/lanGameService";
import { clearSession } from "@/redux/reducers/sessionSlice";
import { DevOnboardingToggle } from "@/components/DevOnboardingToggle";
import CustomRatingModal from "@/modal/RatingModal";

export default function HomeScreen() {
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);
  const { modalVisible: ratingModalVisible, handleClose: handleRatingClose, handleSuccess: handleRatingSuccess } = useRatingPrompt();

  useFocusEffect(
    useCallback(() => {
      console.log("[LAN][CLEANUP] Home screen focused - clearing stale session");
      void cleanupStaleNetworkResources({ reason: "home_focus" });

      // Clear session state (remove old players, reset phase)
      store.dispatch(clearSession());
      console.log("[LAN][CLEANUP] Session cleared on Home focus");
    }, [])
  );

  useEffect(() => {
    if (isSoundLoaded && !AudioEngine.isMuted()) {
      AudioEngine.ensureQuizGlobal?.();
    }
  }, [isSoundLoaded]);

  return (
    <>
      <GameModeScreen />
      <CustomRatingModal
        visible={ratingModalVisible}
        onClose={handleRatingClose}
        onSuccess={handleRatingSuccess}
        title="Rate Chor Police"
      />
      {__DEV__ && <DevOnboardingToggle immediate />}
    </>
  );
}
