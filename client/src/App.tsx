import React, { useEffect } from 'react';
import { SocketProvider } from './contexts/SocketContext';
import { useGame } from './hooks/useGame';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameBoard from './components/GameBoard';
import './index.css';

const GameContainer: React.FC = () => {
  const {
    socket,
    connected,
    room,
    gameState,
    error,
    loading,
    createRoom,
    joinRoom,
    setReady,
    drawFromDeck,
    drawFromMarket,
    playCard,
    startNextRound
  } = useGame();

  // Show error toast
  useEffect(() => {
    if (error) {
      // Error is displayed in a toast-like manner
      console.error(error);
    }
  }, [error]);

  // Connection status
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">连接服务器中...</p>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Game is in progress
  if (gameState) {
    return (
      <GameBoard
        gameState={gameState}
        currentPlayerId={socket?.id || ''}
        onDrawFromDeck={() => room && drawFromDeck(room.id)}
        onDrawFromMarket={(cardId) => room && drawFromMarket(room.id, cardId)}
        onPlayCard={(cardId) => room && playCard(room.id, cardId)}
        onStartNextRound={() => room && startNextRound(room.id)}
      />
    );
  }

  // Waiting room
  if (room && !gameState) {
    return (
      <WaitingRoom
        room={room}
        currentPlayerId={socket?.id || ''}
        onSetReady={(isReady) => setReady(room.id, isReady)}
      />
    );
  }

  // Lobby
  return (
    <Lobby
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      loading={loading}
    />
  );
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <div className="relative">
        <GameContainer />
        {/* Error notification would go here */}
      </div>
    </SocketProvider>
  );
};

export default App;
