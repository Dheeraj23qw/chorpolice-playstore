import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SpinSegment, SpinStatus } from "./types";
import { segments } from "@/constants/spinwheel";
import { AudioEngine } from "@/audio/audioEngine";
import { useTimeoutManager } from "@/hooks/useTimeOutManager";
import { AppDispatch, RootState } from "@/redux/store";
import { formatTime } from "@/utils/TimeFormat";
import { Vibration, Platform } from "react-native";
// ✅ Import all Reanimated tools
import {
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import {
  cancelSpinNotification,
  scheduleSpinUnlock,
} from "@/service/notification/notication_types/spin.notification";
import { updateCoins } from "../wallet/walletSlice";
import { useSpin } from "../locks/lockSlice";

export const useSpinWheel = () => {
  const [status, setStatus] = useState<SpinStatus>("IDLE");
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const { clearAllTimeouts } = useTimeoutManager(status === "IDLE");
  const dispatch = useDispatch<AppDispatch>();

  const spinLock = useSelector((state: RootState) => state.lock.spin);
  const COOLDOWN = 12 * 60 * 60 * 1000;

  const isLocked = remainingTime > 0;

  // ✅ REANIMATED VALUES
  const spinAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // 1. Timer Logic
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
      if (interval) clearInterval(interval);
    };
  }, [spinLock.lastUsedTimestamp]);

  // 2. Notification Logic
  useEffect(() => {
    if (remainingTime <= 0) return;
    cancelSpinNotification();
    scheduleSpinUnlock(Math.ceil(remainingTime / 1000));
  }, [remainingTime]);

  // 3. Cleanup on Unmount
  useEffect(() => {
    return () => {
      cancelAnimation(spinAnim);
      cancelAnimation(scaleAnim);
      cancelAnimation(pulseAnim);
      clearAllTimeouts();
    };
  }, []);

  // ✅ CORRECTED RESET (Uses .value)
  const reset = useCallback(() => {
    cancelAnimation(spinAnim);
    cancelAnimation(scaleAnim);
    cancelAnimation(pulseAnim);
    clearAllTimeouts();

    spinAnim.value = 0;
    scaleAnim.value = 0;
    pulseAnim.value = 1;

    setStatus("IDLE");
    setResult(null);
    setShowVictory(false);
  }, [clearAllTimeouts]);

  // ✅ CORRECTED ANIMATE IN (Uses withSpring)
  const animateModalIn = useCallback(() => {
    scaleAnim.value = withSpring(1, {
      damping: 18, // 🟢 Increased: Stops the "shaking" faster
      stiffness: 120, // 🟢 Increased: Makes the initial move snappier
      mass: 0.8, // 🟢 Added: Makes the modal feel "lighter" and more responsive
    });
  }, []);

  // Helper for things that must run on the Main JS Thread
  const handleSpinEnd = useCallback(
    (selected: SpinSegment, finalRotation: number) => {
      setResult(selected);
      setStatus("DONE");

      if (selected.value) {
        dispatch(updateCoins(selected.value)); // 💰 add coins
        dispatch(useSpin());
        setShowVictory(true);
        Vibration.vibrate(Platform.OS === "ios" ? [0, 10] : 100);
      }

      // ✅ REANIMATED PULSE LOOP (much cleaner)
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    },
    [dispatch],
  );

  // ✅ CORRECTED HANDLE SPIN
  const handleSpin = useCallback(() => {
    if (status !== "IDLE" || isLocked) return;

    setStatus("SPINNING");
    AudioEngine.play("spin");

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    const fullSpins = 25;
    const spinDuration = 8000;
    const centers = [315, 45, 225, 135];
    const targetCenter = centers[randomIndex];

    const extraRotation = fullSpins * 360 + (360 - targetCenter);
    const finalValue = spinAnim.value + extraRotation;

    spinAnim.value = withTiming(
      finalValue,
      {
        duration: spinDuration,
        easing: Easing.bezier(0.12, 0.8, 0.1, 1),
      },
      (finished) => {
        if (finished) {
          // We must bridge back to the JS thread to update React state
          runOnJS(handleSpinEnd)(selected, finalValue);
        }
      },
    );
  }, [status, isLocked, handleSpinEnd]);

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
