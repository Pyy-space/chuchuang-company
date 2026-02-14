// Shared types for the game
export type CompanyType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Card {
  id: string;
  company: CompanyType;
}

export interface Coin {
  id: string;
  value: 1 | 3; // Two sides: 1 and 3
}

export interface Player {
  id: string;
  name: string;
  handCards: Card[];
  investments: Record<CompanyType, Card[]>; // Cards played for each company
  coins: Coin[];
  score: number;
  isReady: boolean;
}

export interface MajorityHolder {
  company: CompanyType;
  playerId: string;
}

export type GamePhase = 'WAITING' | 'PLAYING' | 'SETTLEMENT' | 'FINISHED';

export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  deck: Card[]; // Draw pile
  market: Card[]; // Market area (visible cards)
  removedCards: Card[]; // 5 cards removed at start
  majorityHolders: MajorityHolder[];
  round: number; // Current round number
  startingPlayerIndex: number; // Starting player for this round
  roundsCompleted: number; // Number of complete rounds
  actionHistory: GameAction[];
}

export interface GameAction {
  playerId: string;
  playerName: string;
  type: 'DRAW_DECK' | 'DRAW_MARKET' | 'PLAY_CARD' | 'SETTLEMENT';
  cardId?: string;
  company?: CompanyType;
  timestamp: number;
}

export interface Room {
  id: string;
  players: Player[];
  maxPlayers: number;
  gameState?: GameState;
  createdAt: number;
}
