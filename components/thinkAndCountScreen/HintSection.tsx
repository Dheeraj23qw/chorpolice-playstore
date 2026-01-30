import React, { memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { hp } from "@/utils/responsive";
import { Lightbulb } from "lucide-react-native";

interface HintSectionProps {
  hint?: string;
  isVisible: boolean;
  onClose: () => void;   // only close
  onNext: () => void;    // move to next question
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const HintSection: React.FC<HintSectionProps> = ({
  hint = "No hint available.",
  isVisible,
  onClose,
  onNext
}) => {
 return (
  <Modal
    animationType="fade"
    transparent
    visible={isVisible}
    statusBarTranslucent
    presentationStyle="overFullScreen"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center px-6 bg-black/95">
      
      {/* Background Press Area */}
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
        onPress={onClose}
      />

      {/* Modal Card */}
      <View
        className="w-full bg-[#161b22] rounded-[40px] border border-white/10 shadow-2xl"
        style={{ maxHeight: SCREEN_HEIGHT * 0.7 }}
      >
        {/* Icon Header */}
        <View className="items-center -mt-10">
          <View className="bg-[#1d242e] p-5 rounded-full border-[4px] border-[#0d1117]">
            <Lightbulb size={36} color="#fbbf24" fill="#fbbf24" />
          </View>
        </View>

        <View className="px-6 pt-4 pb-8">
          {/* Title */}
          <View className="items-center mb-6">
            <Text className="text-white text-2xl font-black tracking-widest uppercase">
              Hint
            </Text>
            <View className="h-1 w-8 bg-amber-400 rounded-full mt-1" />
          </View>

          {/* Hint Content */}
          <View className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
            <ScrollView
              showsVerticalScrollIndicator
              indicatorStyle="white"
              style={{ maxHeight: hp(30) }}
              contentContainerStyle={{ padding: 25 }}
            >
              <Text className="text-slate-200 text-lg leading-7 text-center font-medium">
                {hint}
              </Text>
            </ScrollView>
          </View>

          {/* Button */}
          <TouchableOpacity
              onPress={onNext}
            activeOpacity={0.8}
            className="mt-8 bg-indigo-600 h-16 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-black text-lg uppercase tracking-widest">
              Got it, Next!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

};

export default memo(HintSection);
