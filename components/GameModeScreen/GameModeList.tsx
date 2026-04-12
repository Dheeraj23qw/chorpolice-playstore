import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router"; // 👈 Ensure this is imported

import { hp, wp } from "@/utils/responsive";
import { optionsGameMode } from "@/constants/gamemode";
import { GameModeCard } from "./GameModeCard";
import GameModeModal from "./GameModeModal";

interface GameModeListProps {
  onModalToggle: (status: boolean) => void;
}

const GameModeList: React.FC<GameModeListProps> = ({ onModalToggle }) => {
  const insets = useSafeAreaInsets();
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  // UNIFIED LOGIC: Handles both Modal triggers and direct navigation
  const handleOpen = (item: any) => {
    if (item.id.endsWith("_online")) {
      setSelectedGame(item);
      onModalToggle(true); // Fades out the background screen
    } else {
      router.push(item.route); // Navigates for offline modes
    }
  };

  const handleClose = () => {
    setSelectedGame(null);
    onModalToggle(false); // Fades the background screen back in
  };

  return (
    <View className="flex-1">
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
          <GameModeCard
            item={item}
            index={index}
            onPress={() => handleOpen(item)}
          />
        )}
      />

      <GameModeModal
        isVisible={!!selectedGame}
        onClose={handleClose}
        gameType={selectedGame?.gameType || selectedGame?.id || ""}
      />
    </View>
  );
};

export default React.memo(GameModeList);
