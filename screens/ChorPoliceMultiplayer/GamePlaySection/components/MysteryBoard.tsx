import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { 
  MYSTERY_BOARD_WIDTH, 
  MYSTERY_BOARD_HEIGHT, 
  MYSTERY_SLOTS, 
  MYSTERY_SHUFFLE_PATHS, 
  MYSTERY_SHUFFLE_ROTATIONS 
} from "../constants";

interface MysteryBoardProps {
  mysteryShuffleStep: number;
  flippedStates: boolean[];
  handleCardClick: (index: number) => void;
  handleCardClickWithBounce: (index: number) => void;
  roles: string[];
  clickedCards: boolean[];
}

export const MysteryBoard: React.FC<MysteryBoardProps> = React.memo(({
  mysteryShuffleStep,
  flippedStates,
  handleCardClick,
  handleCardClickWithBounce,
  roles,
  clickedCards,
}) => {
  return (
    <View 
      className="self-center relative items-center justify-center bg-black/20 rounded-3xl border border-white/10"
      style={{ width: MYSTERY_BOARD_WIDTH + 40, height: MYSTERY_BOARD_HEIGHT + 40 }}
    >
      {[0, 1, 2].map((i) => {
        const slotIdx = MYSTERY_SHUFFLE_PATHS[i][mysteryShuffleStep];
        const slot = MYSTERY_SLOTS[slotIdx];
        const rot = MYSTERY_SHUFFLE_ROTATIONS[i][mysteryShuffleStep];
        const mysteryIndex = 10 + i;

        return (
          <MotiView
            key={i}
            className="absolute aspect-[3/4.2] w-[38%]"
            animate={{
              left: slot.left + 20,
              top: slot.top + 20,
              rotate: rot,
              scale: 1,
            }}
            transition={{
              type: "timing",
              duration: 800,
            }}
          >
            <PlayerCard
              index={mysteryIndex}
              playerName={`Card ${i + 1}`}
              flipped={flippedStates[mysteryIndex]}
              onClick={handleCardClick}
              onBounceEffect={handleCardClickWithBounce}
              role={roles[mysteryIndex]}
              clicked={clickedCards[mysteryIndex]}
              isHighlight={true}
              highlightColor={["#10B981", "#3B82F6", "#F59E0B"][i]}
              animatedStyle={{}}
            />
          </MotiView>
        );
      })}
    </View>
  );
});
