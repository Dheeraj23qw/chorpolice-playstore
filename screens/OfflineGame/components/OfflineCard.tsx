import React, { memo } from "react";
import { MotiView } from "moti";
import { wp, hp } from "@/utils/responsive";
import { ChorSipahiCard } from "@/components/ChorSipahiCard";

interface OfflineCardProps {
  index: number;
  player: { name: string; avatarId: number };
  role: string;
  isFlipped: boolean;
  isClicked: boolean;
  isDealing: boolean;
  isSpinning?: boolean;
  animStyle: number;
  onPress: (index: number) => void;
  disabled: boolean;
  phase: string;
  isHighlight?: boolean;
}

const OfflineCardComponent: React.FC<OfflineCardProps> = ({
  index,
  player,
  role,
  isFlipped,
  isClicked,
  isDealing,
  isSpinning = false,
  animStyle,
  onPress,
  disabled,
  phase,
  isHighlight = false,
}) => {
  const offX = wp(18);
  const offY = hp(12);

  // 1. Spinning in center
  if (isSpinning) {
    return (
      <MotiView
        animate={{ 
            translateX: index % 2 === 0 ? 5 : -5, 
            translateY: index < 2 ? 5 : -5, 
            rotate: "1080deg", 
            scale: 1 
        }}
        transition={{ type: "timing", duration: 2500 }}
        style={{ zIndex: 100 }}
        className="w-[47%]"
      >
         <ChorSipahiCard
            index={index}
            player={player}
            role={role}
            isFlipped={false}
            isClicked={false}
            onPress={() => {}}
            disabled={true}
            phase={phase}
        />
      </MotiView>
    );
  }

  // 2. Regular Animation Layer
  let crazyStyles = { translateX: 0, translateY: 0, rotate: "0deg", scale: 1 };
  
  if (isDealing) {
    switch (animStyle) {
      case 0:
        crazyStyles = { translateX: index % 2 === 0 ? offX : -offX, translateY: index < 2 ? offY : -offY, rotate: "360deg", scale: 1.05 };
        break;
      case 1:
        crazyStyles = { translateX: index % 2 === 0 ? -offX : offX, translateY: index < 2 ? offY : -offY, rotate: "-180deg", scale: 0.95 };
        break;
      case 2:
        crazyStyles = { translateX: index % 2 === 0 ? offX/1.5 : -offX/1.5, translateY: index < 2 ? offY/1.5 : -offY/1.5, scale: 1.2, rotate: "0deg" };
        break;
      case 3:
        crazyStyles = { translateX: 0, translateY: index < 2 ? offY : -offY, scale: 1.1, rotate: "0deg" };
        break;
    }
  }

  return (
    <MotiView
      animate={crazyStyles}
      transition={{ type: "spring", damping: 12, stiffness: 100, delay: isDealing ? index * 80 : 0 }}
      style={{ zIndex: isDealing ? 100 : 1 }}
      className="w-[47%]"
    >
      <ChorSipahiCard
        index={index}
        player={player}
        role={role}
        isFlipped={isFlipped}
        isClicked={isClicked}
        onPress={onPress}
        disabled={disabled}
        phase={phase}
        isHighlight={isHighlight}
      />
    </MotiView>
  );
};

export const OfflineCard = memo(OfflineCardComponent);
