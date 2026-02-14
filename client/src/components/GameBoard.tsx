import React from 'react';
import { GameState, CompanyType, COMPANY_NAMES, COMPANY_COLORS } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onTakeCard: (fromDeck: boolean, cardId?: string) => void;
  onPlayCard: (cardId: string, toMarket: boolean) => void;
  onStartNextRound: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onTakeCard,
  onPlayCard,
  onStartNextRound
}) => {
  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId;
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPendingPlay = gameState.pendingAction === 'WAITING_FOR_PLAY';

  if (!currentPlayer) return null;

  // Get company investment counts for all players
  const getCompanyInvestments = (company: CompanyType) => {
    return gameState.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      count: player.investments[company].length
    })).filter(p => p.count > 0);
  };

  // Check if player is majority holder
  const isMajorityHolder = (company: CompanyType) => {
    return gameState.majorityHolders.some(
      h => h.company === company && h.playerId === currentPlayerId
    );
  };

  // Can draw from market check
  const canDrawMarketCard = (company: CompanyType) => {
    return !isMajorityHolder(company);
  };

  const handleTakeDeck = () => {
    onTakeCard(true);
  };

  const handleTakeMarket = (cardId: string) => {
    onTakeCard(false, cardId);
  };

  const handlePlayToInvestment = (cardId: string) => {
    onPlayCard(cardId, false);
  };

  const handlePlayToMarket = (cardId: string) => {
    onPlayCard(cardId, true);
  };

  if (gameState.phase === 'FINISHED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center mb-6">游戏结束 / Game Finished</h2>
          
          <div className="space-y-3 mb-6">
            {[...gameState.players]
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg flex justify-between items-center ${
                    index === 0 ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">#{index + 1}</span>
                    <span className="font-medium">{player.name}</span>
                    {index === 0 && <span className="text-2xl">🏆</span>}
                  </div>
                  <span className="text-2xl font-bold">{player.score}</span>
                </div>
              ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            返回大厅 / Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'SETTLEMENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-center mb-6">结算 / Settlement</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">大股东 / Majority Shareholders</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as CompanyType[]).map(company => {
                const holder = gameState.majorityHolders.find(h => h.company === company);
                const holderPlayer = holder ? gameState.players.find(p => p.id === holder.playerId) : null;
                return (
                  <div
                    key={company}
                    className="p-3 rounded-lg border-2"
                    style={{ borderColor: COMPANY_COLORS[company] }}
                  >
                    <div className="font-semibold" style={{ color: COMPANY_COLORS[company] }}>
                      {COMPANY_NAMES[company]}
                    </div>
                    <div className="text-sm">
                      {holderPlayer ? holderPlayer.name : '无 / None'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">玩家得分 / Player Scores</h3>
            <div className="space-y-2">
              {gameState.players
                .map((player, index) => {
                  const coinValue = player.coins.reduce((sum, coin) => sum + coin.value, 0);
                  const netValue = coinValue - player.debt;
                  return { player, coinValue, netValue, index };
                })
                .sort((a, b) => b.netValue - a.netValue)
                .map(({ player, coinValue, netValue }, rankIndex) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg flex justify-between items-center ${
                      player.id === currentPlayerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{player.name}</span>
                      {rankIndex === 0 && <span className="text-xl">🥇</span>}
                      {rankIndex === 1 && <span className="text-xl">🥈</span>}
                      {rankIndex === gameState.players.length - 1 && rankIndex > 1 && <span className="text-xl">😢</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">硬币 / Coins: </span>
                        <span className="font-semibold">{player.coins.length} (值 / value: {coinValue})</span>
                      </div>
                      {player.debt > 0 && (
                        <span className="text-sm text-red-600 font-semibold">
                          债务 / Debt: -{player.debt}
                        </span>
                      )}
                      <div className="text-sm">
                        <span className="text-gray-600">净值 / Net: </span>
                        <span className="font-semibold">{netValue}</span>
                      </div>
                      <div className={`text-lg font-bold ${
                        player.roundScore > 0 ? 'text-green-600' : 
                        player.roundScore < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {player.roundScore > 0 ? '+' : ''}{player.roundScore}分
                      </div>
                      <span className="text-lg font-semibold">总分 / Total: {player.score}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={onStartNextRound}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            {gameState.roundsCompleted >= gameState.players.length 
              ? '查看最终结果 / View Final Results'
              : '开始下一轮 / Start Next Round'
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">第 {gameState.round} 轮 / Round {gameState.round}</h2>
            <p className="text-sm text-gray-600">
              当前玩家 / Current: <span className="font-semibold">{currentTurnPlayer?.name}</span>
              {isCurrentTurn && (
                <span className="ml-2">
                  {isPendingPlay ? (
                    <span className="text-orange-600">（你的回合 - 打出一张牌 / Your Turn - Play a Card）</span>
                  ) : (
                    <span className="text-green-600">（你的回合 - 拿取一张牌 / Your Turn - Take a Card）</span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">牌堆 / Deck</p>
            <p className="text-2xl font-bold">{gameState.deck.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Player Info */}
        <div className="space-y-4">
          {/* Current Player */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">你的状态 / Your Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>硬币 / Coins:</span>
                <span className="font-bold">
                  {currentPlayer.coins.length} (值 / Value: {currentPlayer.coins.reduce((sum, c) => sum + c.value, 0)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>得分 / Score:</span>
                <span className="font-bold">{currentPlayer.score}</span>
              </div>
            </div>

            {/* Coins Display */}
            <div className="mt-3 flex flex-wrap gap-1">
              {currentPlayer.coins.map((coin) => (
                <div
                  key={coin.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    coin.value === 1 ? 'bg-gray-300 text-gray-700' : 'bg-yellow-400 text-yellow-900'
                  }`}
                >
                  {coin.value}
                </div>
              ))}
            </div>
          </div>

          {/* Other Players */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">其他玩家 / Other Players</h3>
            <div className="space-y-2">
              {gameState.players.filter(p => p.id !== currentPlayerId).map(player => (
                <div key={player.id} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{player.name}</span>
                    <span className="text-xs text-gray-600">{player.coins.length} 💰</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Hand: {player.handCards.filter(c => c.id !== 'hidden').length || '?'} cards
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">公司大股东 / Majority Holders</h3>
            <div className="space-y-2">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as CompanyType[]).map(company => {
                const holder = gameState.majorityHolders.find(h => h.company === company);
                const holderPlayer = holder ? gameState.players.find(p => p.id === holder.playerId) : null;
                const isYou = holder?.playerId === currentPlayerId;
                return (
                  <div
                    key={company}
                    className="p-2 rounded flex justify-between items-center"
                    style={{ backgroundColor: COMPANY_COLORS[company] + '20' }}
                  >
                    <span className="font-medium text-sm" style={{ color: COMPANY_COLORS[company] }}>
                      {COMPANY_NAMES[company]}
                    </span>
                    <span className="text-xs">
                      {holderPlayer ? (isYou ? '你 / You' : holderPlayer.name) : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Game Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Market Area */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">市场区域 / Market ({gameState.market.length})</h3>
            <div className="flex flex-wrap gap-2">
              {gameState.market.map(card => {
                const canDraw = canDrawMarketCard(card.company);
                const canTake = !isPendingPlay && isCurrentTurn && canDraw;
                const coinCount = card.coinsOnCard?.length || 0;
                return (
                  <button
                    key={card.id}
                    onClick={() => canTake && handleTakeMarket(card.id)}
                    disabled={!canTake}
                    className="relative w-20 h-28 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: COMPANY_COLORS[card.company] }}
                  >
                    <div className="text-white font-bold text-center p-2">
                      <div className="text-2xl">{card.company}</div>
                      <div className="text-xs mt-1">{COMPANY_NAMES[card.company]}</div>
                    </div>
                    {coinCount > 0 && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {coinCount}
                      </div>
                    )}
                    {!canDraw && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl">🚫</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deck */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">抽牌堆 / Deck ({gameState.deck.length})</h3>
            <div className="flex items-start gap-4">
              <button
                onClick={() => !isPendingPlay && isCurrentTurn && handleTakeDeck()}
                disabled={isPendingPlay || !isCurrentTurn || gameState.deck.length === 0}
                className="w-20 h-28 rounded-lg shadow-md bg-gradient-to-br from-gray-600 to-gray-800 text-white font-bold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="text-3xl">🎴</div>
                  <div className="text-xs mt-1">抽牌</div>
                  <div className="text-xs">Draw</div>
                </div>
              </button>
              {gameState.market.length > 0 && (
                <div className="flex-1 bg-yellow-50 border border-yellow-300 rounded p-2 text-sm">
                  <p className="font-semibold text-yellow-800">💰 抽牌成本 / Draw Cost</p>
                  <p className="text-xs text-yellow-700">
                    从牌堆抽牌需支付 {gameState.market.length} 枚硬币（每张市场牌1枚）
                  </p>
                  <p className="text-xs text-yellow-700">
                    Drawing from deck costs {gameState.market.length} coin(s) (1 per market card)
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    你的硬币 / Your coins: {currentPlayer.coins.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hand Cards */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">你的手牌 / Your Hand ({currentPlayer.handCards.length})</h3>
            {isPendingPlay && isCurrentTurn && (
              <div className="mb-3 bg-orange-50 border border-orange-300 rounded p-2 text-sm">
                <p className="font-semibold text-orange-800">
                  ⚠️ 选择一张牌打出 / Choose a card to play
                </p>
                <p className="text-xs text-orange-700">
                  点击卡牌下方按钮选择打到市场或投资 / Click buttons below cards to play to market or invest
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {currentPlayer.handCards.map(card => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-20 h-28 rounded-lg shadow-md flex items-center justify-center"
                    style={{ backgroundColor: COMPANY_COLORS[card.company] }}
                  >
                    <div className="text-white font-bold text-center p-2">
                      <div className="text-2xl">{card.company}</div>
                      <div className="text-xs mt-1">{COMPANY_NAMES[card.company]}</div>
                    </div>
                  </div>
                  {isPendingPlay && isCurrentTurn && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePlayToInvestment(card.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        投资
                      </button>
                      <button
                        onClick={() => handlePlayToMarket(card.id)}
                        disabled={
                          isMajorityHolder(card.company) || 
                          (gameState.lastCardTaken?.fromMarket && gameState.lastCardTaken.company === card.company)
                        }
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          isMajorityHolder(card.company)
                            ? "大股东不能打到市场"
                            : gameState.lastCardTaken?.fromMarket && gameState.lastCardTaken.company === card.company
                            ? "不能打出刚从市场拿的同公司牌"
                            : ""
                        }
                      >
                        市场
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Investments */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">投资情况 / Investments</h3>
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as CompanyType[]).map(company => {
                const investments = getCompanyInvestments(company);
                if (investments.length === 0) return null;
                
                return (
                  <div key={company} className="border rounded-lg p-3" style={{ borderColor: COMPANY_COLORS[company] }}>
                    <div className="font-semibold mb-2" style={{ color: COMPANY_COLORS[company] }}>
                      {COMPANY_NAMES[company]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {investments.map(inv => (
                        <div
                          key={inv.playerId}
                          className={`px-3 py-1 rounded text-sm ${
                            inv.playerId === currentPlayerId ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'
                          }`}
                        >
                          {inv.playerName}: {inv.count}张
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action History */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">行动历史 / Action History</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {gameState.actionHistory.slice(-10).reverse().map((action, i) => (
                <div key={i} className="text-sm text-gray-600">
                  <span className="font-medium">{action.playerName}</span>
                  {action.type === 'TAKE_CARD' && (action.fromMarket 
                    ? ` 从市场拿取${action.company} / took ${action.company} from market`
                    : ' 从牌堆抽牌 / drew from deck')}
                  {action.type === 'PLAY_TO_MARKET' && ` 打出${action.company}到市场 / played ${action.company} to market`}
                  {action.type === 'PLAY_TO_INVESTMENT' && ` 投资${action.company} / invested in ${action.company}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
