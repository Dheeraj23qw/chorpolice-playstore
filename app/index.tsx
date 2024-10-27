import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import PlayerNameScreen from '@/screens/playerNameScreen/playerName';
import {
  loadSounds,
  playSound,
  stopQuizSound,
  unloadSounds,
} from "@/redux/slices/soundSlice";
import VideoPlayerComponent from '@/components/RajamantriGameScreen/videoPlayer';

export default function Index() {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load sounds
    dispatch(loadSounds() as any).then(() => dispatch(playSound("quiz")));
    return () => {
      dispatch(stopQuizSound());
      dispatch(unloadSounds());
    };
  }, [dispatch]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleVideoEnd = () => {
    setIsLoading(false); // Hide splash screen
  };

  if (isLoading) {
    return <VideoPlayerComponent videoIndex={1} onVideoEnd={handleVideoEnd} />;
  }

  return <PlayerNameScreen />;
}
