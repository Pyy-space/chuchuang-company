import { Server, Socket } from 'socket.io';
import { Player, GameState, Card, CompanyType, GameAction } from '../types/game';
import * as roomManager from '../rooms/roomManager';
import * as gameLogic from '../game/gameLogic';

/**
 * Socket.io event handlers for real-time game communication
 * Socket.io 事件处理器
 */

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Create room
    socket.on('createRoom', (data: { playerName: string; maxPlayers: number }, callback) => {
      try {
        const room = roomManager.createRoom(data.maxPlayers);
        const player: Player = {
          id: socket.id,
          name: data.playerName,
          handCards: [],
          investments: { A: [], B: [], C: [], D: [], E: [], F: [] },
          coins: [],
          score: 0,
          isReady: false
        };
        
        roomManager.addPlayerToRoom(room.id, player);
        socket.join(room.id);
        
        callback({ success: true, roomId: room.id });
        io.to(room.id).emit('roomUpdate', room);
      } catch (error) {
        callback({ success: false, error: 'Failed to create room' });
      }
    });
    
    // Join room
    socket.on('joinRoom', (data: { roomId: string; playerName: string }, callback) => {
      try {
        const room = roomManager.getRoom(data.roomId);
        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }
        
        if (room.gameState?.phase === 'PLAYING') {
          callback({ success: false, error: 'Game already in progress' });
          return;
        }
        
        const player: Player = {
          id: socket.id,
          name: data.playerName,
          handCards: [],
          investments: { A: [], B: [], C: [], D: [], E: [], F: [] },
          coins: [],
          score: 0,
          isReady: false
        };
        
        const updatedRoom = roomManager.addPlayerToRoom(data.roomId, player);
        if (!updatedRoom) {
          callback({ success: false, error: 'Room is full' });
          return;
        }
        
        socket.join(data.roomId);
        callback({ success: true, roomId: data.roomId });
        io.to(data.roomId).emit('roomUpdate', updatedRoom);
      } catch (error) {
        callback({ success: false, error: 'Failed to join room' });
      }
    });
    
    // Set ready status
    socket.on('setReady', (data: { roomId: string; isReady: boolean }) => {
      const room = roomManager.setPlayerReady(data.roomId, socket.id, data.isReady);
      if (room) {
        io.to(data.roomId).emit('roomUpdate', room);
        
        // Auto-start if all ready
        if (roomManager.allPlayersReady(room)) {
          startGame(io, room.id);
        }
      }
    });
    
    // Draw card from deck
    socket.on('drawFromDeck', (data: { roomId: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      if (gameState.deck.length === 0) {
        socket.emit('error', { message: 'Deck is empty' });
        return;
      }
      
      // Draw card
      const card = gameState.deck.shift()!;
      player.handCards.push(card);
      
      // Add to action history
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'DRAW_DECK',
        cardId: card.id,
        company: card.company,
        timestamp: Date.now()
      };
      gameState.actionHistory.push(action);
      
      // Move to next player
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Update majority holders
      gameState.majorityHolders = gameLogic.calculateMajorityHolders(gameState.players);
      
      // Check if deck is empty - trigger settlement
      if (gameState.deck.length === 0) {
        room.gameState = gameLogic.performSettlement(gameState);
        io.to(data.roomId).emit('gameUpdate', sanitizeGameState(room.gameState, socket.id));
        io.to(data.roomId).emit('settlement', room.gameState);
        
        // Check if game should end
        if (gameLogic.shouldEndGame(room.gameState)) {
          room.gameState.phase = 'FINISHED';
          io.to(data.roomId).emit('gameFinished', room.gameState);
        }
      } else {
        io.to(data.roomId).emit('gameUpdate', sanitizeGameState(gameState, socket.id));
      }
    });
    
    // Draw card from market
    socket.on('drawFromMarket', (data: { roomId: string; cardId: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      const cardIndex = gameState.market.findIndex(c => c.id === data.cardId);
      if (cardIndex === -1) {
        socket.emit('error', { message: 'Card not found in market' });
        return;
      }
      
      const card = gameState.market[cardIndex];
      
      // Check anti-monopoly rule
      if (!gameLogic.canDrawFromMarket(socket.id, card.company, gameState.majorityHolders)) {
        socket.emit('error', { message: 'Cannot draw - you are majority holder of this company' });
        return;
      }
      
      // Draw card
      gameState.market.splice(cardIndex, 1);
      player.handCards.push(card);
      
      // Refill market
      room.gameState = gameLogic.refillMarket(gameState);
      
      // Add to action history
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'DRAW_MARKET',
        cardId: card.id,
        company: card.company,
        timestamp: Date.now()
      };
      gameState.actionHistory.push(action);
      
      // Move to next player
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Update majority holders
      gameState.majorityHolders = gameLogic.calculateMajorityHolders(gameState.players);
      
      io.to(data.roomId).emit('gameUpdate', sanitizeGameState(gameState, socket.id));
    });
    
    // Play card
    socket.on('playCard', (data: { roomId: string; cardId: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      const cardIndex = player.handCards.findIndex(c => c.id === data.cardId);
      if (cardIndex === -1) {
        socket.emit('error', { message: 'Card not in hand' });
        return;
      }
      
      // Play card
      const card = player.handCards.splice(cardIndex, 1)[0];
      player.investments[card.company].push(card);
      
      // Add to action history
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'PLAY_CARD',
        cardId: card.id,
        company: card.company,
        timestamp: Date.now()
      };
      gameState.actionHistory.push(action);
      
      // Move to next player
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Update majority holders
      gameState.majorityHolders = gameLogic.calculateMajorityHolders(gameState.players);
      
      io.to(data.roomId).emit('gameUpdate', sanitizeGameState(gameState, socket.id));
    });
    
    // Start next round
    socket.on('startNextRound', (data: { roomId: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      if (room.gameState.phase !== 'SETTLEMENT') return;
      
      room.gameState = gameLogic.startNewRound(room.gameState);
      io.to(data.roomId).emit('gameUpdate', sanitizeGameState(room.gameState, socket.id));
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      // Find and remove player from all rooms
      roomManager.getAllRooms().forEach(room => {
        const updatedRoom = roomManager.removePlayerFromRoom(room.id, socket.id);
        if (updatedRoom) {
          io.to(room.id).emit('roomUpdate', updatedRoom);
        }
      });
    });
  });
  
  // Cleanup old rooms every hour
  setInterval(() => {
    roomManager.cleanupOldRooms();
  }, 3600000);
}

/**
 * Start the game
 * 开始游戏
 */
function startGame(io: Server, roomId: string) {
  const room = roomManager.getRoom(roomId);
  if (!room || room.players.length < 3) return;
  
  // Initialize game state
  room.gameState = gameLogic.initializeGame(roomId, room.players);
  
  // Notify all players
  room.players.forEach(player => {
    const socketId = player.id;
    io.to(socketId).emit('gameStart', sanitizeGameState(room.gameState!, socketId));
  });
  
  io.to(roomId).emit('gameUpdate', sanitizeGameState(room.gameState, ''));
}

/**
 * Sanitize game state for a specific player (hide other players' hands)
 * 为特定玩家清理游戏状态（隐藏其他玩家的手牌）
 */
function sanitizeGameState(gameState: GameState, playerId: string): any {
  return {
    ...gameState,
    players: gameState.players.map(player => ({
      ...player,
      handCards: player.id === playerId ? player.handCards : player.handCards.map(() => ({ id: 'hidden', company: 'A' as CompanyType }))
    })),
    deck: gameState.deck.map(() => ({ id: 'hidden', company: 'A' as CompanyType }))
  };
}
