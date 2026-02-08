import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, Easing, Vibration, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux"; // Added useSelector
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { claimSpinReward } from "../wallet/walletSlice"; // Changed to claimSpinReward
import { useTimeoutManager } from "@/hooks/useTimeOutManager";
import { RootState } from "@/redux/store"; // Adjust path to your store
import { formatTime } from "@/utils/TimeFormat";

export const useSpinWheel = () => {
  const dispatch = useDispatch();

  const COOLDOWN = 12 * 60 * 60 * 1000;

  const [remainingTime, setRemainingTime] = useState(0);

  // 1. Get the lock data from the Wallet Slice
  const spinLock = useSelector(
    (state: RootState) =>
      state.wallet.locks.spin ?? { lastUsedTimestamp: null },
  );
  // UI STATES
  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const { safeSetTimeout, clearAllTimeouts } = useTimeoutManager(
    status === "IDLE",
  );

  // ANIMATION VALUES
  const currentRotation = useRef(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const lastUsed = spinLock.lastUsedTimestamp;

    if (lastUsed !== null) {
      const updateRemaining = () => {
        const diff = COOLDOWN - (Date.now() - lastUsed);
        setRemainingTime(diff > 0 ? diff : 0);
      };

      updateRemaining();
      interval = setInterval(updateRemaining, 1000);
    } else {
      setRemainingTime(0);
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [spinLock.lastUsedTimestamp]);

  const isLocked = remainingTime > 0;

  useEffect(() => {
    return () => {
      spinAnim.stopAnimation();
      pulseLoopRef.current?.stop();
      clearAllTimeouts();
    };
  }, []);

  const reset = useCallback(() => {
    spinAnim.stopAnimation();
    pulseLoopRef.current?.stop();
    clearAllTimeouts();
    currentRotation.current = 0;
    spinAnim.setValue(0);
    scaleAnim.setValue(0);
    pulseAnim.setValue(1);
    setStatus("IDLE");
    setResult(null);
    setShowVictory(false);
  }, [spinAnim, scaleAnim, pulseAnim, clearAllTimeouts]);

  const animateModalIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 90,
    }).start();
  }, [scaleAnim]);

  /**
   * HANDLE SPIN
   */
  const handleSpin = useCallback(() => {
    const lastUsed = spinLock.lastUsedTimestamp;

    const isLocked = lastUsed !== null && Date.now() - lastUsed < COOLDOWN;

    if (status !== "IDLE" || isLocked) return;

    AudioEngine.play("spin");
    setStatus("SPINNING");

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    const fullSpins = 25;
    const spinDuration = 8000;
    const centers = [315, 45, 225, 135];
    const targetCenter = centers[randomIndex];

    const extraRotation = fullSpins * 360 + (360 - targetCenter);
    const finalValue = currentRotation.current + extraRotation;

    spinAnim.setValue(currentRotation.current);

    Animated.timing(spinAnim, {
      toValue: finalValue,
      duration: spinDuration,
      easing: Easing.bezier(0.12, 0.8, 0.1, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      currentRotation.current = finalValue;
      setResult(selected);
      setStatus("DONE");

      // Using claimSpinReward to credit coins AND set the lock timestamp
      if (selected.value > 0) {
        dispatch(
          claimSpinReward({
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
  }, [status, spinAnim, pulseAnim, dispatch, spinLock]);

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
    isLocked,
    remainingTime,
    formattedTime: formatTime(remainingTime),
  };
};
