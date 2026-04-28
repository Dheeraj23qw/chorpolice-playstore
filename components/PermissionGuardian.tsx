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

const PERMISSION_INFO: Record<string, { icon: string; desc: string }> = {
  Location: {
    icon: "map-marker-radius",
    desc: "Used to find nearby players and host game lobbies on your local network.",
  },
  Camera: {
    icon: "camera-outline",
    desc: "Needed to scan QR codes for quickly joining a game room.",
  },
  Notifications: {
    icon: "bell-outline",
    desc: "Keeps you updated on game results and invitations from your friends.",
    optional: true,
  },
};

export const PermissionGuardian: React.FC<Props> = ({ 
  onAllGranted,
  onSkip,
  title = "Permissions Required",
  description = "Chor Police needs a few permissions to get started. Only Location and Camera are mandatory for multiplayer."
}) => {
  const { state, missingPermissions, attemptCount, checkAllPermissions, openSettings } = usePermissionGuard();

  React.useEffect(() => {
    if (state === "granted") {
      onAllGranted();
    }
  }, [state, onAllGranted]);

  if (state === "granted") {
    return null;
  }

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
          {missingPermissions.map((perm) => (
            <View key={perm} className="flex-row items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/5">
              <View className="bg-white/10 p-2 rounded-xl mr-4">
                <MaterialCommunityIcons 
                  name={(PERMISSION_INFO[perm]?.icon as any) || "help-circle-outline"} 
                  size={24} 
                  color="white" 
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-main-bold text-white text-base">{perm}</Text>
                  {PERMISSION_INFO[perm]?.optional && (
                    <View className="ml-2 bg-white/10 px-2 py-0.5 rounded-md">
                      <Text className="text-[8px] text-white/40 uppercase font-main-bold tracking-tighter">Recommended</Text>
                    </View>
                  )}
                </View>
                <Text className="font-main-md text-white/40 text-xs mt-0.5">
                  {PERMISSION_INFO[perm]?.desc}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={state === "blocked" ? openSettings : checkAllPermissions}
          className="bg-indigo-600 h-16 rounded-2xl items-center justify-center active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <Text className="font-main-bold text-white text-lg uppercase tracking-widest">
            {state === "blocked" ? "Open System Settings" : "Grant Permissions"}
          </Text>
        </TouchableOpacity>

        {state === "blocked" && (
          <Text className="text-red-400 text-[10px] font-main-md text-center mt-4">
            You've permanently denied some permissions. You must enable them manually in settings.
          </Text>
        )}
        
        {attemptCount >= 2 && (
          <TouchableOpacity
            onPress={onSkip || onAllGranted}
            className="mt-6 self-center"
          >
            <Text className="font-main-bold text-indigo-400 text-xs uppercase tracking-[3px] border-b border-indigo-400/30 pb-1">
              Skip for Now & Play
            </Text>
          </TouchableOpacity>
        )}
      </MotiView>
    </View>
  );
};
