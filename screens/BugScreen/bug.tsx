import React from "react";
import { View, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";

type BugsScreenProps = {
  navigation?: {
    goBack: () => void;
  };
};

const BugsScreen: React.FC<BugsScreenProps> = ({ navigation }) => {
  return (
    <ScreenWrapper title="Report a Bug" >
      
      <View className="rounded-3xl bg-white p-6 shadow-sm">

        {/* Title Field Label */}
        <Text className="mb-2 font-main-md text-slate-500">
          Issue Title
        </Text>

        <View className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-slate-400 font-main-md">
            e.g. App crashes on login
          </Text>
        </View>

        {/* Description Field Label */}
        <Text className="mb-2 font-main-md text-slate-500">
          Description
        </Text>

        <View className="mb-6 h-32 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-slate-400 font-main-md">
            Provide as much detail as possible...
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="items-center rounded-2xl bg-indigo-500 p-4 shadow-md active:scale-95"
        >
          {/* Swapped font-bold for font-main-bold */}
          <Text className="text-lg font-main-bold text-white">
            Submit Report
          </Text>
        </TouchableOpacity>

      </View>

    </ScreenWrapper>
  );
};

export default BugsScreen;