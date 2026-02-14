import { Card, Coin, CompanyType, GameState, Player, MajorityHolder } from '../types/game';

/**
 * Game logic for Chuchuang Company investment game
 * 游戏逻辑模块
 */

const COMPANIES: CompanyType[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const CARDS_PER_COMPANY = 12; // Each company has 12 cards
const INITIAL_HAND_SIZE = 3;
const INITIAL_COINS = 10;
const REMOVED_CARDS_COUNT = 5;
const MARKET_SIZE = 5; // Number of visible cards in market

/**
 * Create a full deck of cards
 * 创建完整牌堆
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  COMPANIES.forEach(company => {
    for (let i = 0; i < CARDS_PER_COMPANY; i++) {
      deck.push({
        id: `${company}-${i}`,
        company
      });
    }
  });
  return deck;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * 洗牌算法
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create initial coins for a player
 * 创建初始硬币
 */
export function createInitialCoins(): Coin[] {
  const coins: Coin[] = [];
  for (let i = 0; i < INITIAL_COINS; i++) {
    coins.push({
      id: `coin-${Date.now()}-${i}`,
      value: 1 // All coins start with value 1
    });
  }
  return coins;
}

/**
 * Initialize game state
 * 初始化游戏状态
 */
export function initializeGame(roomId: string, players: Player[]): GameState {
  // Create and shuffle deck
  let deck = shuffleArray(createDeck());
  
  // Remove 5 cards from the game
  const removedCards = deck.splice(0, REMOVED_CARDS_COUNT);
  
  // Deal initial hands
  players.forEach(player => {
    player.handCards = deck.splice(0, INITIAL_HAND_SIZE);
    player.coins = createInitialCoins();
    player.investments = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: []
    };
    player.score = 0;
  });
  
  // Setup market area
  const market = deck.splice(0, Math.min(MARKET_SIZE, deck.length));
  
  return {
    roomId,
    players,
    currentPlayerIndex: 0,
    phase: 'PLAYING',
    deck,
    market,
    removedCards,
    majorityHolders: [],
    round: 1,
    startingPlayerIndex: 0,
    roundsCompleted: 0,
    actionHistory: []
  };
}

/**
 * Calculate majority holders for each company
 * 计算每家公司的大股东
 */
export function calculateMajorityHolders(players: Player[]): MajorityHolder[] {
  const majorityHolders: MajorityHolder[] = [];
  
  COMPANIES.forEach(company => {
    let maxCount = 0;
    let majorityPlayerId: string | null = null;
    
    players.forEach(player => {
      const count = player.investments[company].length;
      if (count > maxCount) {
        maxCount = count;
        majorityPlayerId = player.id;
      } else if (count === maxCount && count > 0) {
        // Tie - no majority holder
        majorityPlayerId = null;
      }
    });
    
    if (majorityPlayerId && maxCount > 0) {
      majorityHolders.push({
        company,
        playerId: majorityPlayerId
      });
    }
  });
  
  return majorityHolders;
}

/**
 * Check if player can draw a card from market (anti-monopoly rule)
 * 检查玩家是否可以从市场抽牌（反垄断规则）
 */
export function canDrawFromMarket(
  playerId: string,
  cardCompany: CompanyType,
  majorityHolders: MajorityHolder[]
): boolean {
  const holder = majorityHolders.find(h => h.company === cardCompany);
  // Player cannot draw if they are the majority holder of this company
  return !holder || holder.playerId !== playerId;
}

/**
 * Perform settlement when deck is empty
 * 执行结算
 */
export function performSettlement(gameState: GameState): GameState {
  const { players } = gameState;
  
  // Calculate final majority holders
  const finalMajorityHolders = calculateMajorityHolders(players);
  
  // For each company, non-majority holders pay majority holder
  COMPANIES.forEach(company => {
    const holder = finalMajorityHolders.find(h => h.company === company);
    if (!holder) return; // No majority holder for this company
    
    const majorityPlayer = players.find(p => p.id === holder.playerId);
    if (!majorityPlayer) return;
    
    // Other players pay
    players.forEach(player => {
      if (player.id === holder.playerId) return; // Majority holder doesn't pay
      
      const investmentCount = player.investments[company].length;
      if (investmentCount === 0) return; // No investment, no payment
      
      // Transfer coins from player to majority holder
      const coinsToTransfer = player.coins.splice(0, Math.min(investmentCount, player.coins.length));
      
      // Flip coins to value 3
      coinsToTransfer.forEach(coin => {
        coin.value = 3;
      });
      
      majorityPlayer.coins.push(...coinsToTransfer);
    });
  });
  
  // Calculate scores based on coin values
  players.forEach(player => {
    const totalValue = player.coins.reduce((sum, coin) => sum + coin.value, 0);
    player.score += totalValue;
  });
  
  return {
    ...gameState,
    phase: 'SETTLEMENT',
    majorityHolders: finalMajorityHolders
  };
}

/**
 * Check if game should end (all players have been starting player once)
 * 检查游戏是否应该结束
 */
export function shouldEndGame(gameState: GameState): boolean {
  return gameState.roundsCompleted >= gameState.players.length;
}

/**
 * Start a new round
 * 开始新一轮
 */
export function startNewRound(gameState: GameState): GameState {
  const { players } = gameState;
  
  // Reset for new round
  let deck = shuffleArray(createDeck());
  const removedCards = deck.splice(0, REMOVED_CARDS_COUNT);
  
  // Reset player states
  players.forEach(player => {
    player.handCards = deck.splice(0, INITIAL_HAND_SIZE);
    player.coins = createInitialCoins();
    player.investments = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: []
    };
  });
  
  const market = deck.splice(0, Math.min(MARKET_SIZE, deck.length));
  
  // Move starting player to next
  const newStartingPlayerIndex = (gameState.startingPlayerIndex + 1) % players.length;
  
  return {
    ...gameState,
    deck,
    market,
    removedCards,
    currentPlayerIndex: newStartingPlayerIndex,
    startingPlayerIndex: newStartingPlayerIndex,
    phase: 'PLAYING',
    majorityHolders: [],
    round: gameState.round + 1,
    roundsCompleted: gameState.roundsCompleted + 1,
    actionHistory: []
  };
}

/**
 * Refill market from deck
 * 从牌堆补充市场区域
 */
export function refillMarket(gameState: GameState): GameState {
  const { deck, market } = gameState;
  
  while (market.length < MARKET_SIZE && deck.length > 0) {
    market.push(deck.shift()!);
  }
  
  return {
    ...gameState,
    deck,
    market
  };
}
