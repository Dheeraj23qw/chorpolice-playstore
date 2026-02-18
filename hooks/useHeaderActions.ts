import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setMuted } from "@/redux/reducers/soundReducer";
import { AudioEngine } from "@/audio/audioEngine";

export const useHeaderActions = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isMuted = useSelector((state: RootState) => state.sound.isMuted, shallowEqual);

const toggleSound = useCallback(() => {
  const nextState = !isMuted;
  dispatch(setMuted(nextState));

  if (nextState) {
    AudioEngine.forceStopAll();
  } else {
    AudioEngine.play("quiz", "background");
  }
}, [isMuted, dispatch]);

  return {
    isMuted,
    modalVisible,
    setModalVisible,
    menuOpen,
    setMenuOpen,
    router,
    toggleSound,
  };
};