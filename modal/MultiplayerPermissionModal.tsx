import React, { useEffect, useState } from "react";
import {
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Text } from "@/components/Text";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";

interface Props {
  isVisible: boolean;
  onGrant: () => void;
  onDeny: () => void;
}

const LOCATION_PERMISSION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

const NEARBY_WIFI_PERMISSION = "android.permission.NEARBY_WIFI_DEVICES";

const MultiplayerPermissionModal: React.FC<Props> = ({
  isVisible,
  onGrant,
  onDeny,
}) => {
  const { state, checkAllPermissions, openSettings } =
    usePermissionGuard();

  const [androidPermissionsGranted, setAndroidPermissionsGranted] = useState<
    boolean | null
  >(null);

  const [checking, setChecking] = useState(false);
  const [checkingInitial, setCheckingInitial] = useState(true);

  const expoGranted = state === "granted";

  const allGranted = androidPermissionsGranted === true && expoGranted;

  /**
   * When the permission guard confirms everything is granted,
   * notify the parent.
   */
  useEffect(() => {
    if (!isVisible || !allGranted) return;

    onGrant();
  }, [isVisible, allGranted, onGrant]);

  /**
   * Check Android permissions whenever the modal opens.
   */
  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;

    const checkPermissions = async () => {
      if (Platform.OS !== "android") {
        if (!cancelled) {
          setAndroidPermissionsGranted(true);
          setCheckingInitial(false);
        }
        return;
      }

      try {
        const apiLevel =
          typeof Platform.Version === "number"
            ? Platform.Version
            : Number(Platform.Version);

        const locationGranted =
          await PermissionsAndroid.check(LOCATION_PERMISSION);

        let nearbyWifiGranted = true;

        if (apiLevel >= 33) {
          nearbyWifiGranted = await PermissionsAndroid.check(
            NEARBY_WIFI_PERMISSION as any,
          );
        }

        if (!cancelled) {
          setAndroidPermissionsGranted(locationGranted && nearbyWifiGranted);
          setCheckingInitial(false);
        }
      } catch {
        if (!cancelled) {
          setAndroidPermissionsGranted(false);
          setCheckingInitial(false);
        }
      }
    };

    checkPermissions();

    return () => {
      cancelled = true;
    };
  }, [isVisible]);

  const handleAllow = async () => {
    if (checking) return;

    setChecking(true);

    try {
      if (Platform.OS === "android") {
        const apiLevel =
          typeof Platform.Version === "number"
            ? Platform.Version
            : Number(Platform.Version);

        const permissionsToRequest: string[] = [];

        const locationGranted =
          await PermissionsAndroid.check(LOCATION_PERMISSION);

        if (!locationGranted) {
          permissionsToRequest.push(LOCATION_PERMISSION);
        }

        /**
         * Android 13+
         */
        if (apiLevel >= 33) {
          const nearbyWifiGranted = await PermissionsAndroid.check(
            NEARBY_WIFI_PERMISSION as any,
          );

          if (!nearbyWifiGranted) {
            permissionsToRequest.push(NEARBY_WIFI_PERMISSION);
          }
        }

        if (permissionsToRequest.length > 0) {
          const results = await PermissionsAndroid.requestMultiple(
            permissionsToRequest as any,
          );

          const locationOk =
            locationGranted ||
            results[LOCATION_PERMISSION] === PermissionsAndroid.RESULTS.GRANTED;

          let nearbyWifiOk = true;

          if (apiLevel >= 33) {
            nearbyWifiOk =
              (await PermissionsAndroid.check(NEARBY_WIFI_PERMISSION as any)) ||
              results[NEARBY_WIFI_PERMISSION] ===
                PermissionsAndroid.RESULTS.GRANTED;
          }

          setAndroidPermissionsGranted(locationOk && nearbyWifiOk);
        } else {
          setAndroidPermissionsGranted(true);
        }
      } else {
        setAndroidPermissionsGranted(true);
      }

      /**
       * Let the existing permission guard perform its own
       * permission validation.
       */
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
  };

  const isBlocked = state === "blocked";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-[#0b0b18] px-6">
        <Pressable
          className="absolute inset-0"
          onPress={onDeny}
        />
        <LinearGradient
          colors={["#070714", "#0b0b18", "#070714"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
          style={{ opacity: 0.7 }}
        />

        <MotiView
          from={{
            opacity: 0,
            scale: 0.9,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            translateY: 20,
          }}
          className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0b18] shadow-2xl"
        >
          <View className="p-8">
            {/* Header */}
            <View className="mb-6 items-center">
              <View className="mb-4 rounded-full bg-indigo-500/20 p-4">
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={40}
                  color="#C7D2FE"
                />
              </View>

              <Text className="text-center font-main-bold text-2xl text-white">
                Multiplayer Permissions
              </Text>

              <Text className="mt-2 text-center font-main-md text-sm text-white/50">
                To play multiplayer, we need a few permissions to find nearby
                players and connect your game.
              </Text>
            </View>

            {checkingInitial && (
              <View className="py-8 items-center">
                 <ActivityIndicator size="large" color="#A855F7" />
                <Text className="mt-3 font-main-md text-sm text-white/60">
                  Checking permissions...
                </Text>
              </View>
            )}

            {!checkingInitial && (
            <>
            {/* Location */}
            <View className="border-white/8 mb-3 flex-row items-center rounded-2xl border bg-white/5 p-4">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-indigo-500/15">
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={24}
                  color="#818CF8"
                />
              </View>

              <View className="flex-1">
                <Text className="font-main-bold text-base text-white">
                  Location
                </Text>

                <Text className="text-white/42 mt-1 font-main-md text-xs leading-4">
                  Helps find friends nearby on the same WiFi.
                </Text>
              </View>
            </View>

            {/* Nearby WiFi */}
            <View className="border-white/8 mb-3 flex-row items-center rounded-2xl border bg-white/5 p-4">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-sky-500/15">
                <MaterialCommunityIcons name="wifi" size={24} color="#38BDF8" />
              </View>

              <View className="flex-1">
                <Text className="font-main-bold text-base text-white">
                  Nearby WiFi
                </Text>

                <Text className="text-white/42 mt-1 font-main-md text-xs leading-4">
                  Lets the app discover nearby devices on your network.
                </Text>
              </View>
            </View>

            {/* Camera */}
            <View className="border-white/8 mb-6 flex-row items-center rounded-2xl border bg-white/5 p-4">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-sky-500/15">
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={24}
                  color="#38BDF8"
                />
              </View>

              <View className="flex-1">
                <Text className="font-main-bold text-base text-white">
                  Camera
                </Text>

                <Text className="text-white/42 mt-1 font-main-md text-xs leading-4">
                  Scan QR codes to join rooms quickly.
                </Text>
              </View>
            </View>

             {/* Settings */}
             {isBlocked && (
               <Pressable
                 onPress={() => {
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                   openSettings();
                 }}
                 className="mb-4 h-14 overflow-hidden rounded-[24px]"
                 style={{
                   shadowColor: "#F97316",
                   shadowOffset: { width: 0, height: 8 },
                   shadowOpacity: 0.4,
                   shadowRadius: 16,
                   elevation: 8,
                 }}
               >
                 {({ pressed }) => (
                   <MotiView
                     animate={{ scale: pressed ? 0.97 : 1 }}
                     transition={{ type: "spring", damping: 15, stiffness: 200 }}
                     className="h-full w-full overflow-hidden rounded-[24px]"
                   >
                     <LinearGradient
                       colors={["#FB923C", "#F97316", "#EF4444"]}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 1 }}
                       style={StyleSheet.absoluteFill}
                     >
                       <View className="h-full flex-row items-center justify-center gap-2">
                         <MaterialCommunityIcons
                           name="cog-outline"
                           size={22}
                           color="white"
                         />
                         <Text className="font-main-bold text-base uppercase tracking-[3px] text-white">
                           Open Settings
                         </Text>
                       </View>
                     </LinearGradient>
                   </MotiView>
                 )}
               </Pressable>
             )}

             {/* Allow */}
             <Pressable
               onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                 handleAllow();
               }}
               disabled={checking}
               className="h-16 overflow-hidden rounded-[24px]"
               style={{
                 shadowColor: "#A855F7",
                 shadowOffset: { width: 0, height: 12 },
                 shadowOpacity: 0.45,
                 shadowRadius: 20,
                 elevation: 12,
               }}
             >
               {({ pressed }) => (
                 <MotiView
                   animate={{ scale: pressed && !checking ? 0.97 : 1 }}
                   transition={{ type: "spring", damping: 15, stiffness: 200 }}
                   className="h-full w-full overflow-hidden rounded-[24px]"
                 >
                   <LinearGradient
                     colors={["#C084FC", "#A855F7", "#7C3AED"]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={StyleSheet.absoluteFill}
                   >
                     <View className="h-full flex-row items-center justify-center gap-2">
                       <MaterialCommunityIcons
                         name={checking ? "loading" : "check-circle-outline"}
                         size={22}
                         color="white"
                       />
                       <Text className="font-main-bold text-base uppercase tracking-[3px] text-white">
                         {checking ? "Please wait..." : "Allow & Play"}
                       </Text>
                     </View>
                   </LinearGradient>
                 </MotiView>
               )}
             </Pressable>

             {/* Cancel */}
             <Pressable
               onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 onDeny();
               }}
               disabled={checking}
               className="mt-5 h-12 items-center justify-center overflow-hidden rounded-[20px]"
             >
               {({ pressed }) => (
                 <MotiView
                   animate={{ scale: pressed ? 0.95 : 1 }}
                   transition={{ type: "spring", damping: 15, stiffness: 200 }}
                   className="h-full w-full items-center justify-center rounded-[20px] border border-white/15 bg-white/10"
                 >
                   <Text className="font-main-bold text-sm uppercase tracking-[3px] text-white/70">
                     Not Now
                   </Text>
                 </MotiView>
               )}
             </Pressable>
            </>
          )}
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

export default React.memo(MultiplayerPermissionModal);
