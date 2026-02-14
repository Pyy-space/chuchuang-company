// Client-side type definitions (same as server for consistency)
export type CompanyType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Card {
  id: string;
  company: CompanyType;
  coinsOnCard?: Coin[]; // Coins placed on market cards when drawing from deck
}

export interface Coin {
  id: string;
  value: 1 | 3;
}

export interface Player {
  id: string;
  name: string;
  handCards: Card[];
  investments: Record<CompanyType, Card[]>;
  coins: Coin[];
  score: number;
  roundScore: number; // Score from current round (+2, +1, -1, or 0)
  debt: number; // Negative assets when unable to pay
  isReady: boolean;
}

export interface MajorityHolder {
  company: CompanyType;
  playerId: string;
}

export type GamePhase = 'WAITING' | 'PLAYING' | 'SETTLEMENT' | 'FINISHED';

export type PendingAction = 'NONE' | 'WAITING_FOR_PLAY'; // Track two-step action phase

export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  deck: Card[];
  market: Card[];
  removedCards: Card[];
  majorityHolders: MajorityHolder[];
  round: number;
  startingPlayerIndex: number;
  roundsCompleted: number;
  actionHistory: GameAction[];
  pendingAction: PendingAction; // Track if player needs to complete second step
  lastCardTaken?: { company: CompanyType; fromMarket: boolean }; // Track card taken in step 1
}

export interface GameAction {
  playerId: string;
  playerName: string;
  type: 'TAKE_CARD' | 'PLAY_TO_MARKET' | 'PLAY_TO_INVESTMENT' | 'SETTLEMENT';
  cardId?: string;
  company?: CompanyType;
  fromMarket?: boolean;
  timestamp: number;
}

export interface Room {
  id: string;
  players: Player[];
  maxPlayers: number;
  gameState?: GameState;
  createdAt: number;
}

export const COMPANY_NAMES: Record<CompanyType, string> = {
  A: 'Alpha Tech',
  B: 'Beta Industries',
  C: 'Crypto Corp',
  D: 'Delta Energy',
  E: 'Epsilon Media',
  F: 'Future Finance'
};

export const COMPANY_COLORS: Record<CompanyType, string> = {
  A: '#FF6B6B',
  B: '#4ECDC4',
  C: '#45B7D1',
  D: '#FFA07A',
  E: '#98D8C8',
  F: '#C7CEEA'
};
