import React, { useEffect, useState } from "react";
import { View, StatusBar, BackHandler } from "react-native";
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
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<string>("");

  const dispatch = useDispatch();
  const router = useRouter();

  const {handleQuit} = useQuizGameLogic();

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
    level,
  } = useSelector((state: RootState) => state.difficulty);

  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

useEffect(() => {
  if (level != null) {
    const coinValues = {
      easy: isWinner ? 250 : 40,
      medium: isWinner ? 800 : 100,
      hard: isWinner ? 2000 : 200,
    };

    const levelMessage = isWinner
      ? `You won ${coinValues[level]} coins!`
      : `Participation Reward: ${coinValues[level]} coins`;

    dispatch(addCoins(coinValues[level]));
    setCoinsAwarded(levelMessage);
  }
}, []);

  useEffect(() => {
    const backAction = () => {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Hold on!",
        textBody: "Are you sure you want to Exit?",
        button: "YES",
        autoClose: false,
        onPressButton: () => {
          Dialog.hide();
          handleQuit();
        },
      });
  
      return true; 
    };
  
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
  
    return () => subscription.remove();
  }, []);

  const handleHome = () => {
    handleQuit();
    router.replace("/modeselect");
  };

 

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