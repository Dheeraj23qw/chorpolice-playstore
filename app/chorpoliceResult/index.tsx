import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import ChorPoliceResult from '@/screens/ResultScreen/chorPoliceResult';

export default function ChorPoliceQuizRoute() {
  const navigation = useNavigation<NavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <ChorPoliceResult />;
}