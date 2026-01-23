import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { hidePopup } from "@/redux/reducers/popupReducer";
import { handlePopupAction } from "@/utils/handlePopupAction";

export default function ConfirmPopup() {
  const { visible, config } = useSelector(
    (state: RootState) => state.popup
  );

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  if (!visible || !config) return null;

  /* -------------------- ⏱ Auto Close -------------------- */
  useEffect(() => {
    if (!visible) return;
    if (!config?.autoCloseMs) return;

    const timer = setTimeout(() => {
      dispatch(hidePopup());
    }, config.autoCloseMs);

    return () => clearTimeout(timer);
  }, [visible, config?.autoCloseMs]);

  /* -------------------- ✅ Confirm Handler -------------------- */
  const handleConfirm = () => {
    handlePopupAction({
      action: config.action,
      payload: config.payload,
    });

    dispatch(hidePopup());
  };

  /* -------------------- ❌ Cancel Handler -------------------- */
  const handleCancel = () => {
    dispatch(hidePopup());
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute inset-0 z-50 items-center justify-center bg-black/60"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Animated.View
        entering={ZoomIn.springify()}
        className="w-[85%] max-w-[360px] rounded-3xl bg-[#141428] p-6"
      >
        {/* 🏷 Title */}
        {config.title && (
          <Text className="text-white text-xl font-bold text-center mb-2">
            {config.title}
          </Text>
        )}

        {/* 💬 Message */}
        <Text className="text-gray-300 text-center mb-6 leading-relaxed">
          {config.message}
        </Text>

        {/* 🔘 Buttons */}
        <View className="flex-row gap-3">
          {config.cancelText && (
            <Pressable
              onPress={handleCancel}
              className="flex-1 h-12 rounded-xl border border-white/10 items-center justify-center active:scale-95"
            >
              <Text className="text-white/70 font-semibold">
                {config.cancelText}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleConfirm}
            className="flex-1 h-12 rounded-xl bg-indigo-600 items-center justify-center active:scale-95"
          >
            <Text className="text-white font-semibold">
              {config.confirmText ?? "OK"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
