import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
  Easing,
} from "react-native";
import { data } from "@/constants/popupData";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { OverlayPopUpProps } from "@/types/models/OverlayPop";
import { Text } from "@/components/Text";
import { hp, wp, rf } from "@/utils/responsive";

const OverlayPopUp: React.FC<OverlayPopUpProps> = ({
  index,
  policeIndex,
  thiefIndex,
  kingIndex,
  displayDuration = 3000, 
  contentType = "default",
  customMessage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [showTapToClose, setShowTapToClose] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;

  const playerNames = useSelector(selectPlayerNames).map((p) => p.name);

  const kingName = kingIndex !== null ? playerNames[kingIndex] : "King";
  const policeName = policeIndex !== null ? playerNames[policeIndex] : "Police";
  const thiefName = thiefIndex !== null ? playerNames[thiefIndex] : "Thief";

  useEffect(() => {
    if (index != null && index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1];
      let title = "";
      let accentColor = "#FFD700"; // Default Gold

      // Logic for Royal Titles
      switch (index) {
    
        case 2: 
          title = `CHIEF\n${policeName.toUpperCase()}`; 
          accentColor = "#3B82F6"; 
          break;
        case 3: 
          title = `THE ELUSIVE\n${thiefName.toUpperCase()}`; 
          accentColor = "#EF4444"; 
          break;
        default: 
          title = "ROUND COMMENCING";
      }

      setModalData({ ...selectedItem, roleTitle: title, theme: accentColor });
      setModalVisible(true);

      // Animation: Majestic Scale + Slow Rotation of rays
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.loop(
          Animated.timing(rayRotation, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: true })
        )
      ]).start();

      setTimeout(() => setShowTapToClose(true), displayDuration);
    }
  }, [index]);

  const closeModal = () => {
    Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setModalVisible(false));
  };

  if (!modalData) return null;

  const spin = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={() => showTapToClose && closeModal()}>
        
        {/* SOLID DARK OVERLAY - Kills the BG transparency for total focus */}
        <Animated.View style={{ opacity: opacityAnim }} className="flex-1 bg-[#050508] justify-center items-center">
          
          {/* 1. THE AMBIENT GLOW (God Rays / Aura) */}
          <Animated.View 
            style={{ 
              transform: [{ rotate: spin }],
              position: 'absolute',
              width: wp(150),
              height: wp(150),
              opacity: 0.2
            }}
          >
            {[...Array(8)].map((_, i) => (
              <View 
                key={i} 
                style={{ 
                  position: 'absolute', 
                  top: '50%', left: '50%',
                  width: 2, height: hp(100),
                  backgroundColor: modalData.theme,
                  transform: [{ rotate: `${i * 45}deg` }, { translateY: -hp(50) }]
                }} 
              />
            ))}
          </Animated.View>

          {/* 2. THE MAJESTIC CONTENT */}
          <Animated.View 
            style={{ transform: [{ scale: scaleAnim }], width: wp(85) }}
            className="items-center"
          >
            {/* Crown/Icon Label */}
            <Text className="text-white/40 font-main-bold uppercase tracking-[8px] text-[10px] mb-2">
              Identity Confirmed
            </Text>

            {/* Main Role Title */}
            <Text 
               style={{ color: modalData.theme, textShadowColor: modalData.theme, textShadowRadius: 15 }}
               className="text-center font-main-bold text-4xl mb-6 tracking-tighter leading-10"
            >
              {modalData.roleTitle}
            </Text>

            {/* Character Spotlight */}
            <View className="relative items-center justify-center">
              <View 
                style={{ backgroundColor: modalData.theme }} 
                className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl" 
              />
              <Image
                source={modalData.image}
                style={{ width: wp(80), height: hp(38) }}
                resizeMode="contain"
              />
            </View>

            {/* Points Reward Pill */}
            {modalData.point && (
              <View style={{ borderColor: modalData.theme }} className="mt-4 border-b-2 border-t-2 py-2 px-10">
                <Text style={{ color: modalData.theme }} className="font-main-bold text-3xl tracking-widest">
                  {modalData.point}
                </Text>
              </View>
            )}

            {/* Philosophical Message */}
            <Text className="text-slate-400 font-main-md  text-center mt-8 px-6 leading-6">
              "{modalData.message}"
            </Text>

            {/* Interaction Hint */}
            {showTapToClose && (
              <View className="mt-12">
                <Text className="text-white/20 font-main-bold uppercase tracking-[5px] text-[10px]">
                  — Proceed to Round —
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default OverlayPopUp;