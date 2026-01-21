import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/components/screenwrapper";

type BugsScreenProps = {
  navigation?: {
    goBack: () => void;
  };
};

const BugsScreen: React.FC<BugsScreenProps> = ({ navigation }) => {
  return (
    <ScreenWrapper title="Report a Bug" navigation={navigation}>
      
      <View className="rounded-3xl bg-white p-6 shadow-sm">

        {/* Title Field */}
        <Text className="mb-2 font-medium text-slate-500">
          Issue Title
        </Text>

        <View className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-slate-400">
            e.g. App crashes on login
          </Text>
        </View>

        {/* Description Field */}
        <Text className="mb-2 font-medium text-slate-500">
          Description
        </Text>

        <View className="mb-6 h-32 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-slate-400">
            Provide as much detail as possible...
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="items-center rounded-2xl bg-indigo-500 p-4 shadow-md active:scale-95"
          onPress={() => {
            console.log("Bug submitted");
          }}
        >
          <Text className="text-lg font-bold text-white">
            Submit Report
          </Text>
        </TouchableOpacity>

      </View>

    </ScreenWrapper>
  );
};

export default BugsScreen;
