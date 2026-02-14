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
          roundScore: 0,
          debt: 0,
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
          roundScore: 0,
          debt: 0,
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
    
    // Step 1: Take a card (from deck or market)
    socket.on('takeCard', (data: { roomId: string; fromDeck: boolean; cardId?: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      if (gameState.pendingAction !== 'NONE') {
        socket.emit('error', { message: 'Complete current action first' });
        return;
      }
      
      let card: Card;
      let fromMarket = false;
      
      if (data.fromDeck) {
        // Take from deck
        if (gameState.deck.length === 0) {
          socket.emit('error', { message: 'Deck is empty' });
          return;
        }
        
        // Check if player needs to pay coins
        const mustPay = gameLogic.shouldPayForDeckDraw(socket.id, gameState.market, gameState.majorityHolders);
        
        if (mustPay && gameState.market.length > 0) {
          // Pay 1 coin per market card
          const coinsNeeded = gameState.market.length;
          
          if (player.coins.length < coinsNeeded) {
            socket.emit('error', { message: `Need ${coinsNeeded} coins to draw from deck` });
            return;
          }
          
          // Place coins on market cards
          for (let i = 0; i < coinsNeeded; i++) {
            const marketCard = gameState.market[i];
            const coin = player.coins.shift();
            if (coin) {
              if (!marketCard.coinsOnCard) {
                marketCard.coinsOnCard = [];
              }
              marketCard.coinsOnCard.push(coin);
            }
          }
        }
        
        card = gameState.deck.shift()!;
        fromMarket = false;
      } else {
        // Take from market
        if (!data.cardId) {
          socket.emit('error', { message: 'Card ID required for market draw' });
          return;
        }
        
        const cardIndex = gameState.market.findIndex(c => c.id === data.cardId);
        if (cardIndex === -1) {
          socket.emit('error', { message: 'Card not found in market' });
          return;
        }
        
        card = gameState.market[cardIndex];
        
        // Check anti-monopoly rule
        if (!gameLogic.canDrawFromMarket(socket.id, card.company, gameState.majorityHolders)) {
          socket.emit('error', { message: 'Cannot draw - you are majority holder of this company' });
          return;
        }
        
        // Remove card from market
        gameState.market.splice(cardIndex, 1);
        
        // Collect coins on the card
        if (card.coinsOnCard && card.coinsOnCard.length > 0) {
          player.coins.push(...card.coinsOnCard);
          card.coinsOnCard = [];
        }
        
        // Refill market from deck
        room.gameState = gameLogic.refillMarket(gameState);
        
        fromMarket = true;
      }
      
      // Add card to player's hand
      player.handCards.push(card);
      
      // Add to action history
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'TAKE_CARD',
        cardId: card.id,
        company: card.company,
        fromMarket,
        timestamp: Date.now()
      };
      gameState.actionHistory.push(action);
      
      // Set pending action and track what was taken
      gameState.pendingAction = 'WAITING_FOR_PLAY';
      gameState.lastCardTaken = {
        company: card.company,
        fromMarket
      };
      
      io.to(data.roomId).emit('gameUpdate', sanitizeGameState(gameState, socket.id));
    });
    
    // Step 2: Play a card (to market or to investment)
    socket.on('playCard', (data: { roomId: string; cardId: string; toMarket: boolean }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      if (gameState.pendingAction !== 'WAITING_FOR_PLAY') {
        socket.emit('error', { message: 'Must take a card first' });
        return;
      }
      
      const cardIndex = player.handCards.findIndex(c => c.id === data.cardId);
      if (cardIndex === -1) {
        socket.emit('error', { message: 'Card not in hand' });
        return;
      }
      
      const card = player.handCards[cardIndex];
      
      if (data.toMarket) {
        // Playing to market
        
        // Check anti-monopoly rule: majority holder cannot play to market
        if (!gameLogic.canPlayToMarket(socket.id, card.company, gameState.majorityHolders)) {
          socket.emit('error', { message: 'Majority holder cannot play to market' });
          return;
        }
        
        // Check restriction: cannot play same company card to market if just taken from market
        if (gameState.lastCardTaken?.fromMarket && gameState.lastCardTaken.company === card.company) {
          socket.emit('error', { message: 'Cannot play same company card to market after taking from market' });
          return;
        }
        
        // Remove from hand and add to market
        player.handCards.splice(cardIndex, 1);
        gameState.market.push(card);
        
        // Add to action history
        const action: GameAction = {
          playerId: socket.id,
          playerName: player.name,
          type: 'PLAY_TO_MARKET',
          cardId: card.id,
          company: card.company,
          timestamp: Date.now()
        };
        gameState.actionHistory.push(action);
      } else {
        // Playing to investment
        player.handCards.splice(cardIndex, 1);
        player.investments[card.company].push(card);
        
        // Add to action history
        const action: GameAction = {
          playerId: socket.id,
          playerName: player.name,
          type: 'PLAY_TO_INVESTMENT',
          cardId: card.id,
          company: card.company,
          timestamp: Date.now()
        };
        gameState.actionHistory.push(action);
      }
      
      // Clear pending action
      gameState.pendingAction = 'NONE';
      gameState.lastCardTaken = undefined;
      
      // Move to next player
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Update majority holders
      gameState.majorityHolders = gameLogic.calculateMajorityHolders(gameState.players);
      
      // Check if deck is empty - trigger settlement
      if (gameState.deck.length === 0 && gameState.market.length === 0) {
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
