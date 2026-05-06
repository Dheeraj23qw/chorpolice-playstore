import React, { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { WinnerCard } from "./WinnerCard";
import { PlayerList } from "./PlayerList";
import { WaitingState } from "./WaitingState";
import { LeaderboardFooter } from "./LeaderboardFooter";
import { useLeaderboard } from "./useLeaderboard";
import { MatchReview } from "../thinkAndCountScreen/MatchReview";
import { translateToHindi } from "@/utils/QuestionTranslator";

interface Props {
  round: number;
  data: any[] | undefined;
  roundProgress: Record<string, any>;
  onNext: () => void;
  isHost: boolean;
  isLastRound: boolean;
  totalPot: number;
  localPlayerId?: string;
  timeLeft: number;
}

export const QuizLeaderboard: React.FC<Props> = (props) => {
  const { winner, others, allFinished, getAvatarSource } = useLeaderboard(
    props.data,
    props.roundProgress,
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View className="flex-1 px-4 py-2">
      {/* 🔥 Fully Transparent Container */}
      <View className="flex-1">
        {/* STATE */}
        <View className="flex-1">
          {winner && allFinished ? (
            <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
              <WinnerCard
                winner={winner}
                round={props.round}
                totalPot={props.totalPot}
                isLastRound={props.isLastRound}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                isMe={winner.id === props.localPlayerId}
                getAvatarSource={getAvatarSource}
              />
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInUp}
              exiting={FadeOutUp}
              className="flex-1 justify-center"
            >
              <WaitingState />
            </Animated.View>
          )}

          {/* Player list stays lightweight */}
          <PlayerList
            players={others}
            round={props.round}
            expandedId={expandedId}
            toggleExpand={toggleExpand}
            allFinished={allFinished}
            localPlayerId={props.localPlayerId}
          />
        </View>

        {/* Footer */}
        <LeaderboardFooter
          isHost={props.isHost}
          allFinished={allFinished}
          isLastRound={props.isLastRound}
          onNext={props.onNext}
        />
      </View>
    </View>
  );
};
