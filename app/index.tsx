import "../global.css";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";

// Redux Actions
import { AppDispatch } from "@/redux/store";
import { initializeCoins } from "@/redux/reducers/coinsReducer";
import {
  loadSounds,
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/reducers/soundReducer";

// Screens/Components
import GameModeScreen from "@/screens/GameModeScreen/gameModeScreen";
import { AppText } from "@/components/AppText";

export default function Index() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [isAppReady, setIsAppReady] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  // 1. Hide Header immediately
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // 2. Comprehensive Initialization logic
  useEffect(() => {
    let isMounted = true;

    async function prepareApp() {
      try {
        // Sync tasks (Coins & Storage)
        dispatch(initializeCoins());
        
        const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
        if (hasLaunched === null) {
          await SecureStore.setItemAsync("hasLaunched", "true");
          if (isMounted) setIsFirstLaunch(true);
        } else {
          if (isMounted) setIsFirstLaunch(false);
        }

        // Async tasks (Sound loading)
        await dispatch(loadSounds());
        
        // Start background music only if still on this screen
        if (isMounted) {
          dispatch(playSound("quiz"));
          setIsAppReady(true);
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        if (isMounted) setIsAppReady(true); // Fail gracefully
      }
    }

    prepareApp();

    // Cleanup logic: Stop sounds when user leaves the entry point
    return () => {
      isMounted = false;
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

  // 3. Advanced Loading State (Premium Feel)
  if (!isAppReady) {
    return (
      <View className="flex-1 bg-[#0B0B18] items-center justify-center">
        {/* You can replace this with your VideoPlayerComponent later */}
        <ActivityIndicator size="large" color="#6366f1" />
        <AppText className="mt-4 text-white/50 tracking-[3px] uppercase text-[10px]">
          Initializing Experience
        </AppText>
      </View>
    );
  }

  // 4. Main Entry Point
  return <GameModeScreen />;
}