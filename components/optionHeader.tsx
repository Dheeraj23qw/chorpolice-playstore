import React, { useState, useCallback, memo } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import { AppDispatch, RootState } from "@/redux/store";
import { handleShare } from "@/utils/share";
import { FullScreenMenu } from "@/components/sidebar";
import CustomRatingModal from "@/modal/RatingModal";
import { AudioEngine } from "@/audio/audioEngine";
import { setMuted } from "@/redux/reducers/soundReducer";

/* ---------------------------------------------------
   ✅ Animated Button Component (Memoized)
--------------------------------------------------- */

type CircleBtnProps = {
  children: React.ReactNode;
  onPress?: () => void;
  btnDim: number;
  marginBetween: number;
  backgroundColor: string;
};

const AnimatedCircleBtn = memo(
  ({
    children,
    onPress,
    btnDim,
    marginBetween,
    backgroundColor,
  }: CircleBtnProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.85);
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1);
    }, []);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginLeft: marginBetween }}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor,
              width: btnDim,
              height: btnDim,
              borderRadius: btnDim / 2,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            },
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }
);

/* ---------------------------------------------------
   ✅ OptionHeader (Optimized)
--------------------------------------------------- */

const OptionHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isMuted = useSelector(
    (state: RootState) => state.sound.isMuted,
    shallowEqual
  );

  // CONSTANTS
  const SLATE_TRANSPARENT = "rgba(118, 83, 236, 0.2)";
  const ICON_COLOR = "#FFFFFF";

  // Responsive (calculated once per render)
  const btnDim = responsiveWidth(11);
  const iconSize = responsiveFontSize(2.8);
  const marginBetween = responsiveWidth(3);

  /* -----------------------------
     🔊 Sound Toggle (Memoized)
  ------------------------------ */
  const handleSoundToggle = useCallback(() => {
    const newMutedState = !isMuted;

    dispatch(setMuted(newMutedState));

    if (!newMutedState) {
      AudioEngine.play("quiz", "background");
    } else {
      AudioEngine.forceStopAll();
    }
  }, [isMuted, dispatch]);

  /* -----------------------------
     🔥 Navigation Handlers
  ------------------------------ */
  const handleEarnPress = useCallback(() => {
    router.push("/earn");
  }, [router]);

  const handleRateOpen = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <View
      style={{
        paddingVertical: responsiveHeight(1.5),
        paddingHorizontal: responsiveWidth(4),
      }}
      className="flex-row items-center justify-end"
    >
      {/* 🔊 Sound */}
      <AnimatedCircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={handleSoundToggle}
      >
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={iconSize}
          color={ICON_COLOR}
        />
      </AnimatedCircleBtn>

      {/* 🪙 Earn */}
      <AnimatedCircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={handleEarnPress}
      >
        <Ionicons name="flash" size={iconSize} color={ICON_COLOR} />
      </AnimatedCircleBtn>

      {/* 📤 Share */}
      <AnimatedCircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={iconSize} color={ICON_COLOR} />
      </AnimatedCircleBtn>

      {/* ⭐ Rating */}
      <AnimatedCircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={handleRateOpen}
      >
        <MaterialIcons name="star" size={iconSize} color={ICON_COLOR} />
      </AnimatedCircleBtn>

      {/* ⚙️ Menu */}
      <AnimatedCircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={handleMenuOpen}
      >
        <Ionicons name="settings" size={iconSize} color={ICON_COLOR} />
      </AnimatedCircleBtn>

      {/* Modals */}
      <CustomRatingModal
        title="Rate Chor Police"
        visible={modalVisible}
        onClose={handleModalClose}
      />

      <FullScreenMenu
        visible={menuOpen}
        onClose={handleMenuClose}
        router={router}
        onRatePress={handleRateOpen}
        onSharePress={handleShare}
      />
    </View>
  );
};

export default memo(OptionHeader);
