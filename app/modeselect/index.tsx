import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import GameModeScreen from '@/screens/GameModeScreen/gameModeScreen';

export default function ModeSelectRoute() {
  const navigation = useNavigation<NavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <GameModeScreen />;
}