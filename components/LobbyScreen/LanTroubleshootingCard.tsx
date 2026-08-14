import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface TroubleshootingItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    icon: "wifi-outline",
    title: "Same Hotspot",
    description: "All players must connect to the host's hotspot.",
  },
  {
    icon: "cellular-outline",
    title: "Mobile Data & VPN",
    description: "Turn OFF mobile data and any active VPN.",
  },
  {
    icon: "refresh-outline",
    title: "Restart the Game",
    description: "Close and reopen Chor Police if the connection fails.",
  },
];

export const LanTroubleshootingCard: React.FC = () => {
  return (
    <MotiView
      from={{
        opacity: 0,
        translateY: 12,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
        scale: 1,
      }}
      transition={{
        type: "timing",
        duration: 450,
      }}
      className="w-full overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111217]"
    >
      <View className="p-5">
        {/* HEADER */}
        <View className="mb-5 flex-row items-center">
          {/* ICON */}
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/10">
            <Ionicons name="bulb-outline" size={rf(2.1)} color="#93C5FD" />
          </View>

          {/* TITLE */}
          <View className="flex-1">
            <Text
              style={{ fontSize: rf(1.55) }}
              className="font-main-bold text-white"
            >
              Connection Tips
            </Text>

            <Text
              style={{ fontSize: rf(1.15) }}
              className="mt-0.5 font-main-md text-white/40"
            >
              Quick fixes if LAN isn't working
            </Text>
          </View>
        </View>

        {/* ITEMS */}
        <View className="gap-2.5">
          {troubleshootingItems.map((item, index) => (
            <MotiView
              key={item.title}
              from={{
                opacity: 0,
                translateX: -8,
              }}
              animate={{
                opacity: 1,
                translateX: 0,
              }}
              transition={{
                type: "timing",
                duration: 350,
                delay: 100 + index * 70,
              }}
              className="flex-row items-center rounded-2xl border border-white/[0.05] bg-white/[0.035] px-3.5 py-3"
            >
              {/* NUMBER / ICON */}
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                <Ionicons name={item.icon} size={rf(1.7)} color="#A5B4FC" />
              </View>

              {/* CONTENT */}
              <View className="flex-1">
                <Text
                  style={{ fontSize: rf(1.3) }}
                  className="font-main-bold text-white/90"
                >
                  {item.title}
                </Text>

                <Text
                  style={{ fontSize: rf(1.15) }}
                  className="mt-0.5 font-main-md leading-[17px] text-white/45"
                >
                  {item.description}
                </Text>
              </View>

              {/* CHEVRON */}
              <Ionicons
                name="chevron-forward"
                size={rf(1.4)}
                color="rgba(255,255,255,0.2)"
              />
            </MotiView>
          ))}
        </View>

        {/* BOTTOM STATUS */}
        <View className="mt-4 flex-row items-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2.5">
          <View className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />

          <Text
            style={{ fontSize: rf(1.1) }}
            className="flex-1 font-main-md text-emerald-300/70"
          >
            Still having trouble? Make sure everyone is on the same local
            network.
          </Text>
        </View>
      </View>
    </MotiView>
  );
};
