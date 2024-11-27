import { Pressable, View, Text } from "react-native";
import { styles } from "@/screens/QuizScreen/_styles/quizResultStyles";

interface RenderButtonsProps {
  handleShare: () => void;
  handleHome: () => void;
  toggleModal: () => void;
}

export const RenderButtons: React.FC<RenderButtonsProps> = ({
  handleShare,
  handleHome,
  toggleModal,
}) => (
  <View style={styles.buttonsContainer}>
    <Pressable style={styles.button} onPress={handleShare}>
      <Text style={styles.buttonText}>Share</Text>
    </Pressable>
    <Pressable style={styles.button} onPress={handleHome}>
      <Text style={styles.buttonText}>Home</Text>
    </Pressable>
    <Pressable style={styles.button} onPress={toggleModal}>
      <Text style={styles.buttonText}>Rate Us</Text>
    </Pressable>
  </View>
);
