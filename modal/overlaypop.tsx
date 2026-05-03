import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { View, Image, Modal, Animated, Easing } from "react-native";
import { data } from "@/constants/popupData";
import { useSelector } from "react-redux";
import { selectPlayerNames } from "@/redux/selectors/playerDataSelector";
import { OverlayPopUpProps } from "@/types/models/OverlayPop";
import { Text } from "@/components/Text";
import { hp, wp, rf } from "@/utils/responsive";
import { VictoryCelebration } from "@/components/VictoryCelebration";

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
  const [showConfetti, setShowConfetti] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;

  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerNames = useSelector(selectPlayerNames).map((p) => p?.name);



  // 🔥 Dynamic duration (GLOBAL access) - ⏱️ Reduced for faster flow
  const getDuration = () => {
    switch (index) {
      case 3:
      case 4:
        return 3000; // Win/Loss results: 3s (allows reading message)
      default:
        return displayDuration;
    }
  };

  const duration = getDuration();

  const closeModal = useCallback(() => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);

    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setModalData(null);
      setShowConfetti(false);
      onStateChange?.(false);
    });
  }, [opacityAnim, onStateChange]);

  useEffect(() => {
    if (index != null && index >= 1 && index <= data.length) {
      const selectedItem = data[index - 1];

      // ✅ Confetti only for WIN screens (better UX)
      const shouldCelebrate = index === 3 || index === 4;
      setShowConfetti(shouldCelebrate);

      let title = "";
      let accentColor = "#FFD700";

      switch (index) {
        case 3:
          title = "Thief Escaped! 😈";
          accentColor = "#8B5CF6";
          break;

        case 4:
          title = "Case Solved! 🔍";
          accentColor = "#3B82F6";
          break;

        default:
          title = "GET READY";
          accentColor = "#A855F7";
      }

      setModalData({ ...selectedItem, roleTitle: title, theme: accentColor });
      setModalVisible(true);
      onStateChange?.(true);

      // ✅ Reset animations (IMPORTANT)
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      rayRotation.setValue(0);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rayRotation, {
            toValue: 1,
            duration: 15000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
      ]).start();

      autoCloseTimer.current = setTimeout(() => {
        closeModal();
      }, duration);
    }

    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [index, closeModal, duration, onStateChange]);

  if (!modalData) return null;

  const spin = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <Animated.View
        style={{ opacity: opacityAnim }}
        className="flex-1 items-center justify-center bg-[#050508]"
      >
        {showConfetti && modalVisible && (
          <VictoryCelebration
            type="THEME"
            intensity="LOW"
            duration={duration - 500} // ✅ synced
            onComplete={() => setShowConfetti(false)}
          />
        )}

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
                transform: [
                  { rotate: `${i * 30}deg` },
                  { translateY: -hp(50) },
                ],
              }}
            />
          ))}
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], width: wp(85) }}
          className="items-center"
        >
          <Text
            style={{ fontSize: rf(1.2), letterSpacing: wp(2) }}
            className="mb-4 font-main-bold uppercase text-white/20"
          >
            Identity Revealed
          </Text>

          <Text
            style={{
              color: modalData.theme,
              textShadowColor: modalData.theme,
              textShadowRadius: 15,
              fontSize: rf(4.5),
            }}
            className="mb-8 text-center font-main-bold leading-[50px] tracking-tighter"
          >
            {modalData.roleTitle}
          </Text>

          <View className="relative items-center justify-center">
            <View
              style={{ backgroundColor: modalData.theme }}
              className="absolute h-64 w-64 rounded-full opacity-[0.08] blur-3xl"
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
              className="mt-8 px-14 py-3"
            >
              <Text
                style={{
                  color: modalData.theme,
                  fontSize: rf(3.2),
                  letterSpacing: wp(1),
                }}
                className="font-main-bold"
              >
                {modalData.point}
              </Text>
            </View>
          )}

          <Text
            style={{ fontSize: rf(2.2), lineHeight: rf(3) }}
            className="mt-10 px-8 text-center font-main-md text-slate-500"
          >
            {modalData.message}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default memo(OverlayPopUp);
