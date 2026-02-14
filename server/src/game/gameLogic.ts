import { Card, Coin, CompanyType, GameState, Player, MajorityHolder, MarketCard } from '../types/game';

const COMPANIES: CompanyType[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const CARDS_PER_COMPANY: Record<CompanyType, number> = {
  A: 5,
  B: 6,
  C: 7,
  D: 8,
  E: 9,
  F: 10
};
const INITIAL_HAND_SIZE = 3;
const INITIAL_COINS = 10;
const REMOVED_CARDS_COUNT = 5;

export function createDeck(): Card[] {
  const deck: Card[] = [];
  COMPANIES.forEach(company => {
    for (let i = 0; i < CARDS_PER_COMPANY[company]; i++) {
      deck.push({
        id: `${company}-${i}`,
        company
      });
    }
  });
  return deck;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  console.log(`[shuffleArray] 洗牌前: ${array.slice(0, 10).map((item: any) => item.company || item).join(', ')}`);
  console.log(`[shuffleArray] 洗牌后: ${shuffled.slice(0, 10).map((item: any) => item.company || item).join(', ')}`);
  return shuffled;
}

export function createInitialCoins(): Coin[] {
  const coins: Coin[] = [];
  for (let i = 0; i < INITIAL_COINS; i++) {
    coins.push({
      id: `coin-${Date.now()}-${i}`,
      value: 1
    });
  }
  return coins;
}

export function initializeGame(roomId: string, players: Player[]): GameState {
  let deck = shuffleArray(createDeck());
  
  console.log(`[initializeGame] 初始牌堆大小: ${deck.length}`);
  console.log(`[initializeGame] 牌堆内容: ${deck.map(c => c.company).join(', ')}`);
  
  const removedCards = deck.splice(0, REMOVED_CARDS_COUNT);
  console.log(`[initializeGame] 移除的卡牌: ${removedCards.map(c => c.company).join(', ')}`);
  console.log(`[initializeGame] 移除后牌堆大小: ${deck.length}`);
  
  players.forEach(player => {
    player.handCards = deck.splice(0, INITIAL_HAND_SIZE);
    console.log(`[initializeGame] 玩家 ${player.name} 初始手牌: ${player.handCards.map(c => c.company).join(', ')}`);
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
    player.roundScore = 0;
    player.negativeAssets = 0;
    player.antiMonopolyTokens = [];
    player.lastDrawnCompany = null;
    player.hasDrawnThisTurn = false;
  });
  
  console.log(`[initializeGame] 发牌后牌堆大小: ${deck.length}`);
  
  const market: MarketCard[] = [];
  
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

export function canDrawFromDeck(
  playerId: string,
  gameState: GameState
): boolean {
  return gameState.deck.length > 0;
}

export function drawFromDeck(gameState: GameState, playerId: string): { gameState: GameState; success: boolean; message: string } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { gameState, success: false, message: '玩家未找到' };
  }
  
  if (gameState.deck.length === 0) {
    return { gameState, success: false, message: '牌堆已空' };
  }
  
  if (player.hasDrawnThisTurn) {
    return { gameState, success: false, message: '本回合已经摸过牌了' };
  }
  
  const coinsNeeded = gameState.market.filter(marketCard => {
    const majorityHolder = gameState.majorityHolders.find(h => 
      h.company === marketCard.card.company && h.playerId === playerId
    );
    return !majorityHolder;
  }).length;
  
  if (player.coins.length < coinsNeeded) {
    return { gameState, success: false, message: `硬币不足，需要${coinsNeeded}个硬币` };
  }
  
  const drawnCard = gameState.deck.shift()!;
  console.log(`[drawFromDeck] 玩家 ${player.name} 摸牌前手牌数: ${player.handCards.length}, 摸牌: ${drawnCard.company}, 牌堆剩余: ${gameState.deck.length}`);
  
  const updatedMarket = gameState.market.map(marketCard => {
    const majorityHolder = gameState.majorityHolders.find(h => 
      h.company === marketCard.card.company && h.playerId === playerId
    );
    return majorityHolder ? marketCard : {
      ...marketCard,
      coins: marketCard.coins + 1
    };
  });
  
  const updatedPlayer = {
    ...player,
    handCards: [...player.handCards, drawnCard],
    lastDrawnCompany: drawnCard.company,
    hasDrawnThisTurn: true,
    coins: player.coins.slice(coinsNeeded)
  };
  
  const updatedPlayers = gameState.players.map(p => p.id === playerId ? updatedPlayer : p);
  
  console.log(`[drawFromDeck] 玩家 ${player.name} 摸牌后手牌数: ${updatedPlayer.handCards.length}`);
  
  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      deck: [...gameState.deck],
      market: updatedMarket
    },
    success: true,
    message: `从牌堆抽取了${drawnCard.company}卡牌，支付了${coinsNeeded}个硬币`
  };
}

