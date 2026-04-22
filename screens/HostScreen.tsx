import React from "react";
import { useLocalSearchParams } from "expo-router";

import LobbyScreen from "./LobbyScreen";

const HostScreen = () => {
  const params = useLocalSearchParams();

  return (
    <LobbyScreen
      forcedMode="host"
      routeGameType={String(params.gameType || "CHOR_POLICE")}
      requireLanReady
    />
  );
};

export default HostScreen;
