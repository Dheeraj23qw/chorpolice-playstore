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

export default function HomeScreen() {
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);

  useAwardUnlocking();

  useFocusEffect(
    useCallback(() => {
      console.log("[LAN][CLEANUP] Home screen focused - cleaning up stale resources");
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

  return <GameModeScreen />;
}
