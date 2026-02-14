import React from "react";
import { Stack } from "expo-router";
import QuizScreen from "@/screens/QuizScreen/quizScreen";

export default function QuizRoute() {
 return (
     <>
       <Stack.Screen 
         options={{
           headerShown: false,
         }} 
       />
       
       <QuizScreen/>
     </>
   );
}
