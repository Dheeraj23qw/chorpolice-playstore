import React, { useState, useCallback } from "react";
import { Pressable, View } from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_css/optionbarcss";
import { useDispatch, useSelector } from "react-redux";
import { stopQuizSound, playSound } from "@/redux/reducers/soundReducer";
import { useRouter } from "expo-router";
import { RootState } from "@/redux/store";
import CustomRatingModal from "@/modal/RatingModal";
import { handleShare } from "@/utils/share";

const OptionHeader = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const isMuted = useSelector((state: RootState) => state.sound.isMuted);
  const dispatch = useDispatch();


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

  return (
    <View style={styles.headerButtonsContainer}>
      {/* Mute/Unmute Button */}
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
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
        style={({ pressed }) => [
          styles.headerButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={24} color="#FFF" />
      </Pressable>

      {/* Star Rate Button */}
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={toggleModal}
      >
        <MaterialIcons name="star-rate" size={24} color="#FFF" />
      </Pressable>

      {/* Navigate to Awards */}
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => router.push("/award")}
      >
        <Ionicons name="trophy" size={24} color="#FFF" />
      </Pressable>

      {/* Custom Rating Modal */}
      <CustomRatingModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title="Enjoying the App?"
      />
    </View>
  );
};

export default React.memo(OptionHeader);
