import React from "react";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Result Phase:
 * Everyone sees final board
 */
const ResultView = ({ g, setIsRulesVisible }: any) => {
  return <BoardWithPopups g={g} setIsRulesVisible={setIsRulesVisible} />;
};

export default ResultView;
