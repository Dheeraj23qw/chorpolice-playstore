import React from "react";
import { ScrollView, View, Text } from "react-native";
import CustomButton from "@/components/CustomButton";
import PlayButton from "@/components/RajamantriGameScreen/playButton";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";

interface GamePlaySectionProps {
  isPlayButtonDisabled: boolean;
  handlePlay: () => void;
  roles: string[];
  playerNames: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  handleCardClick: (index: number) => void;
  handleCardClickWithBounce: (index: number) => void;
  policeIndex: number | null;
  kingIndex: number | null;
  advisorIndex: number | null;
  thiefIndex: number | null;
  toggleModal: () => void;
  round: number;
  message: string | null;
  getCardStyle: (index: number) => any; 
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
  toggleModal,
  round,
  message,
  getCardStyle
}) => {
  return (
    <View className="flex-1 bg-[#020205]">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* --- 1. Top Spacing & Phase Badge --- */}
        <View className="items-center mt-6 mb-8">
          <View className="bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
            <Text className="text-indigo-400 font-bold uppercase tracking-[3px] text-[10px]">
              Round-{round}
            </Text>
          </View>
        </View>

        {/* --- 2. Action Button Section (Large Padding) --- */}
        <View className="mb-12">
          <PlayButton
            disabled={isPlayButtonDisabled}
            onPress={handlePlay}
            buttonText={
              isPlayButtonDisabled
                ? message ? message : `Round ${round}`
                : `Press me to play!`
            }
          />
        </View>

        {/* --- 3. Card Grid Section --- */}
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