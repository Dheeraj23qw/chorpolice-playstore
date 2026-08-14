import React, { useState } from "react";
import { Stack, router } from "expo-router";

import { GameModeSelectScreen } from "@/screens/GameModeScreen/GameModeSelectScreen";
import { multiplayerModes } from "@/constants/gamemode";
import MultiplayerPermissionModal from "@/modal/MultiplayerPermissionModal";

export default function MultiplayerRoute() {
  console.log("[NAV_DEBUG] [MULTIPLAYER] mounted route");
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handleGrant = () => {
    setPermissionsGranted(true);
  };

  const handleDeny = () => {
    router.replace("/mode-select");
  };

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
