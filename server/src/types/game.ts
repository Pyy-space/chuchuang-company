// Shared types for the game
export type CompanyType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Card {
  id: string;
  company: CompanyType;
  coinsOnCard?: Coin[]; // Coins placed on market cards when drawing from deck
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
  deck: Card[]; // Draw pile
  market: Card[]; // Market area (visible cards)
  removedCards: Card[]; // 5 cards removed at start
  majorityHolders: MajorityHolder[];
  round: number; // Current round number
  startingPlayerIndex: number; // Starting player for this round
  roundsCompleted: number; // Number of complete rounds
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
