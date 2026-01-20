
export interface GameRecord {
  id?: string;
  player_name: string;
  attempts: number;
  time_seconds: number;
  created_at?: string;
}

export interface GuessEntry {
  number: number;
  result: 'high' | 'low' | 'correct';
  timestamp: number;
}

export type GameState = 'IDLE' | 'PLAYING' | 'WON';
