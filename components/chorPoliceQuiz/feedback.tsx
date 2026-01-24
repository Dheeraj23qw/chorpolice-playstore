import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  StatusBar,
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

  const themeColor = isCorrect ? "#10b981" : "#ef4444"; // Emerald vs Red

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setCanClose(true), 3000); // Reduced to 3s for better UX
      return () => clearTimeout(timer);
    } else {
      setCanClose(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>

      <Pressable 
        onPress={() => canClose && onClose()} 
        className="flex-1 items-center justify-center bg-black/60 px-6"
      >
        {/* 1. Main Metamorphism Glass Card */}
        <View 
          style={{ width: wp(85), paddingVertical: hp(4) }}
          className="bg-white/10 border border-white/20 rounded-[40px] items-center overflow-hidden shadow-2xl"
        >
          {/* 2. Color Glow Behind Content */}
          <View 
            style={{ 
              width: wp(40), 
              height: wp(40), 
              backgroundColor: themeColor,
              opacity: 0.15 
            }} 
            className="absolute rounded-full blur-3xl"
          />

          {/* 3. Feedback GIF with Cyber-Ring */}
          <View 
            style={{ width: wp(35), height: wp(35), borderColor: themeColor + '40' }}
            className="rounded-full border-2 p-2 mb-6 items-center justify-center bg-white/5"
          >
            <Image
              source={imageSource}
              style={{ width: wp(28), height: wp(28) }}
              className="rounded-full"
              resizeMode="contain"
            />
          </View>

          {/* 4. The Message */}
          <View className="px-6">
            <Text 
              style={{ fontSize: rf(1.2) }} 
              className="text-white/40 font-bold tracking-[3px] uppercase text-center mb-2"
            >
              {isCorrect ? "Mission Success" : "Mission Failed"}
            </Text>
            
            <Text 
              style={{ fontSize: rf(2.6), color: isCorrect ? '#d1fae5' : '#fee2e2' }} 
              className="font-black text-center leading-tight shadow-sm"
            >
              {feedbackMessage}
            </Text>
          </View>

          {/* 5. Contextual Close Indicator */}
          <View className="mt-8 h-8 justify-center">
            {canClose ? (
              <View className="flex-row items-center bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                <Text style={{ fontSize: rf(1.2) }} className="text-white/60 font-black uppercase tracking-widest">
                  Tap to Continue
                </Text>
              </View>
            ) : (
              <View className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                 <View style={{ width: '40%', backgroundColor: themeColor }} className="h-full" />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default FeedbackModal;