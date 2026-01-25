import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { rf, hp, wp } from "@/utils/responsive";

interface FeedbackModalProps {
  feedbackMessage: string;
  isCorrect: boolean;
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedbackMessage,
  isCorrect,
  visible,
  onClose,
}) => {
  const [canClose, setCanClose] = useState(false);

  const imageSource = isCorrect
    ? require("../../assets/gif/quiz/laugh.gif")
    : require("../../assets/gif/quiz/weep.gif");

  const themeColor = isCorrect ? "#10b981" : "#ef4444"; 

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setCanClose(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable 
        onPress={() => canClose && onClose()} 
        className="flex-1 items-center justify-center bg-black/80 px-6"
      >
        {/* --- MAIN GLOSSY CARD --- */}
        <View 
          style={{ width: wp(88), paddingVertical: hp(5) }}
          className="bg-white/[0.08] border-2 border-white/20 rounded-[48px] items-center overflow-hidden shadow-2xl"
        >
          {/* 1. Top Specular Shine (The 'Gloss' Line) */}
          <View className="absolute top-0 left-10 right-10 h-[2px] bg-white/30 rounded-full" />

          {/* 2. Radial Refraction Glow (Behind the Image) */}
          <View 
            style={{ 
              width: wp(60), 
              height: wp(60), 
              backgroundColor: themeColor,
              opacity: 0.1,
              top: -wp(10)
            }} 
            className="absolute rounded-full blur-[50px]"
          />

          {/* 3. Image Container with Glass Bevel */}
          <View 
            style={{ 
              width: wp(42), 
              height: wp(42), 
              borderColor: themeColor + '60',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}
            className="rounded-full border-[3px] p-1 mb-8 items-center justify-center shadow-lg"
          >
            <View className="absolute inset-0 rounded-full border border-white/10" />
            <Image
              source={imageSource}
              style={{ width: wp(32), height: wp(32) }}
              className="rounded-full"
              resizeMode="contain"
            />
          </View>

          {/* 4. Text Content */}
          <View className="px-8 items-center">
            <Text 
              style={{ fontSize: rf(1.4), letterSpacing: 4 }} 
              className="text-white/30 font-black uppercase text-center mb-3"
            >
              {isCorrect ? "Mission Complete" : "System Error"}
            </Text>
            
            <View className="h-[1px] w-12 bg-white/10 mb-4" />
            
            <Text 
              style={{ fontSize: rf(2.8), color: isCorrect ? '#bef264' : '#fca5a5' }} 
              className="font-black text-center italic tracking-tight leading-tight"
            >
              {feedbackMessage.toUpperCase()}
            </Text>
          </View>

          {/* 5. Progress / Close Indicator */}
          <View className="mt-10 h-10 justify-center">
            {canClose ? (
              <View className="flex-row items-center bg-white/10 px-6 py-2 rounded-2xl border border-white/20">
                <Text style={{ fontSize: rf(1.3) }} className="text-white font-bold uppercase tracking-widest">
                  Tap to Dismiss
                </Text>
              </View>
            ) : (
              <View className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <View 
                   style={{ 
                     width: '60%', 
                     backgroundColor: themeColor,
                     shadowColor: themeColor,
                     shadowRadius: 10,
                     shadowOpacity: 0.8
                    }} 
                   className="h-full rounded-full" 
                 />
              </View>
            )}
          </View>

          {/* 6. Bottom Edge Reflection */}
          <View className="absolute bottom-0 left-0 right-0 h-[4px] bg-black/20" />
        </View>
      </Pressable>
    </Modal>
  );
};

export default FeedbackModal;