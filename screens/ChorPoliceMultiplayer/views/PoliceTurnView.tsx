import React from "react";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Police Turn & Investigation Shuffle:
 * All players (Police, King, Thief, Advisor) see the board.
 * Private role reveal is handled separately by the `private_reveal` phase
 * which renders <RoleRevealView> before this view is ever reached.
 */
const PoliceTurnView = ({ g }: any) => {
  return <BoardWithPopups g={g} />;
};

export default PoliceTurnView;
