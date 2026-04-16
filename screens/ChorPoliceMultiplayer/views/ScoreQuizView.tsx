import React from "react";
import { View, ScrollView } from "react-native";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";

import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf, hp, wp } from "@/utils/responsive";

/**
 * Score Quiz View
 * - All players now see the question at the same time
 * - Only interaction is controlled by turn (my turn vs others)
 */
const ScoreQuizView = ({ g }: any) => {
  const players = ChorPoliceEngine.state.players;
  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) return null;

  const avatarId = currentPlayer.avatarId;
  const playerImage = playerImages[avatarId] || playerImages[1];

  const isMyTurn = currentPlayer.id === g.localPlayerId;

  /* ───────── FULL SCREEN POPUP ───────── */
  if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
    return (
      <DynamicOverlayPopUp
        isPopUp={g.isDynamicPopUp}
        mediaId={g.mediaId}
        mediaType={g.mediaType}
        closeVisibleDelay={3000}
        playerData={g.playerData}
      />
    );
  }

  /* ───────── QUIZ UI ───────── */
  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(5) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-5">
          {/* PLAYER INFO */}
          <View className="relative mb-10 items-center justify-center">
            <View
              style={{
                width: wp(60),
                height: hp(15),
                position: "absolute",
                top: 0,
              }}
              className="rounded-full bg-indigo-500/10 blur-3xl"
            />

            <PlayerInfo playerImage={playerImage} />

            <View className="mt-2 items-center">
              <Text
                style={{ fontSize: rf(2) }}
                className="font-main-bold text-white"
              >
                {currentPlayer.name}
              </Text>

              <Text style={{ fontSize: rf(1) }} className="text-white/40">
                Player {g.quizPlayerIndex + 1} of {players.length}
              </Text>
            </View>
          </View>

          {/* QUIZ BOX (always visible) */}
          <View className="rounded-[40px] border border-white/10 bg-white/[0.05] p-6">
            <QuizOptions
              playerName={currentPlayer.name}
              options={g.quizOptions}
              onOptionPress={g.handleQuizOption}
              isOptionDisabled={!isMyTurn || g.quizOptionDisabled}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ScoreQuizView;
