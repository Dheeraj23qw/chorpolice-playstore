import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { MotiView } from "moti";

import { Text } from "@/components/Text";
import { hp } from "@/utils/responsive";

interface OfflineCountdownBadgeProps {
  value: number;
}

export const OfflineCountdownBadge: React.FC<OfflineCountdownBadgeProps> = ({
  value,
}) => {
  return (
    <MotiView
      key={value}
      from={{
        scale: 0.42,
        opacity: 0,
        translateY: 18,
        rotate: "-7deg",
      }}
      animate={{
        scale: 1,
        opacity: 1,
        translateY: 0,
        rotate: "0deg",
      }}
      transition={{
        type: "spring",
        damping: 9,
        stiffness: 155,
        mass: 0.65,
      }}
      className="absolute inset-x-0 items-center"
      style={{
        bottom: hp(2),
        zIndex: 999,
        elevation: 999,
      }}
      pointerEvents="none"
    >
      <View style={styles.glowWrap}>
        <View
          className="items-center justify-center rounded-full border-2"
          style={styles.badge}
        >
          {/* Background depth layers: always before Text */}
          <View style={styles.deepShade} />
          <View style={styles.innerRing} />
          <View style={styles.centerGlass} />
          <View style={styles.topShine} />
          <View style={styles.sideShine} />

          {/* Number must stay LAST */}
          <Text
            style={styles.number}
            className="text-center font-main-bold text-white"
          >
            {value}
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

const BADGE_SIZE = 88;

const styles = StyleSheet.create({
  glowWrap: {
    width: BADGE_SIZE + 10,
    height: BADGE_SIZE + 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.18)",

    ...Platform.select({
      ios: {
        shadowColor: "#818CF8",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 22,
      },
      android: {
        elevation: 18,
      },
    }),
  },

  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    overflow: "hidden",

    borderColor: "rgba(255,255,255,0.34)",
    backgroundColor: "#6366F1",

    ...Platform.select({
      ios: {
        shadowColor: "#312E81",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
      },
      android: {
        elevation: 20,
      },
    }),
  },

  deepShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "rgba(49,46,129,0.28)",
  },

  innerRing: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(30,27,75,0.22)",
  },

  centerGlass: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  topShine: {
    position: "absolute",
    top: 10,
    width: 38,
    height: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.32)",
  },

  sideShine: {
    position: "absolute",
    left: 13,
    top: 20,
    width: 9,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  number: {
    fontSize: 48,
    lineHeight: 52,
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,

    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
});