export function drawFromMarket(gameState: GameState, playerId: string, marketIndex: number): { gameState: GameState; success: boolean; message: string } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { gameState, success: false, message: '玩家未找到' };
  }
  
  if (player.hasDrawnThisTurn) {
    return { gameState, success: false, message: '本回合已经摸过牌了' };
  }
  
  if (marketIndex < 0 || marketIndex >= gameState.market.length) {
    return { gameState, success: false, message: '无效的市场卡牌索引' };
  }
  
  const marketCard = gameState.market[marketIndex];
  
  const majorityHolder = gameState.majorityHolders.find(h => 
    h.company === marketCard.card.company && h.playerId === playerId
  );
  
  if (majorityHolder) {
    return { gameState, success: false, message: '你是该公司的大股东，不能从市场摸取该公司的卡牌' };
  }
  
  const coinsToReceive = marketCard.coins;
  const updatedMarket = gameState.market.filter((_, i) => i !== marketIndex);
  
  const newCoins: Coin[] = Array(coinsToReceive).fill(0).map((_, i) => ({
    id: `coin-${Date.now()}-${i}`,
    value: 1
  }));
  
  const updatedPlayer = {
    ...player,
    handCards: [...player.handCards, marketCard.card],
    lastDrawnCompany: marketCard.card.company,
    hasDrawnThisTurn: true,
    coins: [...player.coins, ...newCoins]
  };
  
  const updatedPlayers = gameState.players.map(p => p.id === playerId ? updatedPlayer : p);
  
  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      market: updatedMarket
    },
    success: true,
    message: `从市场抽取了${marketCard.card.company}卡牌，收回了${coinsToReceive}个硬币`
  };
}

export function playCardToMarket(gameState: GameState, playerId: string, cardIndex: number): { gameState: GameState; success: boolean; message: string; roundEnded: boolean } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { gameState, success: false, message: '玩家未找到', roundEnded: false };
  }
  
  if (cardIndex < 0 || cardIndex >= player.handCards.length) {
    return { gameState, success: false, message: '无效的卡牌索引', roundEnded: false };
  }
  
  const card = player.handCards[cardIndex];
  
  const coinsNeeded = gameState.market.length;
  
  if (player.coins.length < coinsNeeded) {
    return { gameState, success: false, message: `硬币不足，需要${coinsNeeded}个硬币`, roundEnded: false };
  }
  
  const updatedMarket = gameState.market.map(marketCard => ({
    ...marketCard,
    coins: marketCard.coins + 1
  }));
  
  const newMarketCard = {
    card,
    coins: 0
  };
  
  const updatedPlayer = {
    ...player,
    handCards: player.handCards.filter((_, i) => i !== cardIndex),
    coins: player.coins.slice(coinsNeeded),
    lastDrawnCompany: null,
    hasDrawnThisTurn: false
  };
  
  const updatedPlayers = gameState.players.map(p => p.id === playerId ? updatedPlayer : p);
  
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  
  if (nextPlayerIndex === gameState.startingPlayerIndex && gameState.deck.length === 0) {
    const newGameState = performSettlement({
      ...gameState,
      players: updatedPlayers,
      market: [...updatedMarket, newMarketCard]
    });
    return { gameState: newGameState, success: true, message: `将${card.company}卡牌打到市场，支付了${coinsNeeded}个硬币`, roundEnded: true };
  }
  
  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      market: [...updatedMarket, newMarketCard],
      currentPlayerIndex: nextPlayerIndex
    },
    success: true,
    message: `将${card.company}卡牌打到市场，支付了${coinsNeeded}个硬币`,
    roundEnded: false
  };
}

