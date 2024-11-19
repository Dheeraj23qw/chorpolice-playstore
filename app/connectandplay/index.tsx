import { View, Text } from 'react-native'
import React, { useLayoutEffect } from 'react'
import ConnectAndplayScreen from '@/screens/Connect&playScreen/ConnectAndplayScreen';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

export default function ConnectAndPlayRoute() {
    const navigation = useNavigation<NavigationProp<any>>();

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);
  
    return <ConnectAndplayScreen/>;
}