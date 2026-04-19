import React from "react";
import { Image, Dimensions } from "react-native";
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
      [0.8, 1, 0.8],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, 30],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={image}
        style={{ width: 240, height: 240 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default AnimatedSlideImage;
