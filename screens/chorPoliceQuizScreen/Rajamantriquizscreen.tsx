import React from "react";
import { View, Text,ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { wp, hp, rf } from "@/utils/responsive";

// Logic & Components
import useQuizLogic from "@/hooks/useQuizLogic";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import PlayerInfo from "@/components/chorPoliceQuiz/playerInfo";
import QuizOptions from "@/components/chorPoliceQuiz/option";
import useRajaMantriGame from "@/hooks/useRajaMantriGame/useRajaMantriGame";
import { useSelector } from "react-redux";

import {
  selectPlayerNames,
} from "@/redux/selectors/playerDataSelector";

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


   const playerNames = useSelector(selectPlayerNames).map(
      (player) => player.name,
    );
  
    const {
      handleExitGame,
    } = useRajaMantriGame({ playerNames });


 

  return (
    <View className="flex-1 bg-[#020205]">

      {/* --- LAYER 1: VIRTUAL SPACE --- */}
      <View 
        style={{ width: wp(120), height: wp(120), top: -hp(15), left: -wp(20), position: 'absolute' }}
        className="bg-indigo-600/10 rounded-full blur-[110px]" 
      />
      <View 
        style={{ width: wp(100), height: wp(100), bottom: -hp(10), right: -wp(30), position: 'absolute' }}
        className="bg-purple-900/10 rounded-full blur-[90px]" 
      />

      {isPopUp ? (
        <View className="flex-1 items-center justify-center">
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
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(5) }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6">
              
            

              {/* --- LAYER 3: PLAYER STAGE --- */}
              <View className="items-center justify-center mb-10">
                {/* A light-beam effect behind the player */}
                <View 
                  style={{ width: wp(60), height: hp(15), position: 'absolute', top: 0 }}
                  className="bg-indigo-500/5 blur-3xl rounded-full"
                />
                <PlayerInfo playerImage={playerImage} />
              </View>

              {/* --- LAYER 4: GLASS INTERFACE --- */}
              <View 
                className="w-full rounded-[40px] bg-white/[0.04] border border-white/10 overflow-hidden"
                style={{
                  paddingVertical: hp(4),
                  paddingHorizontal: wp(2),
                  // Using inline styles to avoid NativeWind TS issues with complex shadows
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.4,
                  shadowRadius: 25,
                  elevation: 10
                }}
              >
                {/* The "Frosted" Bevel */}
                <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
                
                <View className="w-full">
                  <QuizOptions
                    playerName={currentPlayer.name}
                    options={options}
                    onOptionPress={handleOptionPress}
                    isOptionDisabled={isOptionDisabled}
                  />
                </View>
              </View>

           

            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default ChorPoliceQuiz;