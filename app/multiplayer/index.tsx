import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, PermissionsAndroid, View } from "react-native";
import * as Location from "expo-location";
import { Stack, router } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { multiplayerModes } from "@/constants/gamemode";
import MultiplayerPermissionModal from "@/modal/MultiplayerPermissionModal";

const ANDROID_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
const ANDROID_NEARBY = "android.permission.NEARBY_WIFI_DEVICES";

export default function MultiplayerRoute() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsChecking(true);

    const check = async () => {
      try {
        if (Platform.OS === "android") {
          const locationOk = await PermissionsAndroid.check(ANDROID_LOCATION);
          if (!locationOk) {
            if (!cancelled) {
              setPermissionsGranted(false);
              setIsChecking(false);
            }
            return;
          }

          if (Platform.Version >= 33) {
            const nearbyOk = await PermissionsAndroid.check(ANDROID_NEARBY as any);
            if (!cancelled) {
              setPermissionsGranted(nearbyOk);
              setIsChecking(false);
            }
            return;
          }

          if (!cancelled) {
            setPermissionsGranted(true);
            setIsChecking(false);
          }
        } else {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (!cancelled) {
            setPermissionsGranted(status === "granted");
            setIsChecking(false);
          }
        }
      } catch {
        if (!cancelled) {
          setPermissionsGranted(false);
          setIsChecking(false);
        }
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGrant = () => {
    setPermissionsGranted(true);
  };

  const handleDeny = () => {
    router.replace("/mode-select");
  };

  if (isChecking) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#818CF8" />
        </View>
      </>
    );
  }

  if (permissionsGranted) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <GameModeSelectScreen
          title="Multiplayer"
          subtitle="Bring your gang to play with you"
          modes={multiplayerModes}
          drawerContext="multiplayer"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <MultiplayerPermissionModal
        isVisible={true}
        onGrant={handleGrant}
        onDeny={handleDeny}
      />
    </>
  );
}
