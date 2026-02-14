import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Room, GameState } from '../types/game';

export const useGame = () => {
  const { socket, connected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomUpdate', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('gameStart', (state: GameState) => {
      setGameState(state);
    });

    socket.on('gameUpdate', (state: GameState) => {
      setGameState(state);
    });

    socket.on('settlement', (state: GameState) => {
      setGameState(state);
    });

    socket.on('gameFinished', (state: GameState) => {
      setGameState(state);
    });

    socket.on('error', (err: { message: string }) => {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('gameStart');
      socket.off('gameUpdate');
      socket.off('settlement');
      socket.off('gameFinished');
      socket.off('error');
    };
  }, [socket]);

  const createRoom = useCallback((playerName: string, maxPlayers: number) => {
    if (!socket) return;
    setLoading(true);
    socket.emit('createRoom', { playerName, maxPlayers }, (response: any) => {
      setLoading(false);
      if (!response.success) {
        setError(response.error);
      }
    });
  }, [socket]);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    if (!socket) return;
    setLoading(true);
    socket.emit('joinRoom', { roomId, playerName }, (response: any) => {
      setLoading(false);
      if (!response.success) {
        setError(response.error);
      }
    });
  }, [socket]);

  const setReady = useCallback((roomId: string, isReady: boolean) => {
    if (!socket) return;
    socket.emit('setReady', { roomId, isReady });
  }, [socket]);

  const drawFromDeck = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('drawFromDeck', { roomId });
  }, [socket]);

  const drawFromMarket = useCallback((roomId: string, cardId: string) => {
    if (!socket) return;
    socket.emit('drawFromMarket', { roomId, cardId });
  }, [socket]);

  const playCard = useCallback((roomId: string, cardId: string) => {
    if (!socket) return;
    socket.emit('playCard', { roomId, cardId });
  }, [socket]);

  const startNextRound = useCallback((roomId: string) => {
    if (!socket) return;
    socket.emit('startNextRound', { roomId });
  }, [socket]);

  return {
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
  };
};
