import React from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, wp } from "@/utils/responsive";
import { optionsGameMode } from "@/constants/gamemode";
import { GameModeCard } from "./GameModeCard";

const GameModeList = () => {
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={optionsGameMode}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: hp(4.2),
        paddingBottom: insets.bottom + hp(15),
        paddingHorizontal: wp(5),
      }}
      renderItem={({ item, index }) => (
        <GameModeCard item={item} index={index} />
      )}
    />
  );
};

export default React.memo(GameModeList);
