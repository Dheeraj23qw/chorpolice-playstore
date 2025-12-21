import React from "react";
import { Pressable, View, Text, ImageBackground } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { rulestyles } from "../_CSS/rulestyle";

interface RulesButtonProps {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RulesButton: React.FC<RulesButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={rulestyles.wrapper}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[rulestyles.button, animatedStyle]}
      >
        <ImageBackground
          source={require("@/assets/images/bg/gamemode/2.png")} // 👈 your image
          resizeMode="cover"
          style={rulestyles.bg}
          imageStyle={rulestyles.bgImage}
        >

              <View style={rulestyles.overlay} />

          <Text style={rulestyles.text}>Game Rules 📚</Text>
        </ImageBackground>
      </AnimatedPressable>
    </View>
  );
};

export default React.memo(RulesButton);
