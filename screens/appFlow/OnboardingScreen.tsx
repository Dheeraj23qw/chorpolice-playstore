import React, { useEffect } from "react";

import { OnboardingSwiper } from "@/features/Onboarding";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppRedux";
import { loadSounds } from "@/redux/reducers/soundReducer";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const dispatch = useAppDispatch();
  const isSoundLoaded = useAppSelector((state) => state.sound.isLoaded);
  const isSoundLoading = useAppSelector((state) => state.sound.isLoading);

  useEffect(() => {
    if (!isSoundLoaded && !isSoundLoading) {
      void dispatch(loadSounds());
    }
  }, [dispatch, isSoundLoaded, isSoundLoading]);

  return <OnboardingSwiper onComplete={onComplete} />;
}
