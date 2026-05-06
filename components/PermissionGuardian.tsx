import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface Props {
  onAllGranted: () => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
}

const PERMISSION_DETAILS: Record<
  string,
  {
    icon: string;
    title: string;
    desc: string;
    optional?: boolean;
    color: string;
  }
> = {
  Location: {
    icon: "map-marker-radius",
    title: "Find Friends",
    desc: "Helps your phone find nearby players.",
    color: "#818cf8",
  },
  "Location Services": {
    icon: "crosshairs-gps",
    title: "Turn On Location",
    desc: "Needed to discover rooms near you.",
    color: "#fb923c",
  },
  Camera: {
    icon: "camera-outline",
    title: "Scan QR Code",
    desc: "Use camera to join a room quickly.",
    color: "#38bdf8",
  },
  Notifications: {
    icon: "bell-outline",
    title: "Game Alerts",
    desc: "Get game reminders and rewards.",
    optional: true,
    color: "#facc15",
  },
};

export const PermissionGuardian: React.FC<Props> = ({
  onAllGranted,
  onSkip,
  title = "Ready to Play?",
  description = "Allow these so multiplayer works smoothly.",
}) => {
  const {
    state,
    missingPermissions,
    servicesDisabled,
    attemptCount,
    checkAllPermissions,
    openSettings,
  } = usePermissionGuard();

  React.useEffect(() => {
    if (state === "granted") {
      onAllGranted();
    }
  }, [state, onAllGranted]);

  if (state === "granted") {
    return null;
  }

  const displayItems = [...missingPermissions];

  if (servicesDisabled && !displayItems.includes("Location")) {
    displayItems.push("Location Services");
  }

  const handleMainPress = () => {
    if (state === "blocked") {
      openSettings();
      return;
    }

    checkAllPermissions();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }

    onAllGranted();
  };

  return (
    <View className="flex-1 bg-[#050508]">
      <LinearGradient
        colors={["#111827", "#050508", "#020617"]}
        locations={[0, 0.48, 1]}
        className="absolute inset-0"
      />

      <View className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-indigo-500/20" />
      <View className="absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-violet-500/10" />

      <View className="flex-1 justify-center px-6 py-8">
        <MotiView
          from={{ opacity: 0, scale: 0.94, translateY: 18 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 17 }}
          className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-2xl"
        >
          <BlurView intensity={28} tint="dark" className="p-7">
            <View className="items-center">
              <View className="mb-5 h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] border border-indigo-300/20 bg-indigo-500/15">
                <LinearGradient
                  colors={["rgba(129,140,248,0.35)", "rgba(79,70,229,0.10)"]}
                  className="absolute inset-0"
                />

                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={42}
                  color="#C7D2FE"
                />
              </View>

              <Text className="text-center font-main-bold text-3xl text-white">
                {title}
              </Text>

              <Text className="mt-2 px-3 text-center font-main-md text-sm leading-5 text-white/50">
                {description}
              </Text>
            </View>

            <ScrollView
              className="my-7 max-h-[300px]"
              showsVerticalScrollIndicator={false}
            >
              {displayItems.map((item) => {
                const info = PERMISSION_DETAILS[item] || {
                  icon: "help-circle-outline",
                  title: item,
                  desc: "Needed for this game feature.",
                  color: "#CBD5E1",
                };

                return (
                  <MotiView
                    key={item}
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 250 }}
                    className="border-white/8 mb-3 flex-row items-center rounded-3xl border bg-white/5 p-4"
                  >
                    <View
                      className="mr-4 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
                      style={{
                        shadowColor: info.color,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.18,
                        shadowRadius: 12,
                        elevation: 6,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={info.icon as any}
                        size={25}
                        color={info.color}
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-main-bold text-base text-white">
                          {info.title}
                        </Text>

                        {info.optional && (
                          <View className="ml-2 rounded-full bg-white/10 px-2 py-0.5">
                            <Text className="font-main-bold text-[8px] uppercase tracking-[1px] text-white/45">
                              Optional
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-white/42 mt-1 font-main-md text-xs leading-4">
                        {info.desc}
                      </Text>
                    </View>
                  </MotiView>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={handleMainPress}
              activeOpacity={0.85}
              className="h-16 overflow-hidden rounded-[24px]"
              style={{
                shadowColor: "#6366F1",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
                elevation: 12,
              }}
            >
              <LinearGradient
                colors={
                  state === "blocked"
                    ? ["#F97316", "#EF4444"]
                    : ["#818CF8", "#6366F1", "#4F46E5"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-full flex-row items-center justify-center"
              >
                <MaterialCommunityIcons
                  name={
                    state === "blocked" ? "cog-outline" : "check-circle-outline"
                  }
                  size={22}
                  color="white"
                />

                <Text className="ml-2 font-main-bold text-base uppercase tracking-[2px] text-white">
                  {state === "blocked" ? "Open Settings" : "Allow & Play"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {state === "blocked" && (
              <Text className="mt-4 text-center font-main-md text-[11px] leading-4 text-red-300/80">
                Permission is blocked. Please turn it on from phone settings.
              </Text>
            )}

            {servicesDisabled && state !== "blocked" && (
              <Text className="mt-4 text-center font-main-md text-[11px] leading-4 text-orange-300/85">
                Location is off. Turn it on so nearby rooms can appear.
              </Text>
            )}

            {attemptCount >= 2 && (
              <TouchableOpacity
                onPress={handleSkip}
                activeOpacity={0.8}
                className="mt-6 self-center rounded-full border border-indigo-300/20 bg-indigo-500/10 px-5 py-2"
              >
                <Text className="font-main-bold text-xs uppercase tracking-[2px] text-indigo-200">
                  Skip for Now
                </Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </MotiView>
      </View>
    </View>
  );
};
