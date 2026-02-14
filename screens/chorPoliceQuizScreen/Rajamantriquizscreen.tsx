import React, { useEffect } from "react";
import { View, ScrollView, Alert, BackHandler, } from "react-native";
import {  useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { wp, hp } from "@/utils/responsive";

// Hooks & Redux
import useQuizLogic from "@/hooks/useQuizLogic";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";

// Components
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";

const ChorPoliceQuiz: React.FC = () => {
  const router = useRouter();

  const {
    currentPlayer,
    playerImage,
    options,
    handleOptionPress,
    isOptionDisabled,
    isPopUp,
    mediaType,
    mediaId,
    currentPlayerImage,
    currentPlayerImageType,
    feedbackMessage,
  } = useQuizLogic(router);

  const playerNames = useSelector(selectPlayerNames).map((p) => p.name);
  const { handleExitGame } = useRajaMantriGame({ playerNames });

  // Handle back press
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        { text: "Cancel", style: "cancel" },
        { text: "YES", onPress: handleExitGame },
      ]);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => subscription.remove();
  }, []);
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-[#020205] relative"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          width: wp(120),
          height: wp(120),
          top: -hp(15),
          left: -wp(20),
          position: "absolute",
        }}
        className="bg-indigo-600/10 rounded-full blur-[110px]"
      />
      <View
        style={{
          width: wp(100),
          height: wp(100),
          bottom: -hp(10),
          right: -wp(30),
          position: "absolute",
        }}
        className="bg-purple-900/10 rounded-full blur-[90px]"
      />

      {isPopUp && mediaId && mediaType ? (
        <DynamicOverlayPopUp
          isPopUp={isPopUp}
          mediaId={mediaId}
          mediaType={mediaType}
          closeVisibleDelay={3000}
          playerData={{
            image: currentPlayerImage,
            message: feedbackMessage,
            imageType: currentPlayerImageType,
          }}
        />
      ) : (
        // QUIZ LAYOUT
        <View className="flex-1 ">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(5) }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-5">
              {/* Player Stage */}
              <View className="items-center justify-center mb-10  relative">
                <View
                  style={{
                    width: wp(60),
                    height: hp(15),
                    position: "absolute",
                    top: 0,
                  }}
                  className="bg-indigo-500/5 blur-3xl rounded-full"
                />
                <PlayerInfo playerImage={playerImage} />
              </View>

              {/* Glass Interface */}
              <View
                className="w-full rounded-[40px] bg-white/[0.04] border border-white/10 overflow-hidden relative"
                style={{
                  paddingVertical: hp(4),
                  paddingHorizontal: wp(2),
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.4,
                  shadowRadius: 25,
                  elevation: 10,
                }}
              >
                <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
                <QuizOptions
                  playerName={currentPlayer.name}
                  options={options}
                  onOptionPress={handleOptionPress}
                  isOptionDisabled={isOptionDisabled}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default ChorPoliceQuiz;
