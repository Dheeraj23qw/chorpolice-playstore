import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View, BackHandler, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSortedScores } from "@/hooks/useSortedScores";
import { rf, hp, wp } from "@/utils/responsive";

// Redesigned Components
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { ActionButtons } from "@/components/leaderBoardScreen/ActionButtons";
import { useSelector } from "react-redux";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { Text } from "@/components/Text";
import { VictoryCelebration } from "@/components/VictoryCelebration";

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
    [playerNamess],
  );

  const { handleExitGame } = useRajaMantriGame({
    playerNames: playerNamesList,
  });
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Hold on!",
        "Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: handleExitGame },
        ],
        { cancelable: true },
      );
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [handleExitGame]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* 🌌 CONSISTENT BACKGROUND IMAGE */}
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      {/* 🌑 DARK OVERLAY */}
      <View className="absolute h-full w-full bg-black/75" />

      {/* 🏆 CELEBRATION LAYER (Ensure it is on top) */}
      {showCelebration && (
        <View className="absolute inset-0 z-[100]" pointerEvents="none">
          <VictoryCelebration
            type="GOLD"
            intensity="MEDIUM"
            duration={4500}
            onComplete={() => setShowCelebration(false)}
          />
        </View>
      )}

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
            className="font-main-bold uppercase tracking-[5px] text-white/40"
          >
            Final Briefing
          </Text>
          <Text
            style={{ fontSize: rf(3.5) }}
            className="mt-1 font-main-bold text-white"
          >
            RESULTS
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hp(5) }}
        >
          {/* 1. Winner Spotlight */}
          <View className="mb-6 px-6">
            <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05] py-6 shadow-2xl backdrop-blur-3xl">
              <MemoizedWinnerSection
                winnerName={winnerName}
                winnerImage={winnerImage}
                winner={winner}
              />
            </View>
          </View>

          {/* 2. Leaderboard Glass List */}
          <View className="mb-8 px-6">
            <View className="rounded-[32px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <View className="mb-4 flex-row items-center px-2">
                <View className="mr-2 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                <Text
                  style={{ fontSize: rf(1) }}
                  className="font-main-bold uppercase tracking-widest text-white/40"
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
