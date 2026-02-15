import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import * as LucideIcons from "lucide-react-native";

interface Props {
  imageUri?: string | null;
  level: number;
  onPress: () => void;
}

export default function AvatarWithLevel({ imageUri, level, onPress }: Props) {
  const PLACEHOLDER =
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop";

  return (
    <View className="mt-8 w-full items-center">
      <View className="relative">
        <View className="rounded-[50px] border-[6px] border-slate-900 shadow-2xl">
          <View className="rounded-[44px] border-2 border-white/20 p-1 bg-slate-800">
            <TouchableOpacity
              onPress={onPress}
              className="h-40 w-40 overflow-hidden rounded-[40px] items-center justify-center"
            >
              <Image
                source={{ uri: imageUri || PLACEHOLDER }}
                className="h-full w-full"
                resizeMode="cover"
              />
              {/* Camera overlay */}
              <View className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full">
                <LucideIcons.Camera size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Level badge */}
        <View className="absolute -bottom-2 -right-2 bg-yellow-500 px-3 py-1 rounded-xl border-4 border-slate-900 shadow-lg rotate-3">
          <Text className="text-xs font-main-bold text-slate-900">
            LVL {level}
          </Text>
        </View>
      </View>
    </View>
  );
}
