import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, Dimensions, useWindowDimensions } from "react-native";
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

export const FullScreenMenu = ({ visible, onClose, router }: any) => {
  const { width, height } = useWindowDimensions();
  const [canScroll, setCanScroll] = useState(false);
  
  // Responsive Constants
  const isTablet = width > 768;
  const CARD_WIDTH = isTablet ? 600 : width * 0.92;
  const CARD_HEIGHT = isTablet ? 700 : height * 0.8;
  
  const showIndicator = useSharedValue(1);
  const arrowY = useSharedValue(0);

  useEffect(() => {
    arrowY.value = withRepeat(withTiming(-6, { duration: 900 }), -1, true);
  }, []);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
    opacity: showIndicator.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      showIndicator.value = withTiming(
        event.contentOffset.y > 20 ? 0 : 1,
        { duration: 200 }
      );
    },
  });

  const menuItems = [
    { label: "Home", icon: "home-outline", path: "/" },
    { label: "Profile", icon: "person-outline", path: "/profile" },
    { label: "Friends", icon: "people-outline", path: "/friends" },
    { label: "Ranks", icon: "trophy-outline", path: "/leaderboard" },
    { label: "Awards", icon: "medal-outline", path: "/award" },
    { label: "Stats", icon: "bar-chart-outline", path: "/stats" },
    { label: "Bugs", icon: "bug-outline", path: "/report-bug" },
    { label: "Help", icon: "chatbubbles-outline", path: "/support" },
    { label: "Settings", icon: "settings-outline", path: "/settings" },
  ];

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 items-center justify-center">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-[#0a051ee0]"
        />
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Main Card */}
        <Animated.View
          entering={ZoomIn.springify().damping(14)}
          exiting={ZoomOut.duration(180)}
          style={{ width: CARD_WIDTH, maxHeight: CARD_HEIGHT }}
          className="bg-[#24184d] rounded-[34px] overflow-hidden border border-[#d4af3740] shadow-2xl"
        >
          {/* Header */}
          <View className="px-6 py-5 border-b border-[#d4af372e] flex-row items-center justify-between bg-white/5">
            <View>
              <Text className="text-white text-2xl font-black">Menu</Text>
            </View>
            <Pressable onPress={onClose} className="bg-[#d4af372e] active:bg-[#d4af3759] rounded-xl p-2">
              <Ionicons name="close" size={24} color="#D4AF37" />
            </Pressable>
          </View>

          {/* Grid Scroll Area */}
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            onContentSizeChange={(_, h) => setCanScroll(h > (isTablet ? 600 : 500))}
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          >
            <View className="flex-row flex-wrap justify-between">
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => { router.push(item.path); onClose(); }}
                  // w-[31%] for 3 items per row
                  className="w-[31%] aspect-square bg-white/5 active:bg-white/10 rounded-2xl mb-4 items-center justify-center border border-white/5"
                  style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <View className="bg-[#d4af371a] p-2 rounded-xl mb-1">
                    <Ionicons name={item.icon as any} size={isTablet ? 35 : 30} color="#D4AF37" />
                  </View>
                  <Text numberOfLines={1} className="text-white text-[11px] lg:text-[14px] font-bold text-center px-1">
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.ScrollView>

          {/* Indicator */}
          {canScroll && (
            <Animated.View pointerEvents="none" style={arrowStyle} className="absolute bottom-4 w-full items-center">
              <Ionicons name="chevron-down" size={20} color="#D4AF37" />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};