import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { FontAwesome5 } from '@expo/vector-icons';

interface WelcomeProps {
  isVisible: boolean;
  onClaim: () => void;
  onGoToSpin: () => void;
}

export const WelcomeBonusModal: React.FC<WelcomeProps> = ({ isVisible, onClaim, onGoToSpin }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black/90 justify-center items-center px-8">
        <View className="bg-zinc-900 border border-indigo-500/30 p-8 rounded-[40px] items-center w-full">
          
          <View className="bg-indigo-600/20 p-6 rounded-full mb-6">
            <FontAwesome5 name="gift" size={50} color="#818cf8" />
          </View>

          <Text className="text-white text-2xl font-main-bold text-center mb-2">
            CONGRATULATIONS!
          </Text>
          
          <Text className="text-white/60 text-center font-main-bold mb-8 leading-6">
            You received <Text className="text-yellow-500">1000 COINS</Text> from{"\n"}
            Chor Police Team!
          </Text>

          {/* Action Button 1: Just Claim */}
          <TouchableOpacity 
            onPress={onClaim}
            className="bg-indigo-600 w-full py-4 rounded-2xl items-center mb-3"
          >
            <Text className="text-white font-main-bold uppercase tracking-widest">
              Claim Now
            </Text>
          </TouchableOpacity>

          {/* Action Button 2: Go to Spin */}
          <TouchableOpacity 
            onPress={onGoToSpin}
            className="border border-white/10 w-full py-4 rounded-2xl items-center"
          >
            <Text className="text-white/60 font-main-bold uppercase tracking-widest">
              Spin the Wheel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};