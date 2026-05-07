import React, { memo, useMemo } from "react";
import { MotiView } from "moti";

import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { CardDealPreset } from "@/redux/reducers/sessionSlice";

import { DealingStage } from "../types";
import { getCardStartStyle } from "../cardDealAnimations";

interface GridCardProps {
  index: number;
  name: string;
  round: number;
  dealingStage: DealingStage;
  dealAnimationPreset: CardDealPreset;
  motion: any;
  handleCardClick: (index: number) => void;
  handleCardClickWithBounce: (index: number) => void;
  roles: string[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  getCardStyle: (index: number) => any;
  isHighlight?: boolean;
  disabled?: boolean;
}

const CARD_HIGHLIGHT_COLORS = ["#F43F5E", "#10B981", "#3B82F6", "#F59E0B"];

const GridCardComponent: React.FC<GridCardProps> = ({
  index,
  name,
  round,
  dealingStage: _dealingStage,
  dealAnimationPreset,
  motion,
  handleCardClick,
  handleCardClickWithBounce,
  roles,
  flippedStates,
  clickedCards,
  getCardStyle,
  isHighlight = false,
  disabled = true,
}) => {
  const startStyle = useMemo(
    () => getCardStartStyle(dealAnimationPreset, index),
    [dealAnimationPreset, index],
  );

  const themeColor =
    CARD_HIGHLIGHT_COLORS[index % CARD_HIGHLIGHT_COLORS.length];

  const flipped = flippedStates[index] ?? false;
  const clicked = clickedCards[index] ?? false;
  const role = roles[index] ?? "Joker";

  return (
    <MotiView
      key={`${round}-${index}`}
      className="aspect-[3/4.2] w-[47%]"
      from={startStyle}
      animate={motion.animate}
      transition={motion.transition}
      style={{ zIndex: motion.zIndex }}
    >
      <PlayerCard
        index={index}
        role={role}
        playerName={name}
        flipped={flipped}
        clicked={clicked}
        isCorrect={role === "Thief"}
        onClick={handleCardClick}
        onBounceEffect={handleCardClickWithBounce}
        animatedStyle={getCardStyle(index)}
        isHighlight={!flipped && !clicked}
        highlightColor={themeColor}
        disabled={disabled}
      />
    </MotiView>
  );
};

GridCardComponent.displayName = "GridCard";

export const GridCard = memo(GridCardComponent);
