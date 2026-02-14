import React from 'react';
import { GameState, CompanyType, COMPANY_NAMES, COMPANY_COLORS } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onDrawFromDeck: () => void;
  onDrawFromMarket: (marketIndex: number) => void;
  onPlayCardToMarket: (cardIndex: number) => void;
  onPlayCardToInvestment: (cardIndex: number) => void;
  onStartNextRound: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onDrawFromDeck,
  onDrawFromMarket,
  onPlayCardToMarket,
  onPlayCardToInvestment,
  onStartNextRound
}) => {
  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId;
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!currentPlayer) return null;

  const getCompanyInvestments = (company: CompanyType) => {
    return gameState.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      count: player.investments[company].length
    })).filter(p => p.count > 0);
  };

  const hasAntiMonopolyToken = (company: CompanyType) => {
    return currentPlayer.antiMonopolyTokens.includes(company);
  };

  const canPlayCardToMarket = (cardIndex: number) => {
    const card = currentPlayer.handCards[cardIndex];
    if (!card) return false;
    if (hasAntiMonopolyToken(card.company)) return false;
    return true;
  };

  const handlePlayCardToMarket = (cardIndex: number) => {
    onPlayCardToMarket(cardIndex);
  };

  const handlePlayCardToInvestment = (cardIndex: number) => {
    onPlayCardToInvestment(cardIndex);
  };

  const handleDrawDeck = () => {
    onDrawFromDeck();
  };

  if (gameState.phase === 'FINISHED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center mb-6">游戏结束</h2>
          
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
            返回大厅
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'SETTLEMENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-center mb-6">结算</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">大股东</h3>
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
                      {holderPlayer ? holderPlayer.name : '无'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">玩家财富</h3>
            <div className="space-y-2">
              {gameState.players.map(player => {
                const coinValue = player.coins.reduce((sum, coin) => sum + coin.value, 0);
                const totalWealth = coinValue - player.negativeAssets;
                const totalInvestments = Object.values(player.investments).reduce((sum, cards) => sum + cards.length, 0);
                const totalCards = totalInvestments + player.handCards.length;
                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg ${
                      player.id === currentPlayerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium">{player.name}</span>
                        {player.negativeAssets > 0 && (
                          <span className="ml-2 text-red-600 text-sm">(负资产: -{player.negativeAssets})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {player.coins.length} 硬币
                        </span>
                        <span className="text-xl font-bold">{totalWealth}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      投资区: {totalInvestments} 张 | 手牌: {player.handCards.length} 张 | 总计: {totalCards} 张
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">
                        本回合: {player.roundScore > 0 ? '+' : ''}{player.roundScore}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        总分: {player.score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">详细股份</h3>
            <div className="space-y-4">
              {gameState.players.map(player => {
                const totalInvestments = Object.values(player.investments).reduce((sum, cards) => sum + cards.length, 0);
                const totalCards = totalInvestments + player.handCards.length;
                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg ${
                      player.id === currentPlayerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold mb-2">{player.name} (总计: {totalCards} 张)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['A', 'B', 'C', 'D', 'E', 'F'] as CompanyType[]).map(company => {
                        const investmentCount = player.investments[company].length;
                        const handCardCount = player.handCards.filter(c => c.company === company).length;
                        const totalCount = investmentCount + handCardCount;
                        if (totalCount === 0) return null;
                        return (
                          <div
                            key={company}
                            className="p-2 rounded text-sm"
                            style={{ backgroundColor: COMPANY_COLORS[company] + '30' }}
                          >
                            <div className="font-medium" style={{ color: COMPANY_COLORS[company] }}>
                              {COMPANY_NAMES[company]}
                            </div>
                            <div className="text-gray-600">
                              投资区: {investmentCount} | 手牌: {handCardCount} | 总计: {totalCount}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onStartNextRound}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            {gameState.roundsCompleted >= gameState.players.length 
              ? '查看最终结果'
              : '开始下一轮'
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">第 {gameState.round} 轮</h2>
            <p className="text-sm text-gray-600">
              当前玩家: <span className="font-semibold">{currentTurnPlayer?.name}</span>
              {isCurrentTurn && <span className="ml-2 text-green-600">（你的回合）</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">牌堆</p>
            <p className="text-2xl font-bold">{gameState.deck.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">你的状态</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>硬币:</span>
                <span className="font-bold">
                  {currentPlayer.coins.length} (值: {currentPlayer.coins.reduce((sum, c) => sum + c.value, 0)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>得分:</span>
                <span className="font-bold">{currentPlayer.score}</span>
              </div>
              {isCurrentTurn && (
                <div className="flex justify-between">
                  <span>本回合状态:</span>
                  <span className={`font-bold ${currentPlayer.hasDrawnThisTurn ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentPlayer.hasDrawnThisTurn ? '已摸牌' : '未摸牌'}
                  </span>
                </div>
              )}
              {currentPlayer.negativeAssets > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>负资产:</span>
                  <span className="font-bold">-{currentPlayer.negativeAssets}</span>
                </div>
              )}
            </div>

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

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">其他玩家</h3>
            <div className="space-y-2">
              {gameState.players.filter(p => p.id !== currentPlayerId).map(player => (
                <div key={player.id} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{player.name}</span>
                    <span className="text-lg font-bold text-gray-700">{player.coins.length} 💰</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    手牌: {player.handCards.length} 张
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg">公司投资情况</h3>
            <div className="space-y-4">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as CompanyType[]).map(company => {
                const holder = gameState.majorityHolders.find(h => h.company === company);
                const holderPlayer = holder ? gameState.players.find(p => p.id === holder.playerId) : null;
                const isYou = holder?.playerId === currentPlayerId;
                const investments = gameState.players.map(player => ({
                  playerId: player.id,
                  playerName: player.id === currentPlayerId ? '你' : player.name,
                  count: player.investments[company].length,
                  isYou: player.id === currentPlayerId
                })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);
                return (
                  <div
                    key={company}
                    className="p-4 rounded-lg shadow-sm"
                    style={{ 
                      backgroundColor: COMPANY_COLORS[company] + '15',
                      borderLeft: `4px solid ${COMPANY_COLORS[company]}`
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: COMPANY_COLORS[company] }}
                        >
                          {company}
                        </div>
                        <span className="font-semibold" style={{ color: COMPANY_COLORS[company] }}>
                          {COMPANY_NAMES[company]}
                        </span>
                      </div>
                      {holderPlayer ? (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isYou ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'}`}>
                          {isYou ? '你是大股东' : `${holderPlayer.name}是大股东`}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          暂无大股东
                        </div>
                      )}
                    </div>
                    {investments.length > 0 ? (
                      <div className="space-y-2">
                        {investments.map((inv, index) => (
                          <div key={inv.playerId} className="flex justify-between items-center p-2 rounded" style={{ 
                            backgroundColor: inv.isYou ? (COMPANY_COLORS[company] + '20') : 'transparent'
                          }}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-brown-400'}`}></div>
                              <span className={`${inv.isYou ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                                {inv.playerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="text-sm font-medium">{inv.count} 张</div>
                              {inv.isYou && (
                                <div className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                                  你
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        暂无投资
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">市场区域 ({gameState.market.length})</h3>
            <div className="flex flex-wrap gap-2">
              {gameState.market.map((marketCard, index) => {
                const isMajorityHolder = gameState.majorityHolders.some(
                  h => h.company === marketCard.card.company && h.playerId === currentPlayerId
                );
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => isCurrentTurn && !currentPlayer.hasDrawnThisTurn && onDrawFromMarket(index)}
                      disabled={!isCurrentTurn || currentPlayer.hasDrawnThisTurn}
                      className="w-20 h-28 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ backgroundColor: COMPANY_COLORS[marketCard.card.company] }}
                    >
                      <div className="text-white font-bold text-center p-2">
                        <div className="text-2xl">{marketCard.card.company}</div>
                        <div className="text-xs mt-1">{COMPANY_NAMES[marketCard.card.company]}</div>
                      </div>
                      {marketCard.coins > 0 && (
                        <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {marketCard.coins}
                        </div>
                      )}
                      {isMajorityHolder && (
                        <div className="absolute bottom-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                          大股东
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
              {gameState.market.length === 0 && (
                <div className="text-gray-500 text-sm">市场为空</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">抽牌堆 ({gameState.deck.length})</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => isCurrentTurn && handleDrawDeck()}
                disabled={!isCurrentTurn || gameState.deck.length === 0 || currentPlayer.hasDrawnThisTurn}
                className="w-20 h-28 rounded-lg shadow-md bg-gradient-to-br from-gray-600 to-gray-800 text-white font-bold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <div className="text-3xl">🎴</div>
                  <div className="text-xs mt-1">{gameState.deck.length}</div>
                </div>
              </button>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">抽牌说明:</p>
                <p className="text-sm">从牌堆抽取1张牌到手牌</p>
                {gameState.market.length > 0 && (
                  <p className="text-sm text-orange-600 mt-1">需要支付{gameState.market.length}个硬币（每张市场卡牌1个）</p>
                )}
                {currentPlayer.hasDrawnThisTurn && (
                  <p className="text-sm text-red-600 mt-1">本回合已摸牌</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">你的手牌 ({currentPlayer.handCards.length})</h3>
            <div className="flex flex-wrap gap-2">
              {currentPlayer.handCards.map((card, index) => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-20 h-28 rounded-lg shadow-md"
                    style={{ backgroundColor: COMPANY_COLORS[card.company] }}
                  >
                    <div className="text-white font-bold text-center p-2">
                      <div className="text-2xl">{card.company}</div>
                      <div className="text-xs mt-1">{COMPANY_NAMES[card.company]}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => isCurrentTurn && canPlayCardToMarket(index) && handlePlayCardToMarket(index)}
                      disabled={!isCurrentTurn || !canPlayCardToMarket(index)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="打到市场"
                    >
                      市场
                    </button>
                    <button
                      onClick={() => isCurrentTurn && handlePlayCardToInvestment(index)}
                      disabled={!isCurrentTurn}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="投资"
                    >
                      投资
                    </button>
                  </div>
                  {!canPlayCardToMarket(index) && (
                    <span className="text-xs text-red-500">不能打到市场,打了得输</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">投资情况</h3>
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

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">行动历史</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {gameState.actionHistory.slice(-10).reverse().map((action, i) => (
                <div key={i} className="text-sm text-gray-600">
                  <span className="font-medium">{action.playerName}</span>
                  {action.type === 'DRAW_DECK' && ' 从牌堆抽牌'}
                  {action.type === 'PLAY_CARD' && ' 打出卡牌'}
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