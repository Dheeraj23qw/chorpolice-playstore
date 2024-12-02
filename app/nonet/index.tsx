import React, { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { NoConnectionScreen } from '@/screens/NoConnectionScreen/nonet';

export default function NoConnectionRoute() {
  const navigation = useNavigation<NavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return <NoConnectionScreen/>
}