import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeOutDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";
import { Text } from "@/components/Text";
import { rf, hp } from "@/utils/responsive";

type PlayerScore = {
  scores: (number | string)[];
};

type ScoreItem = {
  round: number;
  scores: (number | string)[];
};

interface Props {
  playerNames: string[];
  playerScores: PlayerScore[];
  popupTable: boolean;
  onClose: () => void;
}


const { height } = Dimensions.get("window");
const ROW_HEIGHT = hp(6.5);

const ScoreTable: React.FC<Props> = ({
  playerNames,
  playerScores,
  popupTable = false,
  onClose
}) => {
  const selectedRounds = useSelector(
    (state: RootState) => state.player.gameRound
  );

  // const [isModalVisible, setIsModalVisible] = useState(popupTable);

  const scrollY = useSharedValue(0);
const scrollRef = useRef<Animated.ScrollView>(null);
  const autoScrollRef = useRef<number | null>(null);

  // useEffect(() => {
  //   if (popupTable) {
  //     AudioEngine.play("select", "ui");
  //   }
  //   setIsModalVisible(popupTable);
  // }, [popupTable]);

  // const handleClose = () => setIsModalVisible(false);

  /* ---------------- Score Data ---------------- */

  const scoreData: ScoreItem[] = useMemo(
    () =>
      Array.from({ length: selectedRounds || 20 }, (_, i) => ({
        round: i + 1,
        scores: playerNames.map(
          (_, pIndex) =>
            playerScores[pIndex]?.scores[i] ?? "-"
        ),
      })),
    [selectedRounds, playerNames, playerScores]
  );

  /* ---------------- Scroll Calculations ---------------- */

  const containerHeight = height * 0.85;
  const visibleHeight = containerHeight - hp(22);
  const contentHeight = scoreData.length * (ROW_HEIGHT + hp(1.5));
  const maxScroll = Math.max(contentHeight - visibleHeight, 1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const indicatorHeight = Math.max(
    (visibleHeight / contentHeight) * visibleHeight,
    hp(5)
  );

  const indicatorStyle = useAnimatedStyle(() => {
    const ratio = scrollY.value / maxScroll;

    return {
      transform: [
        {
          translateY:
            ratio * (visibleHeight - indicatorHeight),
        },
      ],
    };
  });

  /* ---------------- Press & Hold Auto Scroll ---------------- */

  const startAutoScroll = (direction: "up" | "down") => {
    if (autoScrollRef.current) return;

    autoScrollRef.current = setInterval(() => {
      const nextOffset =
        direction === "down"
          ? scrollY.value + 18
          : scrollY.value - 18;

      scrollRef.current?.scrollTo({
        y: Math.max(0, Math.min(nextOffset, maxScroll)),
        animated: false,
      });
    }, 16);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

 if (!popupTable) return null;


  return (
    <Modal
      transparent
       visible={popupTable}
  onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />

    <TouchableWithoutFeedback onPress={onClose}>

        <View className="flex-1 bg-black/70 justify-end">
          <View>
            <Animated.View
              entering={FadeInUp.springify()}
              exiting={FadeOutDown}
              className="bg-[#0b0b12] rounded-t-[40px] px-6 pt-6 pb-8 border-t border-white/10"
              style={{ height: containerHeight }}
            >
              {/* Header */}
              <View className="items-center mb-6">
                <View className="w-16 h-1.5 bg-white/20 rounded-full mb-4" />
                <Text
                  style={{ fontSize: rf(2.6) }}
                  className="text-white font-main-bold tracking-wider"
                >
                  🏆 SCOREBOARD
                </Text>
              </View>

              {/* Player Header Row */}
              <View className="flex-row mb-5">
                <View style={{ width: rf(6) }} />
                {playerNames.map((name, index) => (
                  <View
                    key={`header-${index}`}
                    className="flex-1 mx-1 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 items-center justify-center"
                    style={{ height: hp(5) }}
                  >
                    <Text
                      style={{ fontSize: rf(1.2) }}
                      className="text-indigo-300 font-main-bold uppercase tracking-widest"
                    >
                      {name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Scroll Area */}
              <TouchableOpacity
                activeOpacity={1}
                className="flex-1 flex-row"
                onPressIn={(event) => {
                  const { locationY } = event.nativeEvent;

                  if (locationY > visibleHeight / 2) {
                    startAutoScroll("down");
                  } else {
                    startAutoScroll("up");
                  }
                }}
                onPressOut={stopAutoScroll}
              >
                <Animated.ScrollView
                  ref={scrollRef}
                  scrollEnabled={false}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: hp(2) }}
                  style={{ flex: 1 }}
                >
                  {scoreData.map((item) => (
                    <View key={item.round} className="flex-row mb-3">
                      {/* Round */}
                      <View
                        className="mr-2 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                        style={{
                          width: rf(6),
                          height: ROW_HEIGHT,
                        }}
                      >
                        <Text
                          style={{ fontSize: rf(1.3) }}
                          className="text-indigo-400 font-main-bold"
                        >
                          R{item.round}
                        </Text>
                      </View>

                      {/* Scores */}
                      {item.scores.map((score, index) => (
                        <View
                          key={`cell-${index}-${item.round}`}
                          className="flex-1 mx-1 rounded-2xl bg-white/5 items-center justify-center border border-white/5"
                          style={{ height: ROW_HEIGHT }}
                        >
                          <Text
                            style={{ fontSize: rf(1.7) }}
                            className="text-white font-main-bold"
                          >
                            {score}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </Animated.ScrollView>

                {/* Scroll Indicator */}
                <View
                  className="ml-2"
                  style={{
                    width: rf(1),
                    height: visibleHeight,
                  }}
                >
                  <View className="flex-1 bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                      style={[
                        indicatorStyle,
                        {
                          height: indicatorHeight,
                        },
                      ]}
                      className="absolute w-full bg-indigo-500 rounded-full"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onClose}
                className="mt-6 bg-indigo-600 py-4 rounded-3xl items-center shadow-lg shadow-indigo-500/40"
              >
                <Text
                  style={{ fontSize: rf(1.6) }}
                  className="text-white font-main-bold tracking-widest uppercase"
                >
                  Back to Game
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(ScoreTable);
