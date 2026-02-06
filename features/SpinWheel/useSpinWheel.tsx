import { useState, useRef, useCallback } from "react";
import { Animated, Easing, Vibration } from "react-native";
import { useDispatch } from "react-redux";
import { addCoins } from "@/redux/reducers/coinsReducer";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";

const MAX_ROTATION = 360 * 10;

export const useSpinWheel = () => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const reset = useCallback(() => {
    spinAnim.stopAnimation();
    pulseLoopRef.current?.stop();

    spinAnim.setValue(0);
    scaleAnim.setValue(0);
    pulseAnim.setValue(1);

    setStatus("IDLE");
    setResult(null);
    setShowVictory(false);
  }, [spinAnim, scaleAnim, pulseAnim]);

  const animateModalIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleSpin = useCallback(() => {
    if (status === "SPINNING") return;

    AudioEngine.play("spin");
    setStatus("SPINNING");

    spinAnim.setValue(0);

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    const segmentAngle = 360 / segments.length;
    const fullSpins = 8;

    const stopAngle = randomIndex * segmentAngle;
    const finalRotation =
      fullSpins * 360 + (360 - stopAngle - segmentAngle / 2);

    Animated.timing(spinAnim, {
      toValue: finalRotation,
      duration: 5000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setResult(selected);
      setStatus("DONE");

      dispatch(addCoins(selected.value));

      if (selected.value > 0) {
        setShowVictory(true);
        Vibration.vibrate(100);
      }

      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoopRef.current.start();
    });
  }, [status, spinAnim, pulseAnim, dispatch]);

  return {
    status,
    result,
    showVictory,
    spinAnim,
    scaleAnim,
    pulseAnim,
    segments,
    setShowVictory,
    handleSpin,
    reset,
    animateModalIn,
  };
};
