import { View } from "react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

export const JoinHeaderBlock = () => (
  <View className="mb-6">
    <Text 
      style={{ fontSize: rf(4) }}
      className="mt-2 font-main-bold text-white"
    >
      Scan Host QR Code
    </Text>
  </View>
);
