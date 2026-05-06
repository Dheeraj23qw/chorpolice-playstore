import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Rocket, Sparkles, X } from "lucide-react-native";

import { Text } from "@/components/Text";

interface UpdateAppModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateUrl: string;
  latestVersion: string;
}

export const UpdateAppModal: React.FC<UpdateAppModalProps> = ({
  isVisible,
  onClose,
  updateUrl,
  latestVersion,
}) => {
  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl);
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <AnimatePresence>
          {isVisible && (
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.modalContainer}
            >
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              
              <LinearGradient
                colors={["rgba(124, 58, 237, 0.2)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.content}>
                {/* Decorative Elements */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={["#8B5CF6", "#EC4899"]}
                    style={styles.iconBackground}
                  >
                    <Rocket color="white" size={32} />
                  </LinearGradient>
                  <MotiView
                    from={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.5 }}
                    transition={{
                      loop: true,
                      type: "timing",
                      duration: 2000,
                    }}
                    style={styles.iconPulse}
                  />
                </View>

                <Text style={styles.title} className="font-main-bold">
                  New Version Available!
                </Text>
                
                <View style={styles.versionBadge}>
                  <Sparkles size={12} color="#FBBF24" />
                  <Text style={styles.versionText} className="font-main-bold">
                    v{latestVersion}
                  </Text>
                </View>

                <Text style={styles.description}>
                  Update app for best gaming experience. We&apos;ve added new features and improved stability for your multiplayer matches.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleUpdate}
                  style={styles.updateButton}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#7C3AED"]}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText} className="font-main-bold">
                      UPDATE NOW
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.xButton}
                onPress={onClose}
              >
                <X color="rgba(255,255,255,0.5)" size={20} />
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(15, 15, 20, 0.95)",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  iconPulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  versionText: {
    color: "#FBBF24",
    fontSize: 12,
  },
  description: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  updateButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    letterSpacing: 1,
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 14,
  },
  xButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});
