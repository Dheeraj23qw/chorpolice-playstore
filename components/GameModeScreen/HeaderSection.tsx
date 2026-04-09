import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import RulesButton from "@/components/rules/rulesButton";
import OptionHeader from "@/components/optionHeader";

const HeaderSection = () => {
  return (
    <View
      style={{
        paddingHorizontal: wp(6),
        marginBottom: hp(2),
        paddingTop: hp(4),
      }}
    >
      <OptionHeader />
    </View>
  );
};

export default React.memo(HeaderSection);
