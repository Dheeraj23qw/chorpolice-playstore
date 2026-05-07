import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

import PlayButton from "@/components/RajamantriGameScreen/playButton";
import PlayerCard from "@/components/RajamantriGameScreen/cardComponent";
import { Text } from "@/components/Text";
import { OfflineInvestigationBanner } from "@/screens/OfflineGame/components/OfflineInvestigationBanner";
import { hp, rf, wp } from "@/utils/responsive";

import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

const DEALING_SPIN_MS = CP_FLOW_TIMINGS.SHUFFLE_DURATION_MS;
const FADE_START_MS   = CP_FLOW_TIMINGS.NON_REVEAL_FADE_OFFSET_MS;
const MYSTERY_CARD_WIDTH = wp(38);
const MYSTERY_CARD_HEIGHT = (MYSTERY_CARD_WIDTH * 4.2) / 3;
const MYSTERY_CARD_GAP = wp(5);
const MYSTERY_BOARD_WIDTH = MYSTERY_CARD_WIDTH * 2 + MYSTERY_CARD_GAP;
const MYSTERY_BOARD_HEIGHT = MYSTERY_CARD_HEIGHT * 2 + hp(4);

type DealingStage = "idle" | "spin" | "fade" | "reveal";

type InvestigationTarget = {
  id: string;
  playerIndex: number | null;
  role: string;
};

const MYSTERY_SLOTS = [
  { left: 0, top: 0 },
  { left: MYSTERY_CARD_WIDTH + MYSTERY_CARD_GAP, top: 0 },
  {
    left: (MYSTERY_BOARD_WIDTH - MYSTERY_CARD_WIDTH) / 2,
    top: MYSTERY_CARD_HEIGHT + hp(3),
  },
] as const;

const MYSTERY_SHUFFLE_PATHS = [
  [0, 1, 2, 0],
  [1, 2, 0, 1],
  [2, 0, 1, 2],
] as const;

const MYSTERY_SHUFFLE_ROTATIONS = [
  ["-8deg", "10deg", "-12deg", "0deg"],
  ["8deg", "-6deg", "10deg", "0deg"],
  ["0deg", "-10deg", "7deg", "0deg"],
] as const;

const getOfflineStyleSpin = (index: number) => ({
  translateX: index % 2 === 0 ? 5 : -5,
  translateY: index < 2 ? 5 : -5,
  rotate: "1080deg",
  scale: 1,
});

