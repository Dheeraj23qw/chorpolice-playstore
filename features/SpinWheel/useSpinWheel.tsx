import { useState, useRef, useCallback } from "react";
import { Animated, Easing, Vibration } from "react-native";
import { useDispatch } from "react-redux";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { creditCoins } from "../wallet/walletSlice";

// ✅ NEW WALLET IMPORT

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

  /* ---------------- RESET ---------------- */
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

  /* ---------------- MODAL ENTRY ANIMATION ---------------- */
  const animateModalIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  /* ---------------- SPIN LOGIC ---------------- */
/* ---------------- SPIN LOGIC ---------------- */
const handleSpin = useCallback(() => {
  if (status === "SPINNING") return;

  AudioEngine.play("spin");
  setStatus("SPINNING");

  const randomIndex = Math.floor(Math.random() * segments.length);
  const selected = segments[randomIndex];

  const fullSpins = 8; // How many times it spins before stopping
  
  /**
   * THE MAPPING LOGIC
   * We want the CENTER of the segment to be at the top (0°).
   * Visual positions of your grid segments:
   * Index 0 (Top-Left): Center is at 315°
   * Index 1 (Top-Right): Center is at 45°
   * Index 2 (Bottom-Left): Center is at 225°
   * Index 3 (Bottom-Right): Center is at 135°
   */
  const centers = [315, 45, 225, 135];
  const targetCenter = centers[randomIndex];

  // To bring 'targetCenter' to the Top (0°/360°), 
  // we rotate the wheel by (360 - targetCenter)
  const finalRotation = (fullSpins * 360) + (360 - targetCenter);

  spinAnim.setValue(0);

  Animated.timing(spinAnim, {
    toValue: finalRotation,
    duration: 5000,
    easing: Easing.out(Easing.bezier(0.2, 0, 0, 1)), // Sleek "weighted" stop
    useNativeDriver: true,
  }).start(() => {
    setResult(selected);
    setStatus("DONE");

      if (selected.value > 0) {
        dispatch(
          creditCoins({
            amount: selected.value,
            reason: `Spin Reward - ${selected.label}`,
          }),
        );
      }

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
