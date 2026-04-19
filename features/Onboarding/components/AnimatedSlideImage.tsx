import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface Props {
  index: number;
  scrollX: SharedValue<number>;
  image: any;
}

const AnimatedSlideImage: React.FC<Props> = ({ index, scrollX, image }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1.1, 0.7],
      Extrapolation.CLAMP,
    );
    const rotateY = `${interpolate(scrollX.value, inputRange, [60, 0, -60], Extrapolation.CLAMP)}deg`;
    const rotateZ = `${interpolate(scrollX.value, inputRange, [-10, 0, 10], Extrapolation.CLAMP)}deg`;
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [60, 0, -60],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [
        { perspective: 1200 },
        { scale },
        { translateX },
        { rotateY },
        { rotateZ },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.Image
        source={image}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
});

export default AnimatedSlideImage;
