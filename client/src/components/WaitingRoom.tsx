import React from 'react';
import { Room } from '../types/game';

interface WaitingRoomProps {
  room: Room;
  currentPlayerId: string;
  onSetReady: (isReady: boolean) => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ room, currentPlayerId, onSetReady }) => {
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const isReady = currentPlayer?.isReady || false;
  const allReady = room.players.length >= 3 && room.players.every(p => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-center mb-6">等待大厅 / Waiting Room</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">房间码 / Room Code</p>
              <p className="text-2xl font-bold text-blue-600">{room.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">玩家人数 / Players</p>
              <p className="text-2xl font-bold">{room.players.length} / {room.maxPlayers}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">玩家列表 / Player List</h3>
          <div className="space-y-2">
            {room.players.map((player, index) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg flex justify-between items-center ${
                  player.id === currentPlayerId ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][index % 7]
                  }`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{player.name}</span>
                  {player.id === currentPlayerId && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">You</span>
                  )}
                </div>
                <div>
                  {player.isReady ? (
                    <span className="text-green-600 font-semibold">✓ 准备就绪 / Ready</span>
                  ) : (
                    <span className="text-gray-400">等待中 / Waiting</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {room.players.length < 3 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-700">需要至少3名玩家才能开始游戏</p>
              <p className="text-sm text-yellow-600">Need at least 3 players to start</p>
            </div>
          )}

          <button
            onClick={() => onSetReady(!isReady)}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isReady
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isReady ? '取消准备 / Not Ready' : '准备 / Ready'}
          </button>

          {allReady && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-semibold">所有玩家已准备，游戏即将开始！</p>
              <p className="text-sm text-green-600">All players ready! Game starting...</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>分享房间码给朋友加入游戏</p>
          <p>Share the room code with friends to join</p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
