export const getTotalScoreUpToRound = (
    table: (string | number)[][],
    roundIndex: number,
    player: "Police" | "Thief" | "King" | "Advisor"
  ): number => {
    const playerColumnMap: Record<string, number> = {
      Police: 1,
      Thief: 2,
      King: 3,
      Advisor: 4,
    };
    
    const columnIndex = playerColumnMap[player];
  
    const maxRoundIndex = table.length - 1;
    if (roundIndex >= maxRoundIndex) {
      roundIndex = maxRoundIndex - 1; 
    }
  
    let total = 0;
    for (let i = 1; i <= roundIndex + 1; i++) {
      const roundRow = table[i];
      total += (roundRow[columnIndex] as number) || 0; 
    }
  
    return total;
  };