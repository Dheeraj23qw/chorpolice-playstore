import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 

} from 'react-native-reanimated';
import { hp, rf } from '@/utils/responsive'; // Using your specific utils

const RoundStartLoader = () => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image
          source={require('@/assets/modalImages/intro.png')}
          style={styles.portraitImage}
          resizeMode="contain" 
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)', // Deep dark overlay
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    height: hp(90), 
    width: '90%',
    borderRadius: rf(24), 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  portraitImage: {
    width: '100%',
    height: '100%',
  },
});

export default RoundStartLoader;