import React from "react";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Dealing Phase:
 * Everyone sees same board animations
 */
const DealingView = ({ g, setIsRulesVisible }: any) => {
  return <BoardWithPopups g={g} setIsRulesVisible={setIsRulesVisible} />;
};

export default DealingView;
