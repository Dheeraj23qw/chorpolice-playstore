import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Modal,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedScrollHandler,
  FadeInDown,
} from "react-native-reanimated";
import {
  Flashlight,
  User,
  Trophy,
  Medal,
  BarChart3,
  Bug,
  HelpCircle,
  X,
  ChevronDown,
  Star,
  Share2,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Lightbulb,
  Gift,
  RotateCcw,
} from "lucide-react-native";

import { rf } from "@/utils/responsive";
import { Text } from "./Text";
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
} from "@/storage/notificationStorage";
import { toast } from "@/components/feedback/toast";
import { hasRatingCompleted } from "@/hooks/useRatingPrompt";
import { resetAllAppData } from "@/utils/resetAppData";

export const FullScreenMenu = ({
  visible,
  onClose,
  router,
  onRatePress,
  onSharePress,
  onSoundToggle,
  isMuted,
}: any) => {
  const { width, height } = useWindowDimensions();
  const [canScroll, setCanScroll] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(isNotificationsEnabled());

  useEffect(() => {
    if (visible) {
      setNotifEnabled(isNotificationsEnabled());
    }
  }, [visible]);

  const toggleNotifications = () => {
    const nextState = !notifEnabled;
    setNotificationsEnabled(nextState);
    setNotifEnabled(nextState);
    toast.info(
      "Notification Settings",
      nextState ? "App notifications enabled." : "App notifications disabled.",
    );
  };

  const isTablet = width > 768;
  const CARD_WIDTH = isTablet ? 550 : width * 0.92;
  const CARD_HEIGHT = isTablet ? 650 : height * 0.7;

  const showIndicator = useSharedValue(1);
  const arrowY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      arrowY.value = withRepeat(withTiming(-6, { duration: 1000 }), -1, true);
    }
  }, [visible, arrowY]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
    opacity: showIndicator.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      showIndicator.value = withTiming(event.contentOffset.y > 20 ? 0 : 1, {
        duration: 200,
      });
    },
  });

  const menuItems = [
    { label: "Earn", icon: Flashlight, path: "/earn" },
    { label: "Stats", icon: BarChart3, path: "/stats" },
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Referral", icon: Gift, path: "/earn" },
    {
      label: isMuted ? "Sound Off" : "Sound On",
      icon: isMuted ? VolumeX : Volume2,
      action: onSoundToggle,
    },
    {
      label: notifEnabled ? "Notify On" : "Notify Off",
      icon: notifEnabled ? Bell : BellOff,
      action: toggleNotifications,
    },
    { label: "Suggest", icon: Lightbulb, path: "/suggest" },
    hasRatingCompleted()
      ? { label: "share", icon: Share2, action: onSharePress }
      : { label: "Rate Us", icon: Star, action: onRatePress },
    { label: "Bugs", icon: Bug, path: "/report-bug" },
    ...(process.env.NODE_ENV !== "production"
      ? [
          {
            label: "Reset All",
            icon: RotateCcw,
            action: () => {
              resetAllAppData();
              toast.success(
                "Dev Reset",
                "All app data has been cleared successfully.",
              );
            },
          },
        ]
      : []),
  ];

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 items-center justify-center">
        {/* Deep Obsidian Backdrop */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-slate-950/95"
        />
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Glossy Navigation Terminal */}
        <Animated.View
          entering={ZoomIn.springify().damping(18).mass(0.9)}
          exiting={ZoomOut.duration(150)}
          style={{ width: CARD_WIDTH, maxHeight: CARD_HEIGHT }}
          className="overflow-hidden rounded-[48px] border border-white/10 bg-slate-900 shadow-2xl shadow-indigo-500/20"
        >
          {/* Header Section */}
          <View className="flex-row items-center justify-between border-b border-white/5 bg-slate-900/50 px-8 py-7">
            <View>
              <Text
                style={{ fontSize: rf(1.8) }}
                className="font-main-bold uppercase tracking-[2px] text-white"
              >
                Navigation
              </Text>
              <Text className="mt-0.5 font-main-md text-[10px] uppercase tracking-widest text-indigo-400">
                Main Terminal
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-2xl border border-white/5 bg-slate-800 p-3 active:bg-indigo-500"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Staggered Grid Menu */}
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            onContentSizeChange={(_, h) => setCanScroll(h > CARD_HEIGHT - 100)}
            contentContainerClassName="p-6 pb-12"
          >
            <View className="flex-row flex-wrap justify-between">
              {menuItems.map((item, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 50)
                    .springify()
                    .damping(20)}
                  className="mb-5 aspect-square w-[30%]"
                >
                   <Pressable
                     onPress={() => {
                       if (item.action) {
                         item.action();
                         onClose();
                       } else if (item.path) {
                         router.push(item.path);
                         onClose();
                       }
                     }}
                     className={`flex-1 items-center justify-center rounded-[32px] border ${
                       item.label === "Reset All"
                         ? "border-red-500/30 bg-red-500/10 active:bg-red-500/30"
                         : "border-white/5 bg-slate-800/40 active:bg-indigo-600"
                     }`}
                   >
                     <View className="mb-2">
                       <item.icon
                         size={isTablet ? 32 : 24}
                         color={item.label === "Reset All" ? "#ef4444" : "white"}
                         strokeWidth={2}
                       />
                     </View>
                     <Text
                       numberOfLines={1}
                       className={`px-1 text-center font-main-bold text-[9px] uppercase tracking-widest ${
                         item.label === "Reset All"
                           ? "text-red-400"
                           : "text-white"
                       }`}
                     >
                       {item.label}
                     </Text>
                   </Pressable>
                </Animated.View>
              ))}

              {/* Spacer for grid alignment if items are not multiple of 3 */}
              <View className="invisible mb-5 aspect-square w-[30%]" />
            </View>
          </Animated.ScrollView>

          {/* Scroll Hint */}
          {canScroll && (
            <Animated.View
              pointerEvents="none"
              style={arrowStyle}
              className="absolute bottom-6 w-full items-center"
            >
              <View className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 blur-sm">
                <ChevronDown size={16} color="#818cf8" />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
