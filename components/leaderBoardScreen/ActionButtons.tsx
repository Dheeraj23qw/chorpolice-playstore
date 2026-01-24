import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { rf, hp } from '@/utils/responsive';

interface ActionButtonsProps {
  handlePlayAgain: () => void;
  handleBack: () => void;
  handleShare: () => void;
  isButtonDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  handlePlayAgain, 
  handleBack, 
  handleShare, 
  isButtonDisabled 
}) => {
  
  const ButtonWrapper = ({ onPress, label, isPrimary = false, isDanger = false }: any) => (
    <View className="flex-1 mx-2"> 
      <Pressable
        onPress={onPress}
        disabled={isButtonDisabled}
        style={({ pressed }) => [
          {
            // Large vertical padding ensures the text has plenty of space
            paddingVertical: hp(2.5), 
            transform: [{ scale: pressed ? 0.94 : 1 }],
            opacity: isButtonDisabled ? 0.4 : 1,
          }
        ]}
        // Metamorphism Styling: Thicker borders and stronger glass effect
        className={`
          rounded-[24px] items-center justify-center overflow-hidden border-2
          ${isPrimary ? 'bg-indigo-600/40 border-indigo-400/60' : 'bg-white/10 border-white/20'}
          ${isDanger ? 'border-red-500/50 bg-red-500/10' : ''}
        `}
      >
        {/* Top Shine Layer */}
        <View className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/20" />

        <Text 
          style={{ fontSize: rf(1.6) }} // Bigger font for better legibility
          className={`font-black uppercase tracking-widest ${isPrimary ? 'text-white' : 'text-white/80'}`}
        >
          {label}
        </Text>

        {/* Internal Glow for tactile feel */}
        {!isButtonDisabled && (
          <View className="absolute inset-0 bg-white/5" />
        )}
      </Pressable>
    </View>
  );

  return (
    <View className="w-full px-4 py-6">
      {/* Visual divider to separate from content above */}
      <View className="h-[1px] w-full bg-white/5 mb-6" />

      <View className="flex-row justify-between items-center">
        {/* Home Button */}
        <ButtonWrapper 
          label="Home" 
          onPress={handleBack} 
          isDanger={true}
        />
        
        {/* Share Button */}
        <ButtonWrapper 
          label="Share" 
          onPress={handleShare} 
        />
        
        {/* Retry Button */}
        <ButtonWrapper 
          label="Retry" 
          onPress={handlePlayAgain} 
          isPrimary={true}
        />
      </View>
    </View>
  );
};