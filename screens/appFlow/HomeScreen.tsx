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
import { usePathname } from "expo-router";
import { DevOnboardingToggle } from "@/components/DevOnboardingToggle";

export default function HomeScreen() {
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);

  useAwardUnlocking();

  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      const state = store.getState().session;
      const isOnJoinScreen = pathname.includes("/join");
      const isOnHostLobbyScreen = pathname.includes("/lobby");
      const isOnLobbySetupScreen = pathname.includes("/lobby-setup");
      
      const shouldSkipHomeCleanup =
        state.connectionStatus === "HOSTING" ||
        state.connectionStatus === "CONNECTING" ||
        state.connectionStatus === "CONNECTED" ||
        state.isHost ||
        !!state.roomCode ||
        isOnJoinScreen ||
        isOnHostLobbyScreen ||
        isOnLobbySetupScreen;

      if (shouldSkipHomeCleanup) {
        console.log("[LAN][CLEANUP] Home focus cleanup skipped: active LAN flow");
        return;
      }

      console.log("[LAN][CLEANUP] Home screen focused - cleaning up stale resources");
      void cleanupStaleNetworkResources({ reason: "home_focus" });
      
      // Also stop UDP discovery if somehow left running
      LanDiscoveryService.stopListening();
      void LanDiscoveryService.stopBroadcasting();

      // Clear session state (remove old players, reset phase)
      store.dispatch(clearSession());
      console.log("[LAN][CLEANUP] Session cleared on Home focus");
    }, [pathname])
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
