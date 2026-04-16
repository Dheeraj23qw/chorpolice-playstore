import React from "react";
import BoardWithPopups from "../components/BoardWithPopups";

/**
 * Result Phase:
 * Everyone sees final board
 */
const ResultView = ({ g }: any) => {
  return <BoardWithPopups g={g} />;
};

export default ResultView;
