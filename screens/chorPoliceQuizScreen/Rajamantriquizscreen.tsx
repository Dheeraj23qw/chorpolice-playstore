import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { SafeAreaView, View, ImageBackground, BackHandler, StatusBar } from 'react-native';
import ScreenHeader from "@/components/_screenHeader";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from './quizStyle';
import { useRouter } from 'expo-router';
import PlayerInfo from '@/components/chorPoliceQuiz/playerInfo';
import FeedbackMessage from '@/components/chorPoliceQuiz/feedback';
import QuizOptions from '@/components/chorPoliceQuiz/option';
import useQuizLogic from '@/hooks/useQuizLogic';
import { responsiveHeight } from 'react-native-responsive-dimensions';

const ChorPoliceQuiz: React.FC = () => {
  const router = useRouter();

  const {
    currentPlayer,
    playerImage,
    feedbackMessage,
    isCorrect,
    options,
    isContentVisible,
    handleOptionPress,
    moveToNextPlayer,
    isOptionDisabled,
  } = useQuizLogic(router);

  // Memoize components that don't need to re-render often
  const MemoizedPlayerInfo = useMemo(
    () => <PlayerInfo playerImage={playerImage} />,
    [playerImage]
  );

  const MemoizedFeedbackMessage = useMemo(
    () => (
      <FeedbackMessage
        feedbackMessage={feedbackMessage}
        isCorrect={isCorrect}
      />
    ),
    [feedbackMessage, isCorrect]
  );

  const MemoizedQuizOptions = useMemo(
    () =>
      isContentVisible && (
        <QuizOptions
          playerName={currentPlayer.name}
          options={options}
          onOptionPress={handleOptionPress}
          isOptionDisabled={isOptionDisabled}
        />
      ),
    [isContentVisible, currentPlayer.name, options, handleOptionPress, isOptionDisabled]
  );

  return (
    <SafeAreaView style={globalstyles.container}>
      <StatusBar backgroundColor="#8E5DE9" barStyle="dark-content" />
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <ScreenHeader name="Quiz Time" showBackButton={false} />
      </View>

      <View style={[globalstyles.Container2, { flex: 10 }]}>
      <View style={chorPoliceQuizstyles.overlay} />

        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={chorPoliceQuizstyles.imageBackground}
          resizeMode="cover"
        >
          {/* Overlay */}
          <View style={chorPoliceQuizstyles.overlay} />


          <View style={chorPoliceQuizstyles.quizContainer}>
            {MemoizedPlayerInfo}
            {MemoizedFeedbackMessage}
            {MemoizedQuizOptions}
          </View>
        </ImageBackground>
      </View>

    
    </SafeAreaView>
  );
};

export default React.memo(ChorPoliceQuiz);
