import React from "react";
import { ScrollView, View } from "react-native";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { Text } from "@/components/Text";

interface GamePlaySectionProps {
  isPlayButtonDisabled: boolean;
  handlePlay: () => void;
  roles: string[];
  playerNames: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  handleCardClick: (index: number) => void;
  handleCardClickWithBounce: (index: number) => void;
  toggleModal: () => void;
  round: number;
  message: string | null;
  getCardStyle: (index: number) => any;
  showTableButton: boolean;
}

export const GamePlaySection: React.FC<GamePlaySectionProps> = ({
  isPlayButtonDisabled,
  handlePlay,
  roles,
  playerNames,
  flippedStates,
  clickedCards,
  handleCardClick,
  handleCardClickWithBounce,
  round,
  message,
  getCardStyle,
  showTableButton,
  toggleModal, // 👈 ADD THIS
}) => {
  return (
    <View className="flex-1 bg-[#020207]">
      {/* 🌌 Ambient Gradient Glow */}
      <View className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-indigo-600/20 blur-3xl" />
      <View className="absolute top-40 -right-40 w-[360px] h-[360px] rounded-full bg-fuchsia-600/10 blur-3xl" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* 🧊 Glass Header */}
        <View className="items-center mt-8 mb-10">
          <View className="relative px-6 py-2 rounded-full border border-white/15 bg-white/5 overflow-hidden">
            {/* Shine Reflection */}
            <View className="absolute inset-x-2 top-0 h-[1px] bg-white/40 rounded-full" />

            <Text
              // Swapped font-extrabold for font-main-bold
              className="text-indigo-300 font-main-bold uppercase tracking-[4px] text-[11px]"
            >
              ROUND — {round}
            </Text>
          </View>
        </View>

        {/* 🚀 Play Button Glass Stage */}
        <View className="mb-9">
          {showTableButton ? (
            <PlayButton
              disabled={false}
              onPress={toggleModal}
              buttonText="Show Score Table"
              variant="secondary" // 👈 important
            />
          ) : (
            <PlayButton
              disabled={isPlayButtonDisabled}
              onPress={handlePlay}
              buttonText={
                isPlayButtonDisabled
                  ? message
                    ? message
                    : `Round ${round}`
                  : `Press me to play!`
              }
              variant="primary" // 👈 important
            />
          )}
        </View>

        {/* 🎴 Card Arena */}
        <View className="flex-col gap-y-8">
          {/* Row 1 */}
          <View className="flex-row justify-between">
            {roles.slice(0, 2).map((_, index) => (
              <View key={index} className="w-[47%] aspect-[3/4.2]">
                <PlayerCard
                  index={index}
                  role={roles[index]}
                  playerName={playerNames[index]}
                  flipped={flippedStates[index]}
                  clicked={clickedCards[index]}
                  onClick={handleCardClick}
                  onBounceEffect={() => handleCardClickWithBounce(index)}
                  animatedStyle={getCardStyle(index)}
                />
              </View>
            ))}
          </View>

          {/* Row 2 */}
          <View className="flex-row justify-between">
            {roles.slice(2).map((_, index) => (
              <View key={index + 2} className="w-[47%] aspect-[3/4.2]">
                <PlayerCard
                  index={index + 2}
                  role={roles[index + 2]}
                  playerName={playerNames[index + 2]}
                  flipped={flippedStates[index + 2]}
                  clicked={clickedCards[index + 2]}
                  onClick={handleCardClick}
                  onBounceEffect={() => handleCardClickWithBounce(index + 2)}
                  animatedStyle={getCardStyle(index + 2)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
