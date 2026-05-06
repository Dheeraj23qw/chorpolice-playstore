import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Text } from "@/components/Text";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  onAllGranted: () => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
}

const PERMISSION_INFO: Record<string, { icon: string; desc: string; optional?: boolean }> = {
  Location: {
    icon: "map-marker-radius",
    desc: "Needed to find nearby players.",
  },
  Camera: {
    icon: "camera-outline",
    desc: "Needed to scan QR codes.",
  },
  Notifications: {
    icon: "bell-outline",
    desc: "Keeps you updated on game results.",
    optional: true,
  },
};

export const PermissionGuardian: React.FC<Props> = ({ 
  onAllGranted,
  onSkip,
  title = "Permissions Required",
  description = "Chor Police needs these permissions to start multiplayer."
}) => {
  const { state, missingPermissions, servicesDisabled, attemptCount, checkAllPermissions, openSettings } = usePermissionGuard();

  React.useEffect(() => {
    if (state === "granted") {
      onAllGranted();
    }
  }, [state, onAllGranted]);

  if (state === "granted") {
    return null;
  }

  // Generate the list of items to show. If services are disabled, we add a special entry.
  const displayItems = [...missingPermissions];
  if (servicesDisabled && !displayItems.includes("Location")) {
    displayItems.push("Location Services");
  }

  const PERMISSION_DETAILS: Record<string, { icon: string; title: string; desc: string; optional?: boolean }> = {
    Location: {
      icon: "map-marker-radius",
      title: "Location Permission",
      desc: "Find nearby players and host lobbies.",
    },
    "Location Services": {
      icon: "crosshairs-gps",
      title: "GPS / Location Services",
      desc: "Turn on GPS to discover players.",
    },
    Camera: {
      icon: "camera-outline",
      title: "Camera Access",
      desc: "Scan QR codes to join rooms.",
    },
    Notifications: {
      icon: "bell-outline",
      title: "Notifications",
      desc: "Updates on results and invites.",
      optional: true,
    },
  };

  return (
    <View className="flex-1 bg-[#050508] p-6 justify-center">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b0b18] rounded-[32px] p-8 border border-white/10 shadow-2xl"
      >
        <View className="items-center mb-6">
          <View className="bg-indigo-500/20 p-4 rounded-full mb-4">
            <MaterialCommunityIcons name="shield-check-outline" size={40} color="#818cf8" />
          </View>
          <Text className="font-main-bold text-2xl text-white text-center">
            {title}
          </Text>
          <Text className="font-main-md text-sm text-white/50 text-center mt-2 px-4">
            {description}
          </Text>
        </View>

        <ScrollView className="max-h-[300px] mb-8" showsVerticalScrollIndicator={false}>
          {displayItems.map((item) => {
            const info = PERMISSION_DETAILS[item] || { icon: "help-circle-outline", title: item, desc: "Required for game features." };
            return (
              <View key={item} className="flex-row items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/5">
                <View className="bg-white/10 p-2 rounded-xl mr-4">
                  <MaterialCommunityIcons 
                    name={info.icon as any} 
                    size={24} 
                    color={item === "Location Services" ? "#f87171" : "white"} 
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-main-bold text-white text-base">{info.title}</Text>
                    {info.optional && (
                      <View className="ml-2 bg-white/10 px-2 py-0.5 rounded-md">
                        <Text className="text-[8px] text-white/40 uppercase font-main-bold tracking-tighter">Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-main-md text-white/40 text-xs mt-0.5">
                    {info.desc}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => (state === "blocked" ? openSettings : checkAllPermissions)()}
          className="bg-indigo-600 h-16 rounded-2xl items-center justify-center active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <Text className="font-main-bold text-white text-lg uppercase tracking-widest">
            {state === "blocked" ? "Open System Settings" : "Grant Access"}
          </Text>
        </TouchableOpacity>

        {state === "blocked" && (
          <Text className="text-red-400 text-[10px] font-main-md text-center mt-4">
            Permissions are permanently denied. Please enable them manually in Android settings.
          </Text>
        )}

        {servicesDisabled && state !== "blocked" && (
          <Text className="text-orange-400 text-[10px] font-main-md text-center mt-4">
            Location Services (GPS) are disabled. Please turn them on in your phone&apos;s status bar.
          </Text>
        )}
        
        {attemptCount >= 2 && (
          <TouchableOpacity
            onPress={onSkip || onAllGranted}
            className="mt-6 self-center"
          >
            <Text className="font-main-bold text-indigo-400 text-xs uppercase tracking-[3px] border-b border-indigo-400/30 pb-1">
              Skip for Now
            </Text>
          </TouchableOpacity>
        )}
      </MotiView>
    </View>
  );
};
