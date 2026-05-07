import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import { handleShare } from "@/utils/share";
import { FullScreenMenu } from "@/components/sidebar";
import CustomRatingModal from "@/modal/RatingModal";
import { CircleBtn } from "./CircleBtn"; // Import from new chunk
import { useHeaderActions } from "@/hooks/useHeaderActions";
import { useAppSelector } from "@/hooks/useAppRedux";
import { generateNumericCode } from "@/utils/referral";
import { NarrationSettingsModal } from "./thinkAndCountScreen/NarrationSettingsModal";

const SLATE_TRANSPARENT = "rgba(0, 0, 0, 0.1)";
const ICON_COLOR = "#FFFFFF";

const OptionHeader = memo(function OptionHeader() {
  const {
    isMuted,
    modalVisible,
    setModalVisible,
    menuOpen,
    setMenuOpen,
    router,
    toggleSound,
  } = useHeaderActions();

  const [narrationModalVisible, setNarrationModalVisible] = React.useState(false);

  const btnDim = responsiveWidth(11);
  const iconSize = responsiveFontSize(2.8);
  const marginBetween = responsiveWidth(3);

  const localPlayerId = useAppSelector((s) => s.session.localPlayerId);
  const referralCode = generateNumericCode(localPlayerId);

  return (
    <View
      style={{
        paddingVertical: responsiveHeight(1.5),
        paddingHorizontal: responsiveWidth(4),
      }}
      className="flex-row items-center justify-end"
    >
      <CircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={() => setNarrationModalVisible(true)}
      >
        <Ionicons
          name="mic-outline"
          size={iconSize}
          color={ICON_COLOR}
        />
      </CircleBtn>


      <CircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={() => router.push("/earn")}
      >
        <Ionicons name="flash" size={iconSize} color={ICON_COLOR} />
      </CircleBtn>

      <CircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="star" size={iconSize} color={ICON_COLOR} />
      </CircleBtn>

      <CircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={() => router.push("/report-bug")}
      >
        <Ionicons name="bug" size={iconSize} color={ICON_COLOR} />
      </CircleBtn>

      <CircleBtn
        btnDim={btnDim}
        marginBetween={marginBetween}
        backgroundColor={SLATE_TRANSPARENT}
        onPress={() => setMenuOpen(true)}
      >
        <Ionicons name="settings" size={iconSize} color={ICON_COLOR} />
      </CircleBtn>

      <CustomRatingModal
        title="Rate Chor Police"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <FullScreenMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        router={router}
        onRatePress={() => setModalVisible(true)}
        onSharePress={() => handleShare(referralCode)}
        onSoundToggle={toggleSound}
        isMuted={isMuted}
      />


      <NarrationSettingsModal
        visible={narrationModalVisible}
        onClose={() => setNarrationModalVisible(false)}
      />
    </View>
  );
});


OptionHeader.displayName = "OptionHeader";
export default OptionHeader;
