// Client-side type definitions (same as server for consistency)
export type CompanyType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Card {
  id: string;
  company: CompanyType;
}

export interface MarketCard {
  card: Card;
  coins: number; // Number of 1-value coins on this card
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
  score: number; // Total score from all rounds
  roundScore: number; // Score from current round (+2, +1, -1)
  negativeAssets: number; // Negative assets when can't pay
  antiMonopolyTokens: CompanyType[]; // Companies where player has anti-monopoly token
  lastDrawnCompany: CompanyType | null; // Company of last card drawn from market
  isReady: boolean;
  hasDrawnThisTurn: boolean; // Whether player has drawn a card this turn
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
  deck: Card[];
  market: MarketCard[]; // Market area (visible cards with coins)
  removedCards: Card[];
  majorityHolders: MajorityHolder[];
  round: number;
  startingPlayerIndex: number;
  roundsCompleted: number;
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
