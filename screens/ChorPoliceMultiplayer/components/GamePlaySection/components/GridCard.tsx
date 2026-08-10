import React, { memo } from "react";
import { MotiView } from "moti";

import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";

type GridCardProps = {
  index: number;
  name: string;
  round: number;
  role: string;
  flipped: boolean;
  clicked: boolean;
  isHighlight?: boolean;
  isLocalPlayer?: boolean;
  startStyle: any;
  motion: {
    animate: any;
    transition: any;
    zIndex: number;
  };
  handleCardClick: (index: number, targetId?: string) => void;
  handleCardClickWithBounce: (index: number) => void;
  getCardStyle: (index: number) => any;
};

export const GridCard = memo(
  ({
    index,
    name,
    round,
    role,
    flipped,
    clicked,
    isHighlight,
    isLocalPlayer,
    startStyle,
    motion,
    handleCardClick,
    handleCardClickWithBounce,
    getCardStyle,
  }: GridCardProps) => {
    return (
      <MotiView
        key={`${round}-${index}`}
        className="aspect-[3/4.2]"
        from={startStyle}
        animate={motion.animate}
        transition={motion.transition}
        style={{ zIndex: motion.zIndex, width: "47%" }}
      >
        <PlayerCard
          index={index}
          role={role}
          playerName={name}
          flipped={flipped}
          clicked={clicked}
          isCorrect={role === "Thief"}
          onClick={handleCardClick}
          onBounceEffect={() => handleCardClickWithBounce(index)}
          animatedStyle={getCardStyle(index)}
          isHighlight={isHighlight && !flipped && !clicked}
          isLocalPlayer={isLocalPlayer && !flipped && !clicked}
          disabled
        />
      </MotiView>
    );
  },
);

GridCard.displayName = "GridCard";