export function playCardToInvestment(gameState: GameState, playerId: string, cardIndex: number): { gameState: GameState; success: boolean; message: string; roundEnded: boolean } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { gameState, success: false, message: '玩家未找到', roundEnded: false };
  }
  
  if (cardIndex < 0 || cardIndex >= player.handCards.length) {
    return { gameState, success: false, message: '无效的卡牌索引', roundEnded: false };
  }
  
  const card = player.handCards[cardIndex];
  
  const updatedInvestments = {
    ...player.investments,
    [card.company]: [...player.investments[card.company], card]
  };
  
  const updatedAntiMonopolyTokens = player.antiMonopolyTokens.includes(card.company) 
    ? player.antiMonopolyTokens 
    : [...player.antiMonopolyTokens, card.company];
  
  const updatedPlayer = {
    ...player,
    handCards: player.handCards.filter((_, i) => i !== cardIndex),
    investments: updatedInvestments,
    antiMonopolyTokens: updatedAntiMonopolyTokens,
    lastDrawnCompany: null,
    hasDrawnThisTurn: false
  };
  
  const updatedPlayers = gameState.players.map(p => p.id === playerId ? updatedPlayer : p);
  
  const updatedMajorityHolders = calculateMajorityHolders(updatedPlayers);
  
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  
  if (nextPlayerIndex === gameState.startingPlayerIndex && gameState.deck.length === 0) {
    const newGameState = performSettlement({
      ...gameState,
      players: updatedPlayers,
      majorityHolders: updatedMajorityHolders
    });
    return { gameState: newGameState, success: true, message: `投资了${card.company}公司`, roundEnded: true };
  }
  
  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      majorityHolders: updatedMajorityHolders,
      currentPlayerIndex: nextPlayerIndex
    },
    success: true,
    message: `投资了${card.company}公司`,
    roundEnded: false
  };
}

export function performSettlement(gameState: GameState): GameState {
  const { players } = gameState;
  
  const tempInvestments = players.map(player => ({
    playerId: player.id,
    investments: { ...player.investments } as Record<CompanyType, Card[]>,
    handCards: [...player.handCards]
  }));
  
  tempInvestments.forEach(temp => {
    temp.handCards.forEach(card => {
      temp.investments[card.company].push(card);
    });
  });
  
  const finalMajorityHolders = calculateMajorityHoldersFromTemp(tempInvestments);
  
  const coinTransfers: Record<string, Coin[]> = {};
  const negativeAssetsUpdates: Record<string, number> = {};
  
  const playerCoins = players.map(player => ({
    playerId: player.id,
    coins: [...player.coins]
  }));
  
  COMPANIES.forEach(company => {
    const holder = finalMajorityHolders.find(h => h.company === company);
    if (!holder) return;
    
    tempInvestments.forEach(temp => {
      if (temp.playerId === holder.playerId) return;
      
      const investmentCount = temp.investments[company].length;
      if (investmentCount === 0) return;
      
      const coinsToTransfer: Coin[] = [];
      const playerCoinData = playerCoins.find(pc => pc.playerId === temp.playerId);
      
      for (let i = 0; i < investmentCount; i++) {
        if (playerCoinData && playerCoinData.coins.length > 0) {
          const coin = playerCoinData.coins.shift()!;
          coin.value = 3;
          coinsToTransfer.push(coin);
        } else {
          negativeAssetsUpdates[temp.playerId] = (negativeAssetsUpdates[temp.playerId] || 0) + 3;
        }
      }
      
      if (coinsToTransfer.length > 0) {
        coinTransfers[holder.playerId] = [...(coinTransfers[holder.playerId] || []), ...coinsToTransfer];
      }
    });
  });
  
  const updatedPlayers = players.map(player => {
    const playerCoinData = playerCoins.find(pc => pc.playerId === player.id);
    const updatedCoins = playerCoinData ? [...playerCoinData.coins] : [...player.coins];
    if (coinTransfers[player.id]) {
      updatedCoins.push(...coinTransfers[player.id]);
    }
    
    return {
      ...player,
      coins: updatedCoins,
      negativeAssets: player.negativeAssets + (negativeAssetsUpdates[player.id] || 0)
    };
  });
  
  const playerWealths = updatedPlayers.map(player => {
    const coinValue = player.coins.reduce((sum, coin) => sum + coin.value, 0);
    const threeValueCoins = player.coins.filter(coin => coin.value === 3).length;
    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    return {
      playerId: player.id,
      wealth: coinValue - player.negativeAssets,
      threeValueCoins,
      playerIndex
    };
  });
  
  playerWealths.sort((a, b) => {
    if (b.wealth !== a.wealth) {
      return b.wealth - a.wealth;
    }
    if (b.threeValueCoins !== a.threeValueCoins) {
      return b.threeValueCoins - a.threeValueCoins;
    }
    return b.playerIndex - a.playerIndex;
  });
  
  const numPlayers = playerWealths.length;
  const finalPlayers = updatedPlayers.map(player => {
    const rank = playerWealths.findIndex(p => p.playerId === player.id);
    const roundScore = numPlayers - 1 - rank;
    
    return {
      ...player,
      roundScore,
      score: player.score + roundScore
    };
  });
  
  return {
    ...gameState,
    phase: 'SETTLEMENT',
    players: finalPlayers,
    majorityHolders: finalMajorityHolders
  };
}

