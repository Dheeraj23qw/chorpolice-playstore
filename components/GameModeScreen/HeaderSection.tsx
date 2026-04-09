import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hp, wp } from "@/utils/responsive";
import OptionHeader from "@/components/optionHeader";

const HeaderSection = () => {
  return (
    <Animated.View
      // entering animation with a slight delay and spring for a "cool" feel
      entering={FadeInDown.delay(100).springify().damping(15)}
      style={{
        paddingHorizontal: wp(6),
        marginBottom: hp(2),
        paddingTop: hp(4),
      }}
    >
      <OptionHeader />
    </Animated.View>
  );
};

export default React.memo(HeaderSection);
