

export interface LeaderboardItem {
  id: string;
  name: string;
  score: number;
  lastRoundTime: number;
  totalTime: number;
  avatarId: number; 
  isFinished?: boolean;
}