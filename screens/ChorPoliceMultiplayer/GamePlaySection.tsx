import React from "react";
import { ScrollView, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
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
  handleCardClick: (index: number, targetId?: string) => void;
  handleCardClickWithBounce: (index: number) => void;
  toggleModal: () => void;
  round: number;
  message: string | null;
  getCardStyle: (index: number) => any;
  showTableButton: boolean;
  isHighlight?: boolean;
  invisibleIndices?: number[];
  localPlayerName?: string;
  myRole?: string | null;
  gamePhase?: string;
  investigationTargets?: any[];
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
  isHighlight,
  invisibleIndices = [],
  localPlayerName = "Player",
  myRole = null,
  gamePhase = "waiting",
  investigationTargets = [],
}) => {
  const isInvestigation = (gamePhase === "police_turn" || gamePhase === "investigation_shuffle") && investigationTargets.length > 0;
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
            subText={
              isPlayButtonDisabled && (myRole === "Police" || myRole === "Advisor" || myRole === "King" || myRole === "Thief")
                ? (() => {
                    const name = localPlayerName;
                    if (myRole === "Police") return `${name}, you are Police. Catch the Thief! 🔍`;
                    if (myRole === "Advisor") return `${name}, you are Advisor. Keep hidden! 🎩`;
                    if (myRole === "King") return `${name}, you are King. Justice awaits! 👑`;
                    if (myRole === "Thief") return `${name}, you are Thief. Don't get caught! 😈`;
                    return null;
                  })()
                : null
            }
          />
        </View>

        {/* 🎴 Card Arena */}
        <View className="flex-col gap-y-8">
          {!isInvestigation ? (
            <>
              {/* Row 1: Players 0 & 1 */}
              <View className="flex-row justify-between">
                {playerNames.slice(0, 2).map((name, index) => (
                  <View 
                    key={index} 
                    className="aspect-[3/4.2] w-[47%]"
                    style={{ opacity: invisibleIndices.includes(index) ? 0 : 1 }}
                    pointerEvents={invisibleIndices.includes(index) ? "none" : "auto"}
                  >
                    <PlayerCard
                      index={index}
                      role={roles[index]}
                      playerName={name}
                      flipped={flippedStates[index]}
                      clicked={clickedCards[index]}
                      isCorrect={roles[index] === "Thief"}
                      onClick={handleCardClick}
                      onBounceEffect={() => handleCardClickWithBounce(index)}
                      animatedStyle={getCardStyle(index)}
                      isHighlight={isHighlight && !flippedStates[index] && !clickedCards[index]}
                    />
                  </View>
                ))}
              </View>

              {/* Row 2: Players 2 & 3 */}
              <View className="flex-row justify-between">
                {playerNames.slice(2, 4).map((name, index) => {
                  const actualIndex = index + 2;
                  return (
                    <View 
                      key={actualIndex} 
                      className="aspect-[3/4.2] w-[47%]"
                      style={{ opacity: invisibleIndices.includes(actualIndex) ? 0 : 1 }}
                      pointerEvents={invisibleIndices.includes(actualIndex) ? "none" : "auto"}
                    >
                      <PlayerCard
                        index={actualIndex}
                        role={roles[actualIndex]}
                        playerName={name}
                        flipped={flippedStates[actualIndex]}
                        clicked={clickedCards[actualIndex]}
                        isCorrect={roles[actualIndex] === "Thief"}
                        onClick={handleCardClick}
                        onBounceEffect={() => handleCardClickWithBounce(actualIndex)}
                        animatedStyle={getCardStyle(actualIndex)}
                        isHighlight={isHighlight && !flippedStates[actualIndex] && !clickedCards[actualIndex]}
                      />
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            /* 🃏 Investigation Mode: 3 Mystery Cards centered */
            <View className="flex-col gap-y-6 items-center">
               <View className="flex-row justify-between w-full">
                  {investigationTargets.slice(0, 2).map((target, idx) => {
                    const isFlipped = target.playerIndex !== null ? flippedStates[target.playerIndex] : (clickedCards[10 + idx]);
                    const isClicked = target.playerIndex !== null ? clickedCards[target.playerIndex] : (clickedCards[10 + idx]);

                    return (
                      <MotiView 
                        key={`${round}-${target.id}`} 
                        className="aspect-[3/4.2] w-[47%]"
                        from={{
                          opacity: 0,
                          scale: 0.75,
                          translateY: -30,
                          rotateZ: idx === 0 ? "-10deg" : "10deg",
                        }}
                        animate={{
                          opacity: 1,
                          scale: isClicked && !isFlipped ? 1.05 : 1,
                          translateY: 0,
                          rotateZ: "0deg",
                          rotateY: isFlipped ? '180deg' : '0deg',
                        }}
                        transition={{
                          type: "timing",
                          duration: 650,
                          delay: idx * 140,
                        }}
                      >
                        <PlayerCard
                          index={target.playerIndex ?? (10 + idx)}
                          role={target.role}
                          playerName="Mystery"
                          flipped={isFlipped || false}
                          clicked={isClicked || false}
                          isCorrect={target.role === "Thief"}
                          onClick={() => {
                             if (gamePhase === "investigation_shuffle") return;
                             handleCardClick(target.playerIndex ?? (10 + idx), target.id);
                           }}
                          onBounceEffect={() => {}}
                          animatedStyle={{}} // Avoid getCardStyle crash
                          isHighlight={!isFlipped && gamePhase === "police_turn"}
                        />
                      </MotiView>
                    );
                  })}
               </View>
               {/* 3rd Card Centered Below */}
               {investigationTargets[2] && (() => {
                 const target = investigationTargets[2];
                 const isFlipped = target.playerIndex !== null ? flippedStates[target.playerIndex] : (clickedCards[12]);
                 const isClicked = target.playerIndex !== null ? clickedCards[target.playerIndex] : (clickedCards[12]);

                 return (
                  <MotiView 
                    key={`${round}-${target.id}`} 
                    className="aspect-[3/4.2] w-[47%]"
                    from={{
                      opacity: 0,
                      scale: 0.75,
                      translateY: 40,
                      rotateZ: "0deg",
                    }}
                    animate={{
                      opacity: 1,
                      scale: isClicked && !isFlipped ? 1.05 : 1,
                      translateY: 0,
                      rotateZ: "0deg",
                      rotateY: isFlipped ? '180deg' : '0deg',
                    }}
                    transition={{
                      type: "timing",
                      duration: 650,
                      delay: 2 * 140,
                    }}
                  >
                     <PlayerCard
                       index={target.playerIndex ?? 12}
                       role={target.role}
                       playerName="Mystery"
                       flipped={isFlipped || false}
                       clicked={isClicked || false}
                       isCorrect={target.role === "Thief"}
                       onClick={() => {
                          if (gamePhase === "investigation_shuffle") return;
                          handleCardClick(target.playerIndex ?? 12, target.id);
                        }}
                       onBounceEffect={() => {}}
                       animatedStyle={{}} // Avoid getCardStyle crash
                       isHighlight={!isFlipped && gamePhase === "police_turn"}
                     />
                  </MotiView>
                 );
               })()}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