const getOfflineRevealPlacement = (index: number, role: string) => {
  const isTopRow = index < 2;
  const isLeftCol = index % 2 === 0;

  let translateX = isLeftCol ? wp(24) : -wp(24);
  let translateY = isTopRow ? hp(13) : -hp(13);
  let zIndex = 10;

  if (role === "Police") {
    translateX += wp(12);
    translateY += hp(7);
    zIndex = 20;
  }

  return { translateX, translateY, zIndex };
};

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
  investigationTargets?: InvestigationTarget[];
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
  showTableButton: _showTableButton,
  toggleModal: _toggleModal,
  isHighlight,
  invisibleIndices = [],
  localPlayerName: _localPlayerName = "Player",
  myRole: _myRole = null,
  gamePhase = "waiting",
  investigationTargets = [],
}) => {
  const [dealingStage, setDealingStage] = useState<DealingStage>("idle");
  const [mysteryShuffleStep, setMysteryShuffleStep] = useState(3);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (gamePhase === "dealing") {
      setDealingStage("spin");
      // t=3s: non-King/Police cards start fading while spin is still running
      timers.push(setTimeout(() => setDealingStage("fade"), FADE_START_MS));
      // t=4s: King/Police move to center reveal positions
      timers.push(setTimeout(() => setDealingStage("reveal"), DEALING_SPIN_MS));
    } else {
      setDealingStage("idle");
    }

    return () => timers.forEach(clearTimeout);
  }, [gamePhase, round]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (gamePhase === "investigation_shuffle") {
      setMysteryShuffleStep(0);
      timers.push(setTimeout(() => setMysteryShuffleStep(1), 520));
      timers.push(setTimeout(() => setMysteryShuffleStep(2), 1040));
      timers.push(setTimeout(() => setMysteryShuffleStep(3), 1560));
    } else {
      setMysteryShuffleStep(3);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [gamePhase, round, investigationTargets.length]);

  const isInvestigation =
    (gamePhase === "police_turn" || gamePhase === "investigation_shuffle") &&
    investigationTargets.length > 0;

  const getGridCardMotion = (index: number) => {
    const role = roles[index];
    const isPublicRole = role === "King" || role === "Police";
    const shouldHideOriginalCard =
      invisibleIndices.includes(index) &&
      (gamePhase === "investigation_shuffle" || gamePhase === "police_turn");

    if (dealingStage === "spin") {
      const spin = getOfflineStyleSpin(index);

      return {
        animate: {
          opacity: 1,
          scale: spin.scale,
          translateX: spin.translateX,
          translateY: spin.translateY,
          rotate: spin.rotate,
        },
        transition: {
          type: "timing" as const,
          duration: DEALING_SPIN_MS,
        },
        zIndex: 100,
      };
    }

    // t=3s: non-public cards fade out, public cards settle back to center
    if (dealingStage === "fade") {
      if (!isPublicRole) {
        return {
          animate: { opacity: 0, scale: 0.75, translateX: 0, translateY: 0, rotate: "0deg" },
          transition: { type: "timing" as const, duration: DEALING_SPIN_MS - FADE_START_MS },
          zIndex: 1,
        };
      }
      // Public cards glide back to center so they're ready for the reveal
      return {
        animate: { opacity: 1, scale: 1, translateX: 0, translateY: 0, rotate: "0deg" },
        transition: { type: "spring" as const, damping: 18, stiffness: 100 },
        zIndex: 10,
      };
    }

    if (dealingStage === "reveal" && isPublicRole) {
      const revealPlacement = getOfflineRevealPlacement(index, role);

      return {
        animate: {
          opacity: 1,
          scale: 1,
          translateX: revealPlacement.translateX,
          translateY: revealPlacement.translateY,
          rotate: "0deg",
        },
        transition: {
          type: "spring" as const,
          damping: 16,
          stiffness: 90,
        },
        zIndex: revealPlacement.zIndex,
      };
    }

    if (dealingStage === "reveal") {
      return {
        animate: {
          opacity: 0,
          scale: 1,
          translateX: 0,
          translateY: 0,
          rotate: "0deg",
        },
        transition: {
          type: "timing" as const,
          duration: 420,
        },
        zIndex: 1,
      };
    }

    return {
      animate: {
        opacity: shouldHideOriginalCard ? 0 : 1,
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotate: "0deg",
      },
      transition: {
        type: "spring" as const,
        damping: 16,
        stiffness: 90,
      },
      zIndex: shouldHideOriginalCard ? 0 : 1,
    };
  };

  const getMysteryCardState = (target: InvestigationTarget, idx: number) => {
    const physicalIndex = target.playerIndex ?? 10 + idx;

    return {
      physicalIndex,
      isFlipped: flippedStates[physicalIndex] || false,
      isClicked: clickedCards[physicalIndex] || false,
    };
  };

  const getMysteryMotion = (idx: number, isClicked: boolean) => {
    const route =
      gamePhase === "investigation_shuffle"
        ? MYSTERY_SHUFFLE_PATHS[idx][mysteryShuffleStep]
        : idx;
    const slot = MYSTERY_SLOTS[route];

    return {
      animate: {
        left: slot.left,
        top: slot.top,
        opacity: 1,
        scale: isClicked && gamePhase === "police_turn" ? 1.05 : gamePhase === "investigation_shuffle" ? 1.02 : 1,
        rotateZ:
          gamePhase === "investigation_shuffle"
            ? MYSTERY_SHUFFLE_ROTATIONS[idx][mysteryShuffleStep]
            : "0deg",
      },
      transition: {
        type: "timing" as const,
        duration: gamePhase === "investigation_shuffle" ? 440 : 260,
      },
    };
  };

  const renderGridCard = (index: number, name: string) => {
    const motion = getGridCardMotion(index);

    return (
      <MotiView
        key={index}
        className="aspect-[3/4.2] w-[47%]"
        animate={motion.animate}
        transition={motion.transition}
        style={{ zIndex: motion.zIndex }}
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
          disabled
        />
      </MotiView>
    );
  };

  const renderMysteryCard = (target: InvestigationTarget, idx: number) => {
    const { physicalIndex, isFlipped, isClicked } = getMysteryCardState(target, idx);
    const motion = getMysteryMotion(idx, isClicked);

    return (
      <MotiView
        key={`${round}-${target.id}`}
        from={{
          opacity: 0,
          scale: 0.76,
          left: MYSTERY_SLOTS[idx].left,
          top: MYSTERY_SLOTS[idx].top + hp(3),
          rotateZ: idx === 1 ? "8deg" : "-8deg",
        }}
        animate={motion.animate}
        transition={motion.transition}
        style={{
          position: "absolute",
          width: MYSTERY_CARD_WIDTH,
          height: MYSTERY_CARD_HEIGHT,
          zIndex: gamePhase === "investigation_shuffle" ? 40 - idx : idx + 1,
        }}
      >
        <PlayerCard
          index={physicalIndex}
          role={target.role}
          playerName="Mystery"
          flipped={isFlipped}
          clicked={isClicked}
          isCorrect={target.role === "Thief"}
          onClick={(index) => {
            if (gamePhase !== "police_turn") return;
            handleCardClick(index, target.id);
          }}
          onBounceEffect={() => {}}
          animatedStyle={{}}
          isHighlight={
            !isFlipped &&
            !isClicked &&
            (gamePhase === "police_turn" || gamePhase === "investigation_shuffle")
          }
          disabled={gamePhase !== "police_turn" || isFlipped || isClicked}
        />
      </MotiView>
    );
  };

  const buttonText = isPlayButtonDisabled
    ? message || `Round ${round}`
    : "Press me to play!";

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
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
            <View className="absolute inset-x-2 top-0 h-[1px] rounded-full bg-white/30" />

            <Text
              style={{ fontSize: rf(1.4), letterSpacing: wp(1) }}
              className="font-main-bold uppercase text-indigo-300"
            >
              Round {round}
            </Text>
          </View>
        </View>

        <View className="mb-9">
          {isInvestigation ? (
            message ? <OfflineInvestigationBanner message={message} /> : null
          ) : (
            <PlayButton
              disabled={isPlayButtonDisabled}
              onPress={handlePlay}
              buttonText={buttonText}
            />
          )}
        </View>

        <View className="flex-col gap-y-8">
          {!isInvestigation ? (
            <>
              <View className="flex-row justify-between">
                {playerNames.slice(0, 2).map((name, index) =>
                  renderGridCard(index, name),
                )}
              </View>

              <View className="flex-row justify-between">
                {playerNames.slice(2, 4).map((name, index) =>
                  renderGridCard(index + 2, name),
                )}
              </View>
            </>
          ) : (
            <View className="items-center pt-1">
              <View
                style={{ width: MYSTERY_BOARD_WIDTH, height: MYSTERY_BOARD_HEIGHT }}
              >
                {investigationTargets.slice(0, 3).map((target, idx) =>
                  renderMysteryCard(target, idx),
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
