import React from "react";
import { ScrollView, View } from "react-native";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { Text } from "@/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { rf, wp } from "@/utils/responsive";
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
  toggleModal,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* 🧊 Glass Header */}
        <View className="mb-10 mt-8 items-center">
          <View
            className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-6 py-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
            }}
          >
            {/* Specular Shine Reflection */}
            <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/30" />

            <Text 
              style={{ fontSize: rf(1.4), letterSpacing: wp(1) }}
              className="font-main-bold uppercase text-indigo-300"
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
            />
          )}
        </View>

        {/* 🎴 Card Arena */}
        <View className="flex-col gap-y-8">
          {/* Row 1 */}
          <View className="flex-row justify-between">
            {roles.slice(0, 2).map((_, index) => (
              <View key={index} className="aspect-[3/4.2] w-[47%]">
                <PlayerCard
                  index={index}
                  role={roles[index]}
                  playerName={playerNames[index]}
                  flipped={flippedStates[index]}
                  clicked={clickedCards[index]}
                  isCorrect={roles[index] === "Thief"}
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
              <View key={index + 2} className="aspect-[3/4.2] w-[47%]">
                <PlayerCard
                  index={index + 2}
                  role={roles[index + 2]}
                  playerName={playerNames[index + 2]}
                  flipped={flippedStates[index + 2]}
                  clicked={clickedCards[index + 2]}
                  isCorrect={roles[index + 2] === "Thief"}
                  onClick={handleCardClick}
                  onBounceEffect={() => handleCardClickWithBounce(index + 2)}
                  animatedStyle={getCardStyle(index + 2)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
