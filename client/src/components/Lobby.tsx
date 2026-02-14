import React, { useState } from 'react';

interface LobbyProps {
  onCreateRoom: (playerName: string, maxPlayers: number) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  loading: boolean;
}

const Lobby: React.FC<LobbyProps> = ({ onCreateRoom, onJoinRoom, loading }) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [roomCode, setRoomCode] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim(), maxPlayers);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (showRules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">游戏规则 / Game Rules</h2>
          
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="text-xl font-semibold mb-2">游戏概述 Overview</h3>
              <p>一款支持3-7人的投资经营类桌游。玩家通过投资不同公司、争夺大股东地位来获取收益。</p>
              <p className="text-gray-600">An investment board game for 3-7 players. Compete to become majority shareholders and earn profits.</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">游戏组成 Components</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>6家公司的卡牌 (Cards from 6 companies)</li>
                <li>硬币系统：每枚硬币有"1"面和"3"面 (Coins with value 1 and 3)</li>
                <li>大股东标记 (Majority shareholder markers)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">准备阶段 Setup</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>每位玩家分发3张手牌 (Each player gets 3 cards)</li>
                <li>5张牌移除不参与游戏 (5 cards removed from game)</li>
                <li>每位玩家10枚硬币，"1"面朝上 (Each player starts with 10 coins showing value 1)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">行动阶段 Actions</h3>
              <p>玩家轮流行动，每回合选择以下之一：</p>
              <p className="text-gray-600">Players take turns choosing one action:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>从抽牌堆抽一张牌 (Draw from deck)</li>
                <li>从市场区抽一张牌 (Draw from market)</li>
                <li>打出一张手牌进行投资 (Play a card to invest)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">反垄断规则 Anti-Monopoly Rule</h3>
              <p className="text-red-600 font-semibold">持有某公司最多投资牌的玩家（大股东）不能从市场抽取该公司的新牌！</p>
              <p className="text-gray-600">Majority shareholders cannot draw cards of their company from the market!</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">收益结算 Settlement</h3>
              <p>当抽牌堆耗尽时：</p>
              <p className="text-gray-600">When the deck is empty:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>每家公司的大股东获利 (Majority shareholders earn profits)</li>
                <li>其他玩家每持有一张该公司牌，支付1枚硬币给大股东 (Others pay 1 coin per card to the majority shareholder)</li>
                <li>支付的硬币翻面为"3"，价值提升 (Paid coins flip to value 3)</li>
                <li>计算每位玩家硬币总价值得分 (Calculate scores based on total coin value)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">游戏结束 Game End</h3>
              <p>当所有玩家都作为起始玩家完成一局后，得分最高者获胜。</p>
              <p className="text-gray-600">After each player has been the starting player once, highest score wins.</p>
            </section>
          </div>

          <button
            onClick={() => setShowRules(false)}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            返回 / Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          初创公司
        </h1>
        <p className="text-center text-gray-600 mb-8">Startup Investment Game</p>

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              创建房间 / Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              加入房间 / Join Room
            </button>
            <button
              onClick={() => setShowRules(true)}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
            >
              游戏规则 / Rules
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                玩家名称 / Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大玩家数 / Max Players
              </label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num} Players</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                返回 / Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '创建中...' : '创建 / Create'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                玩家名称 / Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房间码 / Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="Enter room code"
                maxLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                返回 / Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? '加入中...' : '加入 / Join'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Lobby;
