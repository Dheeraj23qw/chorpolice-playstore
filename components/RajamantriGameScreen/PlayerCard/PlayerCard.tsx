import React, { memo, useCallback } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { useSelector } from "react-redux";

import { CP_FLOW_TIMINGS } from "@/constants/cpFlowTimings";
import { selectSelectedImages } from "@/redux/selectors/playerDataSelector";
import { RootState } from "@/redux/store";

import { PlayerCardBackFace } from "./PlayerCardBackFace";
import { PlayerCardFrontFace } from "./PlayerCardFrontFace";
import { ResultBadge } from "./ResultBadge";
import { PlayerCardProps } from "./types";

const PlayerCardComponent: React.FC<PlayerCardProps> = ({
  index,
  role,
  playerName,
  flipped,
  clicked,
  isCorrect = false,
  onClick,
  animatedStyle,
  onBounceEffect,
  isHighlight = false,
  disabled = false,
  highlightColor,
}) => {
  const selectedImages = useSelector(selectSelectedImages);
  const playerImages = useSelector(
    (state: RootState) => state.playerImages.images,
  );

  const handlePress = useCallback(() => {
    onBounceEffect(index);
    onClick(index);
  }, [index, onBounceEffect, onClick]);

  const flipDuration = CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS;
  const faceFadeDuration = CP_FLOW_TIMINGS.CARD_FLIP_DURATION_MS / 2;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || flipped || clicked}
      activeOpacity={0.92}
      className="flex-1"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            borderBottomWidth: flipped ? 1 : 6,
            borderRightWidth: 1,
            borderBottomColor: flipped ? "rgba(255,255,255,0.08)" : "#1e1b4b",
            borderRightColor: "rgba(255,255,255,0.12)",
          },
        ]}
        className={`flex-1 overflow-hidden rounded-[30px] border-l border-t ${
          flipped
            ? "border-white/25 bg-[#050507]"
            : "border-white/10 bg-[#0b0b12]"
        } ${clicked && !flipped ? "opacity-40" : "opacity-100"}`}
      >
        <View className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40" />
        <View className="absolute inset-[1px] rounded-[28px] border border-indigo-400/20" />

        <MotiView
          animate={{ rotateY: flipped ? "180deg" : "0deg" }}
          transition={{
            type: "timing",
            duration: flipDuration,
          }}
          style={{ flex: 1 }}
        >
          <View className="flex-1">
          <MotiView
            animate={{ opacity: flipped ? 0 : 1 }}
            transition={{
              type: "timing",
              duration: faceFadeDuration,
            }}
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              zIndex: flipped ? 0 : 1,
            }}
            className="overflow-hidden rounded-[30px]"
          >
            <PlayerCardFrontFace
              index={index}
              playerName={playerName}
              isHighlight={isHighlight}
              highlightColor={highlightColor}
              selectedImages={selectedImages}
              playerImages={playerImages}
            />

            <ResultBadge clicked={clicked} flipped={flipped} />

            {!flipped && (
              <View className="absolute right-3 top-3">
                <View className="h-3 w-3 rounded-full bg-indigo-400 shadow-lg" />
                <View className="absolute inset-0 rounded-full border border-white/40" />
              </View>
            )}
          </MotiView>

          <MotiView
            animate={{ opacity: flipped ? 1 : 0 }}
            transition={{
              type: "timing",
              duration: faceFadeDuration,
            }}
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              transform: [{ rotateY: "180deg" }],
              zIndex: flipped ? 1 : 0,
            }}
            className="overflow-hidden rounded-[30px]"
          >
            <PlayerCardBackFace
              role={role}
              playerName={playerName}
              clicked={clicked}
              isCorrect={isCorrect}
            />
          </MotiView>
          </View>
        </MotiView>
      </Animated.View>
    </TouchableOpacity>
  );
};

PlayerCardComponent.displayName = "PlayerCard";

export default memo(PlayerCardComponent);
