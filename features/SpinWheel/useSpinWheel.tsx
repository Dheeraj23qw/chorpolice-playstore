import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Easing, Vibration, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { creditCoins } from "../wallet/walletSlice";

export const useSpinWheel = () => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  // Use a ref to track the cumulative rotation so the wheel doesn't "reset" visually
  const currentRotation = useRef(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // CLEANUP: Prevent memory leaks if the modal closes mid-animation
  useEffect(() => {
    return () => {
      spinAnim.stopAnimation();
      pulseLoopRef.current?.stop();
    };
  }, []);

  const reset = useCallback(() => {
    spinAnim.stopAnimation();
    pulseLoopRef.current?.stop();

    // Reset to 0 for a fresh start, or keep currentRotation.current
    // if you want it to stay where it landed.
    currentRotation.current = 0;
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
      useNativeDriver: true,
      damping: 12,
      stiffness: 90,
    }).start();
  }, [scaleAnim]);

  const handleSpin = useCallback(() => {
    if (status === "SPINNING") return;

    AudioEngine.play("spin");
    setStatus("SPINNING");

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    // --- CRAZY PRODUCTION LOGIC ---
    const fullSpins = 15; // High speed
    const centers = [315, 45, 225, 135];
    const targetCenter = centers[randomIndex];

    // Calculate the distance needed to reach the next target from the CURRENT position
    const extraRotation = fullSpins * 360 + (360 - targetCenter);
    const finalValue = currentRotation.current + extraRotation;

    Animated.timing(spinAnim, {
      toValue: finalValue,
      duration: 4500, // Balanced "Crazy" speed
      easing: Easing.bezier(0.15, 0, 0, 1), // "Imperial" premium easing
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return; // Prevent logic trigger if animation was interrupted

      currentRotation.current = finalValue; // Update ref for next spin
      setResult(selected);
      setStatus("DONE");

      if (selected.value > 0) {
        dispatch(
          creditCoins({
            amount: selected.value,
            reason: `Spin Reward - ${selected.label}`,
          }),
        );
        setShowVictory(true);
        Vibration.vibrate(Platform.OS === "ios" ? [0, 10] : 100);
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
        ]),
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
