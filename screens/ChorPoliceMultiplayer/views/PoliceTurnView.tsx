import React from "react";
import { View } from "react-native";
import BoardWithPopups from "../components/BoardWithPopups";
import RoleWaitingDrawer from "../components/RoleWaitingDrawer";

const WAITING_MESSAGES: Record<string, string> = {
  Thief: "Stay quiet... the Police is investigating! 🤫",
  Advisor: "Watching closely... the Police is on the move! 🧠",
  King: "Waiting for the Police to catch the thief... 👑",
  Police: "Catch the Thief and stay away from Joker! 🚨",
};

/**
 * Police Turn & Investigation Shuffle:
 * All players (Police, King, Thief, Advisor) see the board.
 * Private role reveal is handled separately by the `private_reveal` phase
 * which renders <RoleRevealView> before this view is ever reached.
 *
 * Every player gets a bottom role drawer (role icon + message) while the
 * Police investigates — Police sees "Catch the Thief!", others wait.
 */
const PoliceTurnView = ({ g, setIsRulesVisible }: any) => {
  const role = g.myRole;
  const showWaitingDrawer =
    role === "Thief" || role === "Advisor" || role === "King" || role === "Police";

  return (
    <View className="flex-1">
      <BoardWithPopups g={g} setIsRulesVisible={setIsRulesVisible} />
      {showWaitingDrawer && (
        <RoleWaitingDrawer
          role={role}
          message={WAITING_MESSAGES[role]}
        />
      )}
    </View>
  );
};

export default PoliceTurnView;
