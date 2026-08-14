import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";

/* ============================================================
   TYPES
============================================================ */

interface Props {
  isVisible: boolean;
  onGrant: () => void;
  onDeny: () => void;
}

/* ============================================================
   ANDROID PERMISSIONS
============================================================ */

const LOCATION_PERMISSION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

const NEARBY_WIFI_PERMISSION = "android.permission.NEARBY_WIFI_DEVICES";

/* ============================================================
   PERMISSION ROW
============================================================ */

interface PermissionRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  granted?: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  granted = false,
}) => {
  return (
    <View className="mb-3 w-full flex-row items-center rounded-[20px] border border-white/[0.08] bg-white/[0.045] px-4 py-3.5">
      {/* ICON */}

      <View
        className={`mr-3.5 h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] ${iconBackground}`}
      >
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={granted ? "#6EE7B7" : iconColor}
        />
      </View>

      {/* CONTENT */}

      <View className="min-w-0 flex-1 pr-2">
        <Text className="font-main-bold text-[14px] text-white">{title}</Text>

        <Text className="mt-1 font-main text-[11px] leading-[16px] text-white/40">
          {description}
        </Text>
      </View>

      {/* STATUS */}

      <View
        className={`h-7 w-7 items-center justify-center rounded-full border ${
          granted
            ? "border-emerald-400/30 bg-emerald-400/15"
            : "border-white/[0.08] bg-white/[0.04]"
        }`}
      >
        <MaterialCommunityIcons
          name={granted ? "check" : "chevron-right"}
          size={granted ? 16 : 17}
          color={granted ? "#6EE7B7" : "rgba(255,255,255,0.28)"}
        />
      </View>
    </View>
  );
};

/* ============================================================
   MAIN MODAL
============================================================ */

