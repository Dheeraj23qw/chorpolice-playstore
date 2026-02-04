import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Modal,
  useWindowDimensions,
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
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { rf } from "@/utils/responsive";
import { Text } from "./Text";

export const FullScreenMenu = ({ visible, onClose, router }: any) => {
  const { width, height } = useWindowDimensions();
  const [canScroll, setCanScroll] = useState(false);

  // Responsive Constants
  const isTablet = width > 768;
  const CARD_WIDTH = isTablet ? 550 : width * 0.94;
  const CARD_HEIGHT = isTablet ? 650 : height * 0.75;

  const showIndicator = useSharedValue(1);
  const arrowY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      arrowY.value = withRepeat(withTiming(-6, { duration: 1000 }), -1, true);
    }
  }, [visible]);

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
    { label: "Earn", icon: "flash", path: "/earn" },
    { label: "Profile", icon: "person", path: "/profile" },
    { label: "Friends", icon: "people", path: "/friends" },
    { label: "Ranks", icon: "trophy", path: "/leaderboard" },
    { label: "Awards", icon: "medal", path: "/award" },
    { label: "Stats", icon: "bar-chart", path: "/stats" },
    { label: "Bugs", icon: "bug", path: "/bug" },
    { label: "Help", icon: "chatbubbles", path: "/support" },
  ];

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 items-center justify-center">
        {/* Obsidian Backdrop */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-[#020205e6]"
        />
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Glossy Main Card */}
        <Animated.View
          entering={ZoomIn.springify().damping(20).mass(0.8)}
          exiting={ZoomOut.duration(150)}
          style={{ width: CARD_WIDTH, maxHeight: CARD_HEIGHT }}
          className="bg-[#08080a] rounded-[40px] overflow-hidden border-t-[1.5px] border-l-[1px] border-white/20 shadow-2xl shadow-indigo-500/20"
        >
          {/* Header */}
          <View className="px-8 py-6 border-b border-white/5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3 shadow-lg shadow-indigo-500" />
              <Text style={{ fontSize: rf(2) }} className="text-white font-black uppercase  tracking-tighter">
                Navigation
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="bg-white/5 active:bg-indigo-500/20 rounded-2xl p-2.5 border border-white/10"
            >
              <Ionicons name="close-outline" size={24} color="#818cf8" />
            </Pressable>
          </View>

          {/* Grid Scroll Area */}
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            onContentSizeChange={(_, h) => setCanScroll(h > CARD_HEIGHT - 100)}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            <View className="flex-row flex-wrap justify-between">
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  // Metamorphic Tile Styling
                  className="w-[30%] aspect-square bg-white/[0.03] active:bg-indigo-500/10 rounded-[28px] mb-5 items-center justify-center border-t border-l border-white/10"
                  style={({ pressed }) => [
                    { transform: [{ scale: pressed ? 0.92 : 1 }] },
                  ]}
                >
                  {/* Icon Container with Subtle Glow */}
                  <View className="bg-indigo-500/10 p-3 rounded-2xl mb-2 border border-indigo-500/20">
                    <Ionicons
                      name={item.icon as any}
                      size={isTablet ? 32 : 26}
                      color="#818cf8"
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-white/80 text-[10px] font-black uppercase tracking-widest text-center px-1"
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.ScrollView>

          {/* Low GPU Indicator */}
          {canScroll && (
            <Animated.View
              pointerEvents="none"
              style={arrowStyle}
              className="absolute bottom-6 w-full items-center"
            >
              <View className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                 <Ionicons name="chevron-down" size={16} color="#818cf8" />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};