import React, { useState, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./playerNameScreen/_css/optionbarcss";
import { useDispatch, useSelector } from "react-redux";
import { stopQuizSound, playSound } from "@/redux/reducers/soundReducer";
import { useRouter } from "expo-router";
import { RootState } from "@/redux/store";
import CustomRatingModal from "@/modal/RatingModal";
import { handleShare } from "@/utils/share";

const OptionHeader = React.memo(() => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const isMuted = useSelector((state: RootState) => state.sound.isMuted);
  const dispatch = useDispatch();

  // Memoized handlers
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const toggleModal = useCallback(() => {
    setModalVisible((prevState) => !prevState);
  }, []);

  const handleQuizSound = useCallback(() => {
    if (isMuted) {
      dispatch(playSound("quiz"));
    } else {
      dispatch(stopQuizSound());
    }
  }, [dispatch, isMuted]);

  const buttonStyle = useMemo(() => [
    styles.headerButton,
    { opacity: 1 }, 
  ], []);

  const pressedStyle = useMemo(() => [
    styles.headerButton,
    { opacity: 0.7 }, 
  ], []);

  return (
    <View style={styles.headerButtonsContainer}>
      <Pressable
        style={({ pressed }) => (pressed ? pressedStyle : buttonStyle)}
        onPress={handleQuizSound}
      >
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={24}
          color="#FFF"
        />
      </Pressable>

      {/* Share Button */}
      <Pressable
        style={({ pressed }) => (pressed ? pressedStyle : buttonStyle)}
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={24} color="#FFF" />
      </Pressable>

      {/* Star Rate Button */}
      <Pressable
        style={({ pressed }) => (pressed ? pressedStyle : buttonStyle)}
        onPress={toggleModal}
      >
        <MaterialIcons name="star-rate" size={24} color="#FFF" />
      </Pressable>

      {/* Navigate to Awards */}
      <Pressable
        style={({ pressed }) => (pressed ? pressedStyle : buttonStyle)}
        onPress={() => router.push("/award")}
      >
        <Ionicons name="trophy" size={24} color="#FFF" />
      </Pressable>

         {/* Settings Button */}
         <Pressable
        style={({ pressed }) => (pressed ? pressedStyle : buttonStyle)}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings" size={24} color="#FFF" />
      </Pressable>

      {/* Custom Rating Modal */}
      <CustomRatingModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title="Enjoying the App?"
      />
    </View>
  );
});

export default OptionHeader;