const MultiplayerPermissionModal: React.FC<Props> = ({
  isVisible,
  onGrant,
  onDeny,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { state, checkAllPermissions, openSettings } = usePermissionGuard();

  const [androidPermissionsGranted, setAndroidPermissionsGranted] = useState<
    boolean | null
  >(null);

  const [checking, setChecking] = useState(false);
  const [checkingInitial, setCheckingInitial] = useState(true);

  /* ============================================================
     RESPONSIVE DIMENSIONS
  ============================================================ */

  const cardWidth = useMemo(() => {
    return Math.min(width - 32, 410);
  }, [width]);

  const availableHeight = useMemo(() => {
    return Math.max(420, height - insets.top - insets.bottom - 32);
  }, [height, insets.top, insets.bottom]);

  const cardMaxHeight = Math.min(availableHeight, 720);

  /* ============================================================
     PERMISSION STATE
  ============================================================ */

  const expoGranted = state === "granted";

  const allGranted = androidPermissionsGranted === true && expoGranted;

  const isBlocked = state === "blocked";

  /* ============================================================
     ANDROID API
  ============================================================ */

  const androidApiLevel = useMemo(() => {
    if (Platform.OS !== "android") {
      return 0;
    }

    return typeof Platform.Version === "number"
      ? Platform.Version
      : Number(Platform.Version);
  }, []);

  /* ============================================================
     CHECK ANDROID PERMISSIONS
  ============================================================ */

  const checkAndroidPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const locationGranted =
        await PermissionsAndroid.check(LOCATION_PERMISSION);

      let nearbyWifiGranted = true;

      /*
       * NEARBY_WIFI_DEVICES exists from Android 13 / API 33.
       */

      if (androidApiLevel >= 33) {
        nearbyWifiGranted = await PermissionsAndroid.check(
          NEARBY_WIFI_PERMISSION as any,
        );
      }

      return locationGranted && nearbyWifiGranted;
    } catch (error) {
      console.warn(
        "[MultiplayerPermissionModal] Failed to check Android permissions:",
        error,
      );

      return false;
    }
  }, [androidApiLevel]);

  /* ============================================================
     CHECK WHEN MODAL OPENS
  ============================================================ */

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let cancelled = false;

    setCheckingInitial(true);
    setChecking(false);

    const runCheck = async () => {
      const result = await checkAndroidPermissions();

      if (!cancelled) {
        setAndroidPermissionsGranted(result);
        setCheckingInitial(false);
      }
    };

    runCheck();

    return () => {
      cancelled = true;
    };
  }, [isVisible, checkAndroidPermissions]);

  /* ============================================================
     AUTO-CLOSE WHEN EVERYTHING IS GRANTED
  ============================================================ */

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (!allGranted) {
      return;
    }

    /*
     * Parent is responsible for closing the modal.
     * This effect only fires when permission state transitions
     * into the fully granted state.
     */

    onGrant();
  }, [isVisible, allGranted, onGrant]);

  /* ============================================================
     ALLOW PERMISSIONS
  ============================================================ */

  const handleAllow = useCallback(async () => {
    if (checking || checkingInitial) {
      return;
    }

    setChecking(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (Platform.OS === "android") {
        const permissionsToRequest: string[] = [];

        const locationGranted =
          await PermissionsAndroid.check(LOCATION_PERMISSION);

        if (!locationGranted) {
          permissionsToRequest.push(LOCATION_PERMISSION);
        }

        /*
         * Android 13+
         */

        if (androidApiLevel >= 33) {
          const nearbyWifiGranted = await PermissionsAndroid.check(
            NEARBY_WIFI_PERMISSION as any,
          );

          if (!nearbyWifiGranted) {
            permissionsToRequest.push(NEARBY_WIFI_PERMISSION);
          }
        }

        /*
         * Request only missing permissions.
         */

        if (permissionsToRequest.length > 0) {
          await PermissionsAndroid.requestMultiple(permissionsToRequest as any);
        }

        /*
         * Always re-check actual OS state after request.
         * Do not rely solely on requestMultiple result.
         */

        const androidResult = await checkAndroidPermissions();

        setAndroidPermissionsGranted(androidResult);

        /*
         * Let the existing guard validate its own
         * permission requirements as well.
         */

        await checkAllPermissions(true);

        return;
      }

      /*
       * iOS / non-Android
       */

      setAndroidPermissionsGranted(true);

      await checkAllPermissions(true);
    } catch (error) {
      console.warn(
        "[MultiplayerPermissionModal] Permission request failed:",
        error,
      );

      setAndroidPermissionsGranted(false);
    } finally {
      setChecking(false);
    }
  }, [
    checking,
    checkingInitial,
    androidApiLevel,
    checkAndroidPermissions,
    checkAllPermissions,
  ]);

  /* ============================================================
     SETTINGS
  ============================================================ */

  const handleOpenSettings = useCallback(async () => {
    if (checking) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await openSettings();
    } catch (error) {
      console.warn(
        "[MultiplayerPermissionModal] Failed to open settings:",
        error,
      );
    }
  }, [checking, openSettings]);

  /* ============================================================
     DENY
  ============================================================ */

  const handleDeny = useCallback(async () => {
    if (checking) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onDeny();
  }, [checking, onDeny]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDeny}
    >
      {/* ======================================================
          BACKDROP
      ====================================================== */}

      <View className="flex-1">
        <LinearGradient
          colors={[
            "rgba(5,5,18,0.96)",
            "rgba(10,12,30,0.94)",
            "rgba(5,8,18,0.97)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
          pointerEvents="none"
        />

        {/* Ambient purple glow */}

        <View
          className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-indigo-500/10"
          pointerEvents="none"
        />

        <View
          className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-500/[0.07]"
          pointerEvents="none"
        />

        {/* Tap outside */}

        <Pressable className="absolute inset-0" onPress={handleDeny} />

        {/* ====================================================
            CENTER AREA
        ==================================================== */}

        <View
          className="flex-1 items-center justify-center px-4"
          style={{
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 12),
          }}
          pointerEvents="box-none"
        >
          <MotiView
            from={{
              opacity: 0,
              scale: 0.94,
              translateY: 18,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              translateY: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              translateY: 18,
            }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 180,
              mass: 0.8,
            }}
            style={{
              width: cardWidth,
              maxHeight: cardMaxHeight,
            }}
            className="overflow-hidden rounded-[30px] border border-indigo-400/20 bg-[#0A0B18]"
          >
            {/* =================================================
                TOP ACCENT
            ================================================= */}

            <LinearGradient
              colors={["#818CF8", "#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-1 w-full"
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-5 pb-5"
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <View className="items-center px-2 pb-5 pt-6">
                {/* ICON */}

                <MotiView
                  from={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    damping: 14,
                    stiffness: 180,
                    delay: 80,
                  }}
                  className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-indigo-400/25 bg-indigo-500/10"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-[20px] border border-indigo-400/15 bg-indigo-500/[0.08]">
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={32}
                      color="#A5B4FC"
                    />
                  </View>
                </MotiView>

                {/* EYEBROW */}

                <Text className="mb-1 font-main-bold text-[10px] uppercase tracking-[2.5px] text-indigo-300/55">
                  Multiplayer setup
                </Text>

                {/* TITLE */}

                <Text className="text-center font-main-bold text-[24px] leading-[30px] text-white">
                  Multiplayer Permissions
                </Text>

                {/* DESCRIPTION */}

                <Text className="mt-2.5 max-w-[330px] text-center font-main text-[12px] leading-[18px] text-white/40">
                  A few permissions are needed to discover nearby players and
                  connect your game.
                </Text>
              </View>

              {/* =================================================
                  CHECKING STATE
              ================================================= */}

              {checkingInitial ? (
                <MotiView
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  className="mb-5 items-center rounded-[22px] border border-white/[0.07] bg-white/[0.035] px-5 py-7"
                >
                  <ActivityIndicator size="small" color="#A78BFA" />

                  <Text className="mt-3 font-main-md text-xs text-white/50">
                    Checking permissions...
                  </Text>

                  <Text className="mt-1 font-main text-[10px] text-white/25">
                    Please wait a moment
                  </Text>
                </MotiView>
              ) : (
                <>
                  {/* =================================================
                      PERMISSION LIST
                  ================================================= */}

                  <View className="mb-2">
                    <PermissionRow
                      icon="map-marker-radius"
                      iconColor="#818CF8"
                      iconBackground="bg-indigo-500/10"
                      title="Location"
                      description="Helps discover friends nearby on the same WiFi."
                      granted={
                        Platform.OS === "android"
                          ? androidPermissionsGranted === true
                          : expoGranted
                      }
                    />

                    <PermissionRow
                      icon="wifi"
                      iconColor="#38BDF8"
                      iconBackground="bg-sky-500/10"
                      title="Nearby WiFi"
                      description="Allows the game to discover nearby devices."
                      granted={
                        Platform.OS === "android"
                          ? androidPermissionsGranted === true
                          : expoGranted
                      }
                    />

                    <PermissionRow
                      icon="qrcode-scan"
                      iconColor="#A78BFA"
                      iconBackground="bg-violet-500/10"
                      title="Camera"
                      description="Used to scan QR codes and join rooms quickly."
                      granted={expoGranted}
                    />
                  </View>

                  {/* =================================================
                      STATUS MESSAGE
                  ================================================= */}

                  {isBlocked ? (
                    <MotiView
                      from={{
                        opacity: 0,
                        translateY: 6,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                      }}
                      className="mb-4 flex-row items-center rounded-2xl border border-orange-400/20 bg-orange-500/[0.08] px-3.5 py-3"
                    >
                      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-orange-400/10">
                        <MaterialCommunityIcons
                          name="alert-outline"
                          size={18}
                          color="#FDBA74"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="font-main-bold text-xs text-orange-200">
                          Permission blocked
                        </Text>

                        <Text className="mt-0.5 font-main text-[10px] leading-4 text-orange-100/45">
                          Enable the required permissions in Android Settings.
                        </Text>
                      </View>
                    </MotiView>
                  ) : (
                    <View className="mb-4 flex-row items-center justify-center">
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={13}
                        color="rgba(255,255,255,0.25)"
                      />

                      <Text className="ml-1.5 font-main text-[10px] text-white/25">
                        Your permissions stay on your device.
                      </Text>
                    </View>
                  )}

                  {/* =================================================
                      SETTINGS BUTTON
                  ================================================= */}

                  {isBlocked && (
                    <Pressable
                      onPress={handleOpenSettings}
                      disabled={checking}
                      className="mb-3 h-14 w-full overflow-hidden rounded-[20px]"
                    >
                      {({ pressed }) => (
                        <MotiView
                          animate={{
                            scale: pressed ? 0.97 : 1,
                          }}
                          transition={{
                            type: "spring",
                            damping: 16,
                            stiffness: 220,
                          }}
                          className="h-full w-full overflow-hidden rounded-[20px]"
                          style={{
                            shadowColor: "#F97316",
                            shadowOffset: {
                              width: 0,
                              height: 7,
                            },
                            shadowOpacity: pressed ? 0.15 : 0.3,
                            shadowRadius: 14,
                            elevation: 7,
                          }}
                        >
                          <LinearGradient
                            colors={["#FB923C", "#F97316", "#EA580C"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="h-full w-full"
                          >
                            <View className="h-full flex-row items-center justify-center">
                              <MaterialCommunityIcons
                                name="cog-outline"
                                size={20}
                                color="white"
                              />

                              <Text className="ml-2.5 font-main-bold text-[13px] uppercase tracking-[2.5px] text-white">
                                Open Settings
                              </Text>
                            </View>
                          </LinearGradient>
                        </MotiView>
                      )}
                    </Pressable>
                  )}

                  {/* =================================================
                      ALLOW BUTTON
                  ================================================= */}

                  <Pressable
                    onPress={handleAllow}
                    disabled={checking}
                    className="h-[58px] w-full overflow-hidden rounded-[20px]"
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{
                          scale: pressed && !checking ? 0.97 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 16,
                          stiffness: 220,
                        }}
                        className="h-full w-full overflow-hidden rounded-[20px]"
                        style={{
                          shadowColor: "#6366F1",
                          shadowOffset: {
                            width: 0,
                            height: 8,
                          },
                          shadowOpacity: checking ? 0 : 0.35,
                          shadowRadius: 16,
                          elevation: checking ? 0 : 9,
                        }}
                      >
                        <LinearGradient
                          colors={
                            checking
                              ? ["#4F46E5", "#4338CA"]
                              : ["#818CF8", "#6366F1", "#4F46E5"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="h-full w-full"
                        >
                          <View className="h-full flex-row items-center justify-center">
                            {checking ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <MaterialCommunityIcons
                                name="shield-check-outline"
                                size={21}
                                color="white"
                              />
                            )}

                            <Text className="ml-2.5 font-main-bold text-[13px] uppercase tracking-[2.5px] text-white">
                              {checking
                                ? "Checking..."
                                : isBlocked
                                  ? "Try Again"
                                  : "Allow & Play"}
                            </Text>
                          </View>
                        </LinearGradient>
                      </MotiView>
                    )}
                  </Pressable>

                  {/* =================================================
                      NOT NOW
                  ================================================= */}

                  <Pressable
                    onPress={handleDeny}
                    disabled={checking}
                    className="mt-2 h-11 w-full items-center justify-center rounded-[18px]"
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{
                          scale: pressed ? 0.96 : 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 16,
                          stiffness: 220,
                        }}
                        className="h-full w-full items-center justify-center"
                      >
                        <Text className="font-main-bold text-[10px] uppercase tracking-[2.5px] text-white/30">
                          Not Now
                        </Text>
                      </MotiView>
                    )}
                  </Pressable>
                </>
              )}
            </ScrollView>
          </MotiView>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(MultiplayerPermissionModal);
