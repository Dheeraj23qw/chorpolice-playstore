import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import useRandomMessage from "@/hooks/useRandomMessage";
import CustomRatingModal from "@/modal/RatingModal";
import { RootState } from "@/redux/store";
import { playSound } from "@/redux/reducers/soundReducer";
import { addCoins } from "@/redux/reducers/coinsReducer";

import { ResultInfo } from "./components/reseltInfo";
import { RenderButtons } from "./components/renderButtons";
import { handleShare } from "@/utils/share";
import { useBackHandler } from "@/utils/BackHandler";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<string>("");
  const [coinsAwardedOnce, setCoinsAwardedOnce] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
    level,
  } = useSelector((state: RootState) => state.difficulty);

  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

  useEffect(() => {
    if (!coinsAwardedOnce && level != null) {
      const coinValues = {
        easy: isWinner ? 100 : 10,
        medium: isWinner ? 500 : 25,
        hard: isWinner ? 2000 : 50,
      };
      const levelMessage = isWinner
        ? `You won ${coinValues[level]} coins!`
        : `Participation Reward: ${coinValues[level]} coins`;

      dispatch(addCoins(coinValues[level]));
      setCoinsAwarded(levelMessage);
      setCoinsAwardedOnce(true);
    }
  }, [level, isWinner]);

  const handleHome = () => {
    dispatch(playSound("quiz"));
    router.replace("/modeselect");
  };

   useBackHandler(
      () => {
        router.replace("/modeselect");
        dispatch(playSound("quiz"));
        return true;
      },
      { priority: 1 },
    );

  const toggleModal = () => setModalVisible((prev) => !prev);

  return (
    <View className="flex-1 bg-[#09090b]">
      {/* 1. System UI Setup */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 2. Responsive Background Glows (Fixed) */}
      <View 
        style={{ width: wp(120), height: wp(120), top: -hp(15), left: -wp(30) }} 
        className={`absolute rounded-full opacity-20 blur-[100px] ${isWinner ? "bg-emerald-500" : "bg-indigo-600"}`} 
      />
      
      <View 
        style={{ width: wp(100), height: wp(100), bottom: -hp(10), right: -wp(20) }} 
        className={`absolute rounded-full opacity-10 blur-[100px] ${isWinner ? "bg-emerald-600" : "bg-purple-600"}`} 
      />

      {/* 3. Main Content Container (No ScrollView for cleaner centering) */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: wp(4) }}>
        
        {/* Result Information Section */}
        <View style={{ marginBottom: hp(2) }}>
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
          />
        </View>

        {/* Action Buttons Section */}
        <RenderButtons
          handleShare={handleShare}
          handleHome={handleHome}
          toggleModal={toggleModal}
        />
      </View>

      {/* 4. Overlay Modals */}
      <CustomRatingModal
        visible={modalVisible}
        onClose={toggleModal}
        title="Enjoying the Journey?"
      />
    </View>
  );
}