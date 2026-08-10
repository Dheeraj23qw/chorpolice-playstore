import React, { useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";

import { AudioEngine } from "@/audio/audioEngine";
import { useAppSelector } from "@/hooks/useAppRedux";
import { useAwardUnlocking } from "@/hooks/useAwardUnlocking";
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import store from "@/redux/store";
import { cleanupStaleNetworkResources } from "@/service/lanGameService";
import { LanDiscoveryService } from "@/service/network/LanDiscoveryService";
import { clearSession } from "@/redux/reducers/sessionSlice";
import { DevOnboardingToggle } from "@/components/DevOnboardingToggle";

export default function HomeScreen() {
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);

  useAwardUnlocking();

  useFocusEffect(
    useCallback(() => {
      // This callback only runs while the actual Home route is focused. A live
      // LAN session is not valid at that point; retaining one lets inactive
      // lobby effects navigate the user away from their next Home selection.
      console.log("[LAN][CLEANUP] Home screen focused - clearing stale session");
      void cleanupStaleNetworkResources({ reason: "home_focus" });
      
      // Also stop UDP discovery if somehow left running
      LanDiscoveryService.stopListening();
      void LanDiscoveryService.stopBroadcasting();

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
      {__DEV__ && <DevOnboardingToggle immediate />}
    </>
  );
}
