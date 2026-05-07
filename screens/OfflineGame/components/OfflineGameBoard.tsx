import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

import { OfflinePlayer } from "@/redux/reducers/offlineSessionSlice";
import {
  InvestigationTarget,
  OfflineGamePhase,
} from "@/hooks/useOfflineChorPolice";
import { hp, wp } from "@/utils/responsive";
import {
  MYSTERY_BOARD_HEIGHT,
  MYSTERY_BOARD_WIDTH,
  MYSTERY_CARD_HEIGHT,
  MYSTERY_CARD_WIDTH,
  MYSTERY_SLOTS,
} from "@/screens/ChorPoliceMultiplayer/components/GamePlaySection/constants";
import { useMysteryShuffle } from "@/screens/ChorPoliceMultiplayer/components/GamePlaySection/hooks/useMysteryShuffle";
import { getMysteryMotion } from "@/screens/ChorPoliceMultiplayer/components/GamePlaySection/utils/mysteryMotion";
import { OfflineCard } from "./OfflineCard";
import { OfflineCountdownBadge } from "./OfflineCountdownBadge";

interface OfflineGameBoardProps {
  players: OfflinePlayer[];
  roles: string[];
  round: number;
  phase: OfflineGamePhase;
  flippedIndices: Set<number>;
  isSpinning: boolean;
  animStyle: number;
  kingIndex: number | null;
  policeIndex: number | null;
  investigationTargets: InvestigationTarget[];
  clickedTargetId: string | null;
  countdown: number | null;
  onInvestigationClick: (targetId: string, playerIndex: number | null) => void;
}

export const OfflineGameBoard: React.FC<OfflineGameBoardProps> = ({
  players,
  roles,
  round,
  phase,
  flippedIndices,
  isSpinning,
  animStyle,
  kingIndex,
  policeIndex,
  investigationTargets,
  clickedTargetId,
  countdown,
  onInvestigationClick,
}) => {
  const mysteryShuffleStep = useMysteryShuffle(
    phase,
    round,
    investigationTargets.length,
  );

  const renderGridCard = (idx: number) => {
    const player = players[idx] || {
      name: `Player ${idx + 1}`,
      avatarId: idx + 1,
      id: `fallback-${idx}`,
    };
    const role = roles[idx] || "Unknown";
    const isFlipped = flippedIndices.has(idx);
    const isPublicRole = idx === kingIndex || idx === policeIndex;
    const shouldFade = phase === "public_reveal" && !isPublicRole;
    const isTopRow = idx < 2;
    const isLeftCol = idx % 2 === 0;

    let publicRevealTranslateX = 0;
    let publicRevealTranslateY = 0;
    let publicRevealZIndex = 1;

    if (phase === "public_reveal" && isPublicRole) {
      const centeredTranslateX = isLeftCol ? wp(24) : -wp(24);
      const centeredTranslateY = isTopRow ? hp(13) : -hp(13);

      publicRevealTranslateX = centeredTranslateX;
      publicRevealTranslateY = centeredTranslateY;
      publicRevealZIndex = 10;

      if (idx === policeIndex) {
        publicRevealTranslateX += wp(12);
        publicRevealTranslateY += hp(7);
        publicRevealZIndex = 20;
      }
    }

    return (
      <MotiView
        key={idx}
        animate={{
          opacity: shouldFade ? 0 : 1,
          scale: 1,
          translateX: publicRevealTranslateX,
          translateY: publicRevealTranslateY,
        }}
        transition={{ type: "spring", damping: 16, stiffness: 90 }}
        className="aspect-[3/4.2] w-[47%]"
        style={{ zIndex: publicRevealZIndex }}
      >
        <OfflineCard
          index={idx}
          player={player}
          role={role}
          isFlipped={isFlipped}
          isClicked={false}
          isDealing={phase === "dealing" && !isSpinning}
          isSpinning={isSpinning}
          animStyle={animStyle}
          onPress={() => {}}
          disabled
          phase={phase}
        />
      </MotiView>
    );
  };

  const renderTargetCard = (
    target: InvestigationTarget | undefined,
    idx: number,
  ) => {
    const targetId = target?.id;
    const isClicked = targetId !== undefined && clickedTargetId === targetId;
    const motion = getMysteryMotion(idx, isClicked, phase, mysteryShuffleStep);

    return (
      <MotiView
        key={`${round}-${targetId ?? `target-fallback-${idx}`}`}
        from={{
          opacity: 0,
          scale: 0.76,
          left: (MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0]).left,
          top: (MYSTERY_SLOTS[idx] ?? MYSTERY_SLOTS[0]).top + hp(3),
          rotateZ: idx === 1 ? "8deg" : "-8deg",
        }}
        animate={motion.animate}
        transition={motion.transition}
        style={{
          position: "absolute",
          width: MYSTERY_CARD_WIDTH,
          height: MYSTERY_CARD_HEIGHT,
          zIndex: phase === "investigation_shuffle" ? 40 - idx : idx + 1,
        }}
      >
        <OfflineCard
          index={target?.playerIndex ?? 10 + idx}
          player={{ name: "Mystery", avatarId: 0 }}
          role={target?.role ?? "Joker"}
          isFlipped={isClicked}
          isClicked={isClicked}
          isDealing={false}
          isSpinning={false}
          animStyle={0}
          onPress={() => {
            if (targetId) {
              onInvestigationClick(targetId, target?.playerIndex ?? null);
            }
          }}
          disabled={
            phase !== "police_turn" || clickedTargetId !== null || !targetId
          }
          phase={phase}
          isHighlight={
            (phase === "police_turn" || phase === "investigation_shuffle") &&
            clickedTargetId === null
          }
          isMystery
        />
      </MotiView>
    );
  };

  const isInvestigationPhase =
    phase === "police_turn" || phase === "investigation_shuffle";

  return (
    <View className="relative flex-1">
      {isInvestigationPhase ? (
        <View className="items-center pt-1">
          <View
            style={{
              width: MYSTERY_BOARD_WIDTH,
              height: MYSTERY_BOARD_HEIGHT,
            }}
          >
            {investigationTargets
              .slice(0, 3)
              .map((target, idx) => renderTargetCard(target, idx))}
          </View>
        </View>
      ) : (
        <View className="gap-y-8 pb-10">
          <View className="flex-row justify-between">
            {renderGridCard(0)}
            {renderGridCard(1)}
          </View>
          <View className="flex-row justify-between">
            {renderGridCard(2)}
            {renderGridCard(3)}
          </View>
        </View>
      )}
      {countdown !== null && countdown > 0 && (
        <OfflineCountdownBadge value={countdown} />
      )}
    </View>
  );
};
