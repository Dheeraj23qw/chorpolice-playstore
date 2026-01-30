import React, { memo, useCallback, useState } from "react";
import { ScrollView, StatusBar, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSortedScores } from "@/hooks/useSortedScores";
import { rf, hp, wp } from "@/utils/responsive";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

// Redesigned Components (Ensure these use Tailwind/Glass styles)
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { useSelector } from "react-redux";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";


const REWARD_POINTS = 1000;
const POPUP_TIMEOUT = 5000;

const ChorPoliceResult = () => {
  const insets = useSafeAreaInsets();
  const {
    sortedScores,
    playerNames,
    selectedImages,
    handlePlayAgain,
    handleBack,
    handleShare,
    isButtonDisabled,
    winnerName,
    winnerImage,
    winnerPlayerImageType,
    winner,
  } = useSortedScores();

  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);

  const onPlayAgain = useCallback(handlePlayAgain, [handlePlayAgain]);
  const onBack = useCallback(handleBack, [handleBack]);
  const onShare = useCallback(handleShare, [handleShare]);

  const playerNamess = useSelector(selectPlayerNames).map(
    (player) => player.name,
  );

  const { handleExitGame } = useRajaMantriGame({ playerNames : playerNamess });



  return (
    <View className="flex-1 bg-[#09090b]">
      {/* Notch Safety: Translucent status bar + Manual Insets */}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background Metamorphism Glows */}
      <View
        style={{
          width: wp(110),
          height: wp(110),
          top: -hp(10),
          right: -wp(20),
        }}
        className="absolute bg-indigo-600/10 rounded-full blur-[120px]"
      />
      <View
        style={{
          width: wp(100),
          height: wp(100),
          bottom: -hp(15),
          left: -wp(20),
        }}
        className="absolute bg-purple-600/10 rounded-full blur-[100px]"
      />

      {isDynamicPopUp && winnerImage && winnerPlayerImageType ? (
        /* Reward Overlay State */
        <View className="flex-1">
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={12}
            mediaType="gif"
            closeVisibleDelay={POPUP_TIMEOUT}
            playerData={{
              image: winnerImage,
              message: `${winnerName}, you won ${REWARD_POINTS} coins!`,
              imageType: winnerPlayerImageType,
            }}
          />
        </View>
      ) : (
        /* Main Result Screen */
        <View
          style={{
            flex: 1,
            paddingTop: insets.top || hp(2),
            paddingBottom: insets.bottom || hp(2),
          }}
        >
          {/* Header Title */}
          <View className="px-6 py-4">
            <Text
              style={{ fontSize: rf(1.2) }}
              className="text-white/30 font-black uppercase tracking-[5px]"
            >
              Final Briefing
            </Text>
            <Text
              style={{ fontSize: rf(3.5) }}
              className="text-white font-black italic -mt-1"
            >
              RESULTS
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(5) }}
          >
            {/* 1. Winner Spotlight */}
            <View className="px-6 mb-6">
              <View className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden py-6">
                <MemoizedWinnerSection
                  winnerName={winnerName}
                  winnerImage={winnerImage}
                  winner={winner}
                />
              </View>
            </View>

            {/* 2. Leaderboard Glass List */}
            <View className="px-6 mb-8">
              <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-4">
                <View className="flex-row items-center mb-4 px-2">
                  <View className="h-2 w-2 rounded-full bg-indigo-500 mr-2" />
                  <Text
                    style={{ fontSize: rf(1) }}
                    className="text-white/40 font-bold uppercase tracking-widest"
                  >
                    Squad Rankings
                  </Text>
                </View>
                <MemoizedLeaderboard
                  sortedScores={sortedScores}
                  playerNames={playerNames}
                  selectedImages={selectedImages}
                />
              </View>
            </View>

            {/* 3. Action Terminal */}
            <View className="px-6">
              <MemoizedActionButtons
                handlePlayAgain={onPlayAgain}
                handleBack={onBack}
                handleShare={onShare}
                isButtonDisabled={isButtonDisabled}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Memoization remains for performance
const MemoizedWinnerSection = memo(WinnerSection);
const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedActionButtons = memo(ActionButtons);

export default memo(ChorPoliceResult);
