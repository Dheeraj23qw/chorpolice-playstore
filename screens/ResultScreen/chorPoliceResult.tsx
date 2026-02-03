import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, View, BackHandler, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSortedScores } from "@/hooks/useSortedScores";
import { rf, hp, wp } from "@/utils/responsive";

// Redesigned Components (Ensure these use Tailwind/Glass styles)
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { useDispatch, useSelector } from "react-redux";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { Text } from "@/components/Text";

const ChorPoliceResult = () => {
  const insets = useSafeAreaInsets();

  const {
    sortedScores,
    playerNames,
    selectedImages,
    handleShare,
    isButtonDisabled,
    winnerName,
    winnerImage,
    winner,
    handlePlayAgain,
  } = useSortedScores();

  const playerNamess = useSelector(selectPlayerNames);

  const playerNamesList = useMemo(
    () => playerNamess.map((player) => player.name),
    [playerNamess]
  );

  const { handleExitGame } = useRajaMantriGame({
    playerNames: playerNamesList,
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Hold on!",
        "Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: handleExitGame },
        ],
        { cancelable: true }
      );
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, [handleExitGame]);

  return (
    <View className="flex-1 bg-[#09090b]">
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
            // Swapped font-black for font-main-bold + tracking
            className="text-white/30 font-main-bold uppercase tracking-[5px]"
          >
            Final Briefing
          </Text>
          <Text
            style={{ fontSize: rf(3.5) }}
            // Swapped font-black for font-main-bold + italic
            className="text-white font-main-bold mt-1"
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
                  // Swapped font-bold for font-main-bold
                  className="text-white/40 font-main-bold uppercase tracking-widest"
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
              handlePlayAgain={handlePlayAgain}
              handleShare={handleShare}
              isButtonDisabled={isButtonDisabled}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const MemoizedWinnerSection = memo(WinnerSection);
const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedActionButtons = memo(ActionButtons);

export default memo(ChorPoliceResult);