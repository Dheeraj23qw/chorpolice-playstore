import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { optionsGameMode } from "@/constants/gamemode";
import { GameModeRow } from "./GameModeRow";

const GameModeList: React.FC = () => {
  const handleOpen = (item: (typeof optionsGameMode)[number]) => {
    if (__DEV__) {
      console.log("[NAV][HOME] card pressed", {
        id: item.id,
        target: item.route,
      });
    }
    router.push(item.route);
  };

  return (
    <View className="flex-1 px-5">
      <View className="gap-y-4">
        {optionsGameMode.map((item) => (
          <GameModeRow
            key={item.id}
            item={item}
            onPress={() => handleOpen(item)}
          />
        ))}
      </View>
    </View>
  );
};

export default React.memo(GameModeList);
