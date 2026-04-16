import React from "react";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Dealing Phase:
 * Everyone sees same board animations
 */
const DealingView = ({ g }: any) => {
  return <BoardWithPopups g={g} />;
};

export default DealingView;
