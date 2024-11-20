import { View, Text } from 'react-native'
import React, { useLayoutEffect } from 'react'
import ConnectAndplayScreen from '@/screens/Connect&playScreen/ConnectAndplayScreen';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import ImageSelectScreen from '@/screens/QuizScreen/imageSelect';

export default function QuizgameLevelRoute() {
    const navigation = useNavigation<NavigationProp<any>>();

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);
  
    return <ImageSelectScreen/>;
}