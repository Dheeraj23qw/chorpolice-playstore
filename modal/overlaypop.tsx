import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native";
import { data } from "@/constants/popupData";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { OverlayPopUpProps } from "@/types/models/OverlayPop";
import { Text } from "@/components/Text";
import { hp, wp, rf } from "@/utils/responsive";

// Added onStateChange to notify parent to hide/show game cards
interface ExtendedProps extends OverlayPopUpProps {
  onStateChange?: (isVisible: boolean) => void;
}

const OverlayPopUp: React.FC<ExtendedProps> = ({
  index,
  policeIndex,
  thiefIndex,
  kingIndex,
  displayDuration = 3000,
  onStateChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;
  
  const autoCloseTimer = useRef<number | null>(null);

  const playerNames = useSelector(selectPlayerNames).map((p) => p.name);

  const kingName = kingIndex !== null ? playerNames[kingIndex] : "King";
  const policeName = policeIndex !== null ? playerNames[policeIndex] : "Police";
  const thiefName = thiefIndex !== null ? playerNames[thiefIndex] : "Thief";

  const closeModal = useCallback(() => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setModalData(null);
      // Notify parent that modal is gone (Show cards again)
      if (onStateChange) onStateChange(false);
    });
  }, [opacityAnim, onStateChange]);

  useEffect(() => {
    if (index != null && index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1];
      let title = "";
      let accentColor = "#FFD700";

      switch (index) {
        case 1:
          title = `THE MIGHTY\n${kingName.toUpperCase()}`;
          accentColor = "#FACC15";
          break;
        case 2:
          title = `THE CHIEF\n${policeName.toUpperCase()}`;
          accentColor = "#3B82F6";
          break;
        case 3:
          title = `THE THIEF\n${thiefName.toUpperCase()}`;
          accentColor = "#EF4444";
          break;
        default:
          title = "GET READY";
          accentColor = "#A855F7";
      }

      setModalData({ ...selectedItem, roleTitle: title, theme: accentColor });
      setModalVisible(true);
      
      // Notify parent that modal is active (Hide cards)
      if (onStateChange) onStateChange(true);

      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.loop(
          Animated.timing(rayRotation, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: true })
        )
      ]).start();

      autoCloseTimer.current = setTimeout(() => {
        closeModal();
      }, displayDuration);
    }

    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [index, kingName, policeName, thiefName, closeModal, displayDuration, onStateChange]);

  if (!modalData) return null;

  const spin = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View 
          style={{ opacity: opacityAnim }} 
          className="flex-1 bg-[#050508] justify-center items-center"
        >
          {/* Background Rays */}
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
              position: "absolute",
              width: wp(140),
              height: wp(140),
              opacity: 0.1,
            }}
          >
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 1,
                  height: hp(100),
                  backgroundColor: modalData.theme,
                  transform: [{ rotate: `${i * 30}deg` }, { translateY: -hp(50) }],
                }}
              />
            ))}
          </Animated.View>

          {/* Content Card */}
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }], width: wp(85) }}
            className="items-center"
          >
            <Text className="text-white/20 font-main-bold uppercase tracking-[8px] text-[9px] mb-4">
              Identity Revealed
            </Text>

            <Text
              style={{
                color: modalData.theme,
                textShadowColor: modalData.theme,
                textShadowRadius: 15,
                fontSize: rf(4.5),
              }}
              className="text-center font-main-bold mb-8 tracking-tighter leading-[50px]"
            >
              {modalData.roleTitle}
            </Text>

            <View className="relative items-center justify-center">
              <View
                style={{ backgroundColor: modalData.theme }}
                className="absolute w-64 h-64 rounded-full opacity-[0.08] blur-3xl"
              />
              <Image
                source={modalData.image}
                style={{ width: wp(85), height: hp(38) }}
                resizeMode="contain"
              />
            </View>

            {modalData.point && (
              <View 
                style={{ borderColor: `${modalData.theme}20` }} 
                className="mt-8 py-3 px-14"
              >
                <Text style={{ color: modalData.theme }} className="font-main-bold text-2xl tracking-[4px]">
                  {modalData.point}
                </Text>
              </View>
            )}

            <Text className="text-slate-500 font-main-md text-center mt-10 px-8 text-xl leading-6 ">
              "{modalData.message}"
            </Text>

            <View className="mt-14 opacity-30">
              <Text className="text-white font-main-bold uppercase tracking-[3px] text-[8px]">
                Tap anywhere to continue
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default memo(OverlayPopUp);