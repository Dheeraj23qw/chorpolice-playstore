import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { GameModeRow } from "@/components/GameModeScreen/GameModeRow";
import { GameModeType } from "@/constants/gamemode";
import GameModeModal from "@/modal/GameModeModal";
import CharacterDrawer from "@/components/CharacterDrawer/CharacterDrawer";
import { useCharacterDrawer } from "@/hooks/useCharacterDrawer";
import { CharacterDrawerContext } from "@/constants/characterDrawerData";
import AppUpdateBanner from "@/components/GameModeScreen/AppUpdateBanner";
import { NotificationPermissionBanner } from "@/components/GameModeScreen/NotificationPermissionBanner";
import { NetworkPermissionBanner } from "@/components/GameModeScreen/NetworkPermissionBanner";
import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { toast } from "@/components/feedback/toast";

interface GameModeSelectScreenProps {
  title: string;
  subtitle: string;
  modes: GameModeType[];
  /** When provided, a persistent CharacterDrawer renders below the mode list. */
  drawerContext?: Exclude<CharacterDrawerContext, "home">;
}

export const GameModeSelectScreen: React.FC<GameModeSelectScreenProps> = ({
  title,
  subtitle,
  modes,
  drawerContext,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameModeType | null>(null);
  const pathname = usePathname();
  const { nativeUpdate, otaAvailable } = useOTAUpdate();
  const hasUpdateBanner = __DEV__ || !!nativeUpdate?.isAvailable || otaAvailable;

  const [devBannerIndex, setDevBannerIndex] = useState(0);
  const devBanners = [
    "update",
    "network",
    "notification",
    "none",
  ] as const;
  const cycleDevBanner = () => {
    setDevBannerIndex((prev) => (prev + 1) % devBanners.length);
    toast.info(
      "Dev Banner",
      `Showing: ${devBanners[devBannerIndex] === "none" ? "hidden" : devBanners[devBannerIndex]}`,
    );
  };

  useEffect(() => {
    console.log(`[NAV_DEBUG] [MODE SELECT] mounted: title="${title}", drawerContext="${drawerContext}", pathname="${pathname}"`);
  }, [pathname, title, drawerContext]);

  const handleOpen = (item: GameModeType) => {
    console.log(`[LOBBY_TRACE] GameModeSelectScreen handleOpen called: id="${item.id}", drawerContext="${drawerContext}", route="${item.route}"`);
    if (drawerContext === "single_player") {
      console.log(`[LOBBY_TRACE] drawerContext is single_player → calling router.push({ pathname: "/host", params: { gameType: "${item.gameType || item.id}", solo: "1" } })`);
      router.push({
        pathname: "/host",
        params: { gameType: item.gameType || item.id, solo: "1" },
      } as any);
    } else if (item.id.endsWith("_online")) {
      console.log(`[LOBBY_TRACE] online game selected → opening GameModeModal`);
      setSelectedGame(item);
    } else {
      console.log(`[LOBBY_TRACE] standard game selected → calling router.push("${item.route}")`);
      router.push(item.route);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/84" />
      <LinearGradient
        colors={[
          "rgba(15,23,42,0.62)",
          "rgba(79,70,229,0.12)",
          "rgba(0,0,0,0.92)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {!selectedGame && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 260 }}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
            {/* HEADER */}
            <View className="flex-row items-center px-5 pt-2">
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => router.back()}
                className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10"
              >
                <BlurView
                  intensity={18}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>

              <View className="ml-4 flex-1">
                <Text className="font-main-bold text-3xl tracking-tight text-white">
                  {title}
                </Text>
                <Text className="mt-1 text-[11px] uppercase tracking-widest text-white/40">
                  {subtitle}
                </Text>
              </View>

              {/* Suggest Icon */}
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => router.push("/suggest")}
                className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10"
              >
                <BlurView
                  intensity={18}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="bulb-outline" size={22} color="#FBBF24" />
              </TouchableOpacity>
            </View>

            {/* MODES LIST */}
            <View className="flex-1 px-5 pt-8">
              <View className="gap-y-4">
                {modes.map((item) => (
                  <GameModeRow
                    key={item.id}
                    item={item}
                    onPress={() => handleOpen(item)}
                  />
                ))}
              </View>

              {/* Persistent Character Drawer for Single Player / Multiplayer */}
              {drawerContext && (
                <DrawerSection context={drawerContext} />
              )}
            </View>

            {/* Bottom Banners */}
            <View className="mt-auto pt-4 gap-y-3">
              {__DEV__ && devBannerIndex === 0 ? (
                <AppUpdateBanner forceVisible />
              ) : __DEV__ && devBannerIndex === 1 && drawerContext === "multiplayer" ? (
                <NetworkPermissionBanner forceVisible />
              ) : __DEV__ && devBannerIndex === 2 ? (
                <NotificationPermissionBanner forceVisible />
              ) : __DEV__ && devBannerIndex === 3 ? (
                <></>
              ) : !__DEV__ && hasUpdateBanner ? (
                <AppUpdateBanner />
              ) : !__DEV__ && drawerContext === "multiplayer" ? (
                <NetworkPermissionBanner />
              ) : (
                <NotificationPermissionBanner />
              )}
            </View>
            </ScrollView>
          </MotiView>
        )}
      </SafeAreaView>

      {/* HOST / JOIN CHOICE FOR ONLINE MODES */}
      <GameModeModal
        isVisible={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        gameType={selectedGame?.gameType || selectedGame?.id || ""}
      />

      {__DEV__ && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={cycleDevBanner}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-5 py-3"
        >
          <Text className="font-main-bold text-xs uppercase tracking-wider text-white">
            Dev Banner: {devBanners[devBannerIndex]}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ── Extracted so the hook is only called when drawerContext exists ───────────
const DrawerSection: React.FC<{ context: Exclude<CharacterDrawerContext, "home"> }> = ({ context }) => {
  const { message, avatarSource } = useCharacterDrawer(context);

  return (
    <CharacterDrawer
      message={message}
      avatarSource={avatarSource}
      persistent
    />
  );
};

export default React.memo(GameModeSelectScreen);
