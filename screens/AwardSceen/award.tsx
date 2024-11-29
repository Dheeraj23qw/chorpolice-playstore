import { View, SafeAreaView, ImageBackground, StatusBar } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { globalstyles } from "@/styles/global";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const TREASURE_GIF = 12;

export default function Award() {
  const router = useRouter();
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(true); 
  const coins = useSelector((state: RootState) => state.coins.coins);
const msg =`you have won ${coins} coins`
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDynamicPopUp(false); 
      router.back()
    }, 2500); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={[globalstyles.container]}>
      <StatusBar backgroundColor={"transparent"}/>

      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        style={[
          chorPoliceQuizstyles.overlay,
          chorPoliceQuizstyles.imageBackground,
        ]}
        resizeMode="cover"
      >
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={TREASURE_GIF} 
          mediaType="gif" 
          closeVisibleDelay={2500}
          playerData={{
            message:msg,
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
