import React from "react";
import { RoleRevealView } from "../views/RoleRevealView";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Police Turn:
 * - Police/King → Board
 * - Thief/Advisor → Big role card
 */
const PoliceTurnView = ({ g }: any) => {
  if (!g.canSeeBoard && g.myRole) {
    return <RoleRevealView role={g.myRole} round={g.round} />;
  }

  return <BoardWithPopups g={g} />;
};

export default PoliceTurnView;
