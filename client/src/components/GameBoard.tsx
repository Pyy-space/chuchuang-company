import React, { useState } from 'react';
import { GameState, CompanyType, COMPANY_NAMES, COMPANY_COLORS } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onDrawFromDeck: () => void;
  onDrawFromMarket: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
  onStartNextRound: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onDrawFromDeck,
  onDrawFromMarket,
  onPlayCard,
  onStartNextRound
}) => {
  const [selectedHandCard, setSelectedHandCard] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId;
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

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

  const handlePlayCard = (cardId: string) => {
    onPlayCard(cardId);
    setSelectedHandCard(null);
    setShowActions(false);
  };

  const handleDrawMarket = (cardId: string) => {
    onDrawFromMarket(cardId);
    setShowActions(false);
  };

  const handleDrawDeck = () => {
    onDrawFromDeck();
    setShowActions(false);
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
              {gameState.players.map(player => {
                const coinValue = player.coins.reduce((sum, coin) => sum + coin.value, 0);
                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg flex justify-between items-center ${
                      player.id === currentPlayerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {player.coins.length} coins × avg value
                      </span>
                      <span className="text-xl font-bold">+{coinValue}</span>
                      <span className="text-lg font-semibold">Total: {player.score}</span>
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
              {isCurrentTurn && <span className="ml-2 text-green-600">（你的回合 / Your Turn）</span>}
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
              {currentPlayer.coins.map((coin, i) => (
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
                return (
                  <button
                    key={card.id}
                    onClick={() => isCurrentTurn && canDraw && handleDrawMarket(card.id)}
                    disabled={!isCurrentTurn || !canDraw}
                    className="relative w-20 h-28 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: COMPANY_COLORS[card.company] }}
                  >
                    <div className="text-white font-bold text-center p-2">
                      <div className="text-2xl">{card.company}</div>
                      <div className="text-xs mt-1">{COMPANY_NAMES[card.company]}</div>
                    </div>
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
            <button
              onClick={() => isCurrentTurn && handleDrawDeck()}
              disabled={!isCurrentTurn || gameState.deck.length === 0}
              className="w-20 h-28 rounded-lg shadow-md bg-gradient-to-br from-gray-600 to-gray-800 text-white font-bold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-3xl">🎴</div>
                <div className="text-xs mt-1">{gameState.deck.length}</div>
              </div>
            </button>
          </div>

          {/* Hand Cards */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">你的手牌 / Your Hand ({currentPlayer.handCards.length})</h3>
            <div className="flex flex-wrap gap-2">
              {currentPlayer.handCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => isCurrentTurn && handlePlayCard(card.id)}
                  disabled={!isCurrentTurn}
                  className="w-20 h-28 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: COMPANY_COLORS[card.company] }}
                >
                  <div className="text-white font-bold text-center p-2">
                    <div className="text-2xl">{card.company}</div>
                    <div className="text-xs mt-1">{COMPANY_NAMES[card.company]}</div>
                  </div>
                </button>
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
                  {action.type === 'DRAW_DECK' && ' 从牌堆抽牌 / drew from deck'}
                  {action.type === 'DRAW_MARKET' && ` 从市场抽取${action.company} / drew ${action.company} from market`}
                  {action.type === 'PLAY_CARD' && ` 投资${action.company} / invested in ${action.company}`}
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
