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
} from "lucide-react-native";
import { rf } from "@/utils/responsive";
import { Text } from "./Text";

export const FullScreenMenu = ({
  visible,
  onClose,
  router,
  onRatePress,
  onSharePress,
}: any) => {
  const { width, height } = useWindowDimensions();
  const [canScroll, setCanScroll] = useState(false);

  const isTablet = width > 768;
  const CARD_WIDTH = isTablet ? 550 : width * 0.92;
  const CARD_HEIGHT = isTablet ? 650 : height * 0.7;

  const showIndicator = useSharedValue(1);
  const arrowY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      arrowY.value = withRepeat(withTiming(-6, { duration: 1000 }), -1, true);
    }
  }, [visible,arrowY]);

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
    { label: "Ranks", icon: Trophy, path: "/leaderboard" },
    { label: "Awards", icon: Medal, path: "/awards" },
    { label: "Rate Us", icon: Star, action: onRatePress },
    { label: "Share", icon: Share2, action: onSharePress },
    { label: "Bugs", icon: Bug, path: "/report-bug" },
    { label: "Help", icon: HelpCircle, path: "/support" },
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
          className="bg-slate-900 rounded-[48px] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20"
        >
          {/* Header Section */}
          <View className="px-8 py-7 border-b border-white/5 flex-row items-center justify-between bg-slate-900/50">
            <View>
              <Text
                style={{ fontSize: rf(1.8) }}
                className="text-white font-main-bold uppercase tracking-[2px]"
              >
                Navigation
              </Text>
              <Text className="text-[10px] text-indigo-400 font-main-md uppercase tracking-widest mt-0.5">
                Main Terminal
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-800 active:bg-indigo-500 rounded-2xl p-3 border border-white/5"
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
                  className="w-[30%] aspect-square mb-5"
                >
                  <Pressable
                    onPress={() => {
                      if (item.action) {
                        // 1. Execute the special action (onRatePress or onSharePress)
                        item.action();
                        // 2. Close the menu so the user can see the Share sheet or Rating Modal
                        onClose();
                      } else if (item.path) {
                        // 3. Normal navigation for items with paths
                        router.push(item.path);
                        onClose();
                      }
                    }}
                    className="flex-1 bg-slate-800/40 active:bg-indigo-600 rounded-[32px] items-center justify-center border border-white/5"
                  >
                    <View className="mb-2">
                      <item.icon
                        size={isTablet ? 32 : 24}
                        color="white"
                        strokeWidth={2}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      className="text-white text-[9px] font-main-bold uppercase tracking-widest text-center px-1"
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}

              {/* Spacer for grid alignment if items are not multiple of 3 */}
              <View className="w-[30%] aspect-square mb-5 invisible" />
            </View>
          </Animated.ScrollView>

          {/* Scroll Hint */}
          {canScroll && (
            <Animated.View
              pointerEvents="none"
              style={arrowStyle}
              className="absolute bottom-6 w-full items-center"
            >
              <View className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 blur-sm">
                <ChevronDown size={16} color="#818cf8" />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
