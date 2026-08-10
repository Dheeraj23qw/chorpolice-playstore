import React, { memo } from "react";
import { Image, View } from "react-native";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";

import {
  MYSTERY_BOARD_HEIGHT,
  MYSTERY_BOARD_WIDTH,
  MYSTERY_CARD_HEIGHT,
  MYSTERY_CARD_WIDTH,
} from "../constants";
import { InvestigationTarget } from "../types";
import { MysteryCard } from "./MysteryCard";

const JOKER_IMAGE = require("@/assets/images/chorsipahi/joker.webp");

// Matches getMysteryMotion(): the selected card settles at board center, scaled 1.35.
const CENTERED_CARD_TOP = (MYSTERY_BOARD_HEIGHT - MYSTERY_CARD_HEIGHT) / 2 - 6;
const CENTERED_CARD_BOTTOM = CENTERED_CARD_TOP + MYSTERY_CARD_HEIGHT * 1.175;
const PLAQUE_GAP = 18;
const PLAQUE_TOP = CENTERED_CARD_BOTTOM + PLAQUE_GAP;

type InvestigationBoardProps = {
  round: number;
  gamePhase: string;
  investigationTargets: InvestigationTarget[];
  flippedStates: boolean[];
  clickedCards: boolean[];
  mysteryShuffleStep: number;
  mysteryRevealStep?: number;
  handleCardClick: (index: number, targetId?: string) => void;
  localPlayerIndex?: number;
};

export const InvestigationBoard = memo(
  ({
    round,
    gamePhase,
    investigationTargets,
    flippedStates,
    clickedCards,
    mysteryShuffleStep,
    mysteryRevealStep = 0,
    handleCardClick,
    localPlayerIndex,
  }: InvestigationBoardProps) => {
    if (__DEV__) {
      console.log("[CP_MYSTERY] Investigation board visible");
      console.log("[CP_MYSTERY] Old 4-card grid hidden");
    }

    const targets = investigationTargets.slice(0, 3);

    // Which mystery card was picked? Physical index = 10 + slot.
    const selectedIdx = targets.findIndex((_, i) => clickedCards[10 + i]);
    const selectedTarget = selectedIdx >= 0 ? targets[selectedIdx] : null;

    // Suspense beat: once the selected card rises to the center (step 2) a
    // plaque pops in below it showing the suspect's face + name while the
    // card is STILL covered — the identity is teased before the flip.
    const showPlaque = mysteryRevealStep >= 2 && !!selectedTarget;
    const isJoker = !selectedTarget?.playerName;
    const plaqueName = isJoker
      ? "The Joker"
      : selectedTarget?.playerName ?? "???";
    const plaqueImage = isJoker
      ? JOKER_IMAGE
      : playerImages[selectedTarget?.playerAvatarId ?? 1]?.src ??
        playerImages[1].src;
    const plaqueCaption = isJoker ? "Wild Card" : "The Suspect Is";

    return (
      <View className="items-center pt-1">
        <View
          style={{
            width: MYSTERY_BOARD_WIDTH,
            height: MYSTERY_BOARD_HEIGHT,
          }}
        >
          {targets.map((target, idx) => (
            <MysteryCard
              key={`${round}-${target.id}`}
              target={target}
              idx={idx}
              round={round}
              gamePhase={gamePhase}
              flippedStates={flippedStates}
              clickedCards={clickedCards}
              mysteryShuffleStep={mysteryShuffleStep}
              mysteryRevealStep={mysteryRevealStep}
              handleCardClick={handleCardClick}
              isLocalPlayer={
                localPlayerIndex != null &&
                target.playerIndex === localPlayerIndex
              }
            />
          ))}

          {showPlaque && selectedTarget && (
            <MotiView
              from={{ opacity: 0, scale: 0.5, translateY: 12 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{
                type: "spring",
                damping: 13,
                stiffness: 200,
                delay: CP_FLOW_TIMINGS.MYSTERY_RISE_MS,
              }}
              pointerEvents="none"
              style={{
                position: "absolute",
                top: PLAQUE_TOP,
                left: 0,
                right: 0,
                zIndex: 60,
                alignItems: "center",
              }}
            >
              <View className="flex-row items-center rounded-2xl border border-indigo-400/40 bg-[#0b0b18]/95 px-4 py-3 shadow-xl shadow-black">
                <Image
                  source={plaqueImage}
                  className="h-14 w-14 rounded-full border-2 border-indigo-400/60"
                  resizeMode="cover"
                />
                <View className="ml-3">
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    className="font-main-bold text-[10px] uppercase tracking-[2px] text-indigo-300"
                  >
                    {plaqueCaption}
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    className="font-main-bold text-[22px] text-white"
                  >
                    {plaqueName}
                  </Text>
                </View>
              </View>
            </MotiView>
          )}
        </View>
      </View>
    );
  },
);

InvestigationBoard.displayName = "InvestigationBoard";
