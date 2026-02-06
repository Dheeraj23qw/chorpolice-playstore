import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Text';
import { wp, hp, rf } from '@/utils/responsive';
import { XCircle } from 'lucide-react-native'; // Or any icon lib you use

interface AdPopupProps {
  isVisible: boolean;
  onClose: () => void;
  adImage?: string;
  adLink?: string;
}

export const AdPopup: React.FC<AdPopupProps> = ({ isVisible, onClose, adImage }) => {
  const [canClose, setCanClose] = useState(false);

  // Optional: Force user to look at ad for 3 seconds before close button appears
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setCanClose(true), 3000);
      return () => {
        clearTimeout(timer);
        setCanClose(false);
      };
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        
        {/* Ad Container */}
        <View className="w-full bg-[#18181b] border border-white/10 rounded-[32px] overflow-hidden">
          
          {/* Close Button Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-white/5">
            <Text className="text-white/40 font-main-bold uppercase tracking-widest text-[10px]">
              Sponsored Message
            </Text>
            
            {canClose ? (
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <XCircle size={28} color="#94a3b8" />
              </TouchableOpacity>
            ) : (
              <View className="bg-white/5 px-3 py-1 rounded-full">
                 <Text className="text-white/20 text-[10px]">Wait...</Text>
              </View>
            )}
          </View>

          {/* Ad Content */}
          <View className="p-4 items-center">
            <Image 
              source={{ uri: adImage || 'https://via.placeholder.com/300x400' }} 
              style={{ width: wp(80), height: hp(40), borderRadius: 20 }}
              resizeMode="cover"
            />
            
            <TouchableOpacity 
              className="mt-6 bg-indigo-600 w-full py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-main-bold uppercase tracking-widest">
                Learn More
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        <Text className="text-white/20 mt-6 text-[10px] uppercase tracking-tighter">
          Ad will help us keep the game free
        </Text>
      </View>
    </Modal>
  );
};