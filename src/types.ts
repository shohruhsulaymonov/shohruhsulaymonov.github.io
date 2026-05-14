export interface Question {
  id: string;
  pts: number;
  clue: string;
  answer: string;
  verdict: 'legal' | 'grey' | 'illegal';
  explanation: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

export type GameState = 'setup' | 'board' | 'clue' | 'final';
