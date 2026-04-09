import React, { useEffect } from "react";
import { View, ScrollView, Alert, BackHandler, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    <View className="flex-1 bg-black">
      {/* 🌌 CONSISTENT BACKGROUND IMAGE */}
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      {/* 🌑 DARK OVERLAY */}
      <View className="absolute h-full w-full bg-black/70" />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
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
          <View className="flex-1">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(5) }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-1 px-6 pt-5">
                {/* Player Stage */}
                <View className="relative mb-10 items-center justify-center">
                  {/* Subtle spotlight glow behind player info */}
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
                </View>

                {/* Glass Interface */}
                <View
                  className="relative w-full overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.05]"
                  style={{
                    paddingVertical: hp(4),
                    paddingHorizontal: wp(2),
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.5,
                    shadowRadius: 30,
                    elevation: 10,
                  }}
                >
                  {/* Top specular shine */}
                  <View className="absolute left-0 right-0 top-0 h-[1px] bg-white/30" />

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
    </View>
  );
};

export default ChorPoliceQuiz;
