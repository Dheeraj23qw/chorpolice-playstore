import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import PlayerNameScreen from '@/screens/playerNameScreen/playerName';

export default function PlayerNameRoute() {
  const navigation = useNavigation<NavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <PlayerNameScreen />;
}