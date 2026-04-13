import React from "react";
import { View, Image } from "react-native";
import { Text } from "@/components/Text";
import Animated, { FadeIn, ZoomIn, FadeInDown } from "react-native-reanimated";
import { wp, hp, rf } from "@/utils/responsive";

/**
 * Full-screen private role reveal.
 * Shows the ACTUAL role image (thief.png, advisor.png, etc.)
 * Displayed AFTER both King and Police are publicly revealed.
 * Only Thief and Advisor see this — Police/King stay on the board.
 */

const roleImages: Record<string, any> = {
  King: require("@/assets/images/chorsipahi/king.png"),
  Advisor: require("@/assets/images/chorsipahi/advisor.png"),
  Thief: require("@/assets/images/chorsipahi/thief.png"),
  Police: require("@/assets/images/chorsipahi/police.png"),
};

const ROLE_CONFIG: Record<string, { color: string; subtitle: string; label: string }> = {
  Thief: {
    color: "#EF4444",
    subtitle: "Stay hidden! The Police is looking for you...",
    label: "THE THIEF",
  },
  Advisor: {
    color: "#A78BFA",
    subtitle: "Your identity is hidden. Wait for the Police's guess.",
    label: "THE ADVISOR",
  },
  King: {
    color: "#FACC15",
    subtitle: "You rule the kingdom.",
    label: "THE KING",
  },
  Police: {
    color: "#60A5FA",
    subtitle: "Find the Thief!",
    label: "THE POLICE",
  },
};

interface Props {
  role: string;
  playerName?: string;
  round: number;
}

export const RoleRevealView: React.FC<Props> = ({ role, playerName, round }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Thief;
  const image = roleImages[role] || roleImages.Thief;

  return (
    <View className="flex-1 items-center justify-center bg-[#050508]">
      {/* Round tag */}
      <Animated.View entering={FadeIn.delay(100).duration(400)}>
        <View className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-1.5">
          <Text className="font-main-bold text-[10px] uppercase tracking-[4px] text-white/40">
            Round {round}
          </Text>
        </View>
      </Animated.View>

      {/* "Your Secret Role" label */}
      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <Text className="font-main-bold text-[9px] uppercase tracking-[8px] text-white/20 mb-4">
          Your Secret Role
        </Text>
      </Animated.View>

      {/* Role title with glow */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <Text
          style={{
            color: config.color,
            textShadowColor: config.color,
            textShadowRadius: 20,
            fontSize: rf(4),
          }}
          className="font-main-bold text-center tracking-[6px] mb-6"
        >
          {config.label}
        </Text>
      </Animated.View>

      {/* BIG role image (thief.png / advisor.png) */}
      <Animated.View
        entering={ZoomIn.delay(400).duration(600).springify()}
        className="items-center justify-center"
      >
        {/* Colored glow behind image */}
        <View
          style={{ backgroundColor: config.color, opacity: 0.08 }}
          className="absolute w-72 h-72 rounded-full"
        />

        <Image
          source={image}
          style={{ width: wp(75), height: hp(35) }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeIn.delay(800).duration(400)} className="mt-8 px-10">
        <Text
          className="text-center font-main-regular text-sm leading-5"
          style={{ color: `${config.color}90` }}
        >
          {config.subtitle}
        </Text>
      </Animated.View>

      {/* Police investigating indicator */}
      <Animated.View
        entering={FadeIn.delay(1200).duration(400)}
        className="mt-10 flex-row items-center rounded-2xl border border-blue-500/15 bg-blue-500/8 px-5 py-3"
      >
        <Text style={{ fontSize: 18 }}>🔍</Text>
        <View className="ml-3">
          <Text className="font-main-bold text-xs text-blue-400">
            Police is investigating...
          </Text>
          <Text className="font-main-regular text-[10px] text-white/30 mt-0.5">
            Waiting for their guess
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};