function calculateMajorityHoldersFromTemp(tempInvestments: Array<{ playerId: string; investments: Record<CompanyType, Card[]> }>): MajorityHolder[] {
  const majorityHolders: MajorityHolder[] = [];
  
  COMPANIES.forEach(company => {
    let maxCount = 0;
    let majorityPlayerId: string | null = null;
    
    tempInvestments.forEach(temp => {
      const count = temp.investments[company].length;
      if (count > maxCount) {
        maxCount = count;
        majorityPlayerId = temp.playerId;
      } else if (count === maxCount && count > 0) {
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

export function shouldEndGame(gameState: GameState): boolean {
  return gameState.roundsCompleted >= gameState.players.length;
}

export function startNewRound(gameState: GameState): GameState {
  const { players } = gameState;
  
  let deck = shuffleArray(createDeck());
  const removedCards = deck.splice(0, REMOVED_CARDS_COUNT);
  
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
    player.roundScore = 0;
    player.negativeAssets = 0;
    player.antiMonopolyTokens = [];
    player.lastDrawnCompany = null;
  });
  
  const market: MarketCard[] = [];
  
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

export function endTurn(gameState: GameState, playerId: string): { gameState: GameState; success: boolean; message: string; roundEnded: boolean } {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    return { gameState, success: false, message: '玩家未找到', roundEnded: false };
  }
  
  if (gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
    return { gameState, success: false, message: '不是你的回合', roundEnded: false };
  }
  
  if (!player.hasDrawnThisTurn) {
    return { gameState, success: false, message: '必须先摸牌才能结束回合', roundEnded: false };
  }
  
  if (player.handCards.length > 0) {
    return { gameState, success: false, message: '必须先打出所有手牌才能结束回合', roundEnded: false };
  }
  
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  
  const updatedPlayers = gameState.players.map((p, index) => {
    if (index === gameState.currentPlayerIndex) {
      return {
        ...p,
        hasDrawnThisTurn: false
      };
    }
    return p;
  });
  
  if (nextPlayerIndex === gameState.startingPlayerIndex && gameState.deck.length === 0) {
    const newGameState = performSettlement({
      ...gameState,
      players: updatedPlayers
    });
    return { gameState: newGameState, success: true, message: '回合结束', roundEnded: true };
  }
  
  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex
    },
    success: true,
    message: '回合结束',
    roundEnded: false
  };
}