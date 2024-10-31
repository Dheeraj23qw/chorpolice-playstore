import React from "react";
import { TouchableOpacity, View } from "react-native";
import { styles } from "./_css/optionbarcss";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface IonicOptions {
  isMuted: boolean;
  setIsMuted: (value: boolean | ((prev: boolean) => boolean)) => void; // Allow for both direct boolean and updater function
}

const OptionHeader = React.memo(({ isMuted, setIsMuted }: IonicOptions) => (
  <View style={styles.headerButtonsContainer}>
    <TouchableOpacity style={styles.headerButton}>
      <Ionicons name="settings" size={24} color="#FFF" />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => setIsMuted((prev) => !prev)} // Toggle mute state
    >
      <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="#FFF" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.headerButton}>
      <Ionicons name="share-social" size={24} color="#FFF" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.headerButton}>
      <MaterialIcons name="star-rate" size={24} color="#FFF" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.headerButton}>
      <MaterialIcons name="group" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
));

// Exporting the memoized component
export default OptionHeader;
