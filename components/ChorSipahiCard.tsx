import React, { memo } from "react";
import { View, Image, TouchableOpacity, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { Text } from "@/components/Text";
import { playerImages } from "@/constants/playerData";
import { AudioEngine } from "@/audio/audioEngine";

const roleImages: Record<string, any> = {
  King: require("@/assets/images/chorsipahi/king.webp"),
  Advisor: require("@/assets/images/chorsipahi/advisor.webp"),
  Thief: require("@/assets/images/chorsipahi/thief.webp"),
  Police: require("@/assets/images/chorsipahi/police.webp"),
  Joker: require("@/assets/images/chorsipahi/joker.webp"),
};

const cardBackImage = require("@/assets/images/chorsipahi/card.webp");

interface ChorSipahiCardProps {
  index: number;
  player: { name: string; avatarId: number };
  role: string;
  isFlipped: boolean;
  isClicked: boolean;
  onPress: (index: number) => void;
  disabled?: boolean;
  phase?: string;
  style?: ViewStyle | any;
  showStatusOverlay?: boolean;
  isHighlight?: boolean;
  isMystery?: boolean;
  highlightColor?: string;
}
const ChorSipahiCardComponent: React.FC<ChorSipahiCardProps> = ({
  index,
  player,
  role,
  isFlipped,
  isClicked,
  onPress,
  disabled,
  phase,
  style,
  showStatusOverlay = true,
  isHighlight = false,
  isMystery = false,
  highlightColor,
}) => {
  const handlePress = () => {
    AudioEngine.play("select", "ui");
    onPress(index);
  };

  const themeColor = highlightColor || "#6366f1";

  return (
    <View style={style} className="aspect-[3/4.2] w-full">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled}
        className="flex-1"
      >
        <MotiView
          animate={{ rotateY: isFlipped ? "180deg" : "0deg" }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          style={{ flex: 1 }}
        >
          <View className="flex-1">
          {/* Front Card Face */}
          <MotiView
            animate={{ opacity: isFlipped ? 0 : 1 }}
            transition={{ type: "timing", duration: 100 }}
            style={{ 
                position: 'absolute',
                height: '100%',
                width: '100%',
                zIndex: isFlipped ? 0 : 1,
            }}
            className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0b12]"
          >
            {isHighlight && (
              <MotiView
                from={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 800,
                  loop: true,
                }}
                style={{
                  backgroundColor: `${themeColor}25`, 
                  borderColor: themeColor,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                }}
                className="rounded-[26px] border-[4px]"
              >
                <View className="items-center justify-center">
                <View 
                  style={{ backgroundColor: themeColor, shadowColor: themeColor }}
                  className="h-2 w-12 rounded-full shadow-lg" 
                />
                </View>
              </MotiView>
            )}
            {(isMystery || phase === "police_turn") ? (
              <Image
                source={cardBackImage}
                className="h-full w-full opacity-80"
                resizeMode="cover"
              />
            ) : (
              <>
                <Image
                  source={playerImages[player.avatarId]?.src || playerImages[1].src}
                  className="h-full w-full opacity-60"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/40" />
                <View className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/60 p-2 items-center">
                  <Text numberOfLines={1} className="font-main-bold text-[10px] text-white uppercase tracking-wider">
                    {player.name || `Player ${index + 1}`}
                  </Text>
                </View>
              </>
            )}

            {showStatusOverlay && isClicked && !isFlipped && (
              <View className="absolute inset-0 z-20 items-center justify-center rounded-[26px] border-4 border-yellow-500/60 bg-yellow-500/20">
                <View className="rounded-full bg-yellow-500 px-3 py-1">
                  <Text className="font-main-bold text-[10px] text-black">SELECTED</Text>
                </View>
              </View>
            )}
          </MotiView>

          {/* Back Card Face (Role) */}
          <MotiView
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ type: "timing", duration: 100 }}
            style={{ 
                position: 'absolute',
                height: '100%',
                width: '100%',
                transform: [{ rotateY: "180deg" }],
                zIndex: isFlipped ? 1 : 0,
            }}
            className={`items-center justify-center rounded-[26px] border border-indigo-500/40 bg-[#050507] ${
              isClicked && phase === "result"
                ? role === "Thief"
                  ? "border-green-500 bg-green-500/10"
                  : "border-red-500 bg-red-500/10"
                : ""
            }`}
          >
            {!isMystery && (
              <View className="absolute top-3 rounded-full border border-white/10 bg-indigo-950/80 px-3 py-1">
                <Text numberOfLines={1} className="font-main-bold text-[8px] uppercase text-indigo-200">
                  {player.name || `Player ${index + 1}`}
                </Text>
              </View>
            )}
            {role && <Image source={roleImages[role] || roleImages.Thief} className="h-3/4 w-3/4" resizeMode="contain" />}
            <View className="absolute bottom-3 rounded-full border border-indigo-400/40 bg-indigo-950/90 px-4 py-1.5">
              <Text className="font-main-bold text-[11px] uppercase tracking-widest text-indigo-100">{role || "Unknown"}</Text>
            </View>
          </MotiView>
          </View>
        </MotiView>
      </TouchableOpacity>
    </View>
  );
};

export const ChorSipahiCard = memo(ChorSipahiCardComponent);
