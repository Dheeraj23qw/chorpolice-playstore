import React, { useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { rf } from '@/utils/responsive';
import { Share2, RefreshCw } from 'lucide-react-native';
import { Text } from '../Text';

interface ActionButtonsProps {
  handlePlayAgain: () => void;
  handleShare: () => void;
  isButtonDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  handlePlayAgain,
  handleShare,
  isButtonDisabled,
}) => {

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scaleAnim, {
      toValue: value,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View className="w-full px-6 pt-6 pb-12 items-center">

      <Animated.View
        style={{ transform: [{ scale: scaleAnim }], width: '100%' }}
      >
        <Pressable
          disabled={isButtonDisabled}
          onPressIn={() => animateTo(0.97)}
          onPressOut={() => animateTo(1)}
          onPress={handlePlayAgain}
          className={`
            rounded-3xl h-[64px] flex-row items-center justify-center
            ${isButtonDisabled
              ? 'bg-indigo-400/40'
              : 'bg-indigo-500'}
          `}
          style={{
            shadowColor: '#6366f1',
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <RefreshCw color="white" size={rf(2)} strokeWidth={2.5} />

          <Text
            style={{ fontSize: rf(1.8) }}
            className="text-white font-main-bold uppercase tracking-[3px] ml-3"
          >
            Play Again
          </Text>
        </Pressable>
      </Animated.View>

      {/* Divider */}
      <View className="flex-row items-center my-8 w-full px-6">
        <View className="h-[1px] flex-1 bg-white/10" />
        <Text
          style={{ fontSize: rf(1) }}
          className="mx-4 text-white/30 font-main-md tracking-widest uppercase"
        >
          or
        </Text>
        <View className="h-[1px] flex-1 bg-white/10" />
      </View>

      <Pressable
        disabled={isButtonDisabled}
        onPress={handleShare}
        style={({ pressed }) => ({
          opacity: isButtonDisabled ? 0.3 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
        className="
          w-full h-[56px] rounded-2xl
          flex-row items-center justify-center
          bg-white/5 border border-white/10
        "
      >
        <Share2 color="#c7d2fe" size={rf(1.6)} />

        <Text
          style={{ fontSize: rf(1.3) }}
          className="text-indigo-200 font-main-bold ml-2 tracking-widest uppercase"
        >
          Share Result
        </Text>
      </Pressable>

      <View className="absolute -bottom-16 w-[70%] h-24 bg-indigo-600/15 blur-3xl rounded-full" />
    </View>
  );
};
