import { Server, Socket } from 'socket.io';
import { Player, GameState, Card, CompanyType, GameAction, MarketCard, Room } from '../types/game';
import * as roomManager from '../rooms/roomManager';
import * as gameLogic from '../game/gameLogic';

function broadcastGameState(io: Server, room: Room) {
  room.players.forEach((player: Player) => {
    io.to(player.id).emit('gameUpdate', sanitizeGameState(room.gameState!, player.id));
  });
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`玩家连接: ${socket.id}`);
    
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
          negativeAssets: 0,
          antiMonopolyTokens: [],
          lastDrawnCompany: null,
          isReady: false,
          hasDrawnThisTurn: false
        };
        
        roomManager.addPlayerToRoom(room.id, player);
        socket.join(room.id);
        
        callback({ success: true, roomId: room.id });
        io.to(room.id).emit('roomUpdate', room);
      } catch (error) {
        callback({ success: false, error: '创建房间失败' });
      }
    });
    
    socket.on('joinRoom', (data: { roomId: string; playerName: string }, callback) => {
      try {
        const room = roomManager.getRoom(data.roomId);
        if (!room) {
          callback({ success: false, error: '房间未找到' });
          return;
        }
        
        if (room.gameState?.phase === 'PLAYING') {
          callback({ success: false, error: '游戏已开始' });
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
          negativeAssets: 0,
          antiMonopolyTokens: [],
          lastDrawnCompany: null,
          isReady: false,
          hasDrawnThisTurn: false
        };
        
        const updatedRoom = roomManager.addPlayerToRoom(data.roomId, player);
        if (!updatedRoom) {
          callback({ success: false, error: '房间已满' });
          return;
        }
        
        socket.join(data.roomId);
        callback({ success: true, roomId: data.roomId });
        io.to(data.roomId).emit('roomUpdate', updatedRoom);
      } catch (error) {
        callback({ success: false, error: '加入房间失败' });
      }
    });
    
    socket.on('setReady', (data: { roomId: string; isReady: boolean }) => {
      const room = roomManager.setPlayerReady(data.roomId, socket.id, data.isReady);
      if (room) {
        io.to(data.roomId).emit('roomUpdate', room);
        
        if (roomManager.allPlayersReady(room)) {
          startGame(io, room.id);
        }
      }
    });
    
    socket.on('drawFromDeck', (data: { roomId: string }) => {
      console.log(`[drawFromDeck socket] 收到摸牌请求, socket.id: ${socket.id}, roomId: ${data.roomId}, 当前玩家: ${socket.id}`);
      
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        console.log(`[drawFromDeck socket] 拒绝摸牌: 不是你的回合, socket.id: ${socket.id}, currentPlayerIndex: ${gameState.currentPlayerIndex}`);
        socket.emit('error', { message: '不是你的回合' });
        return;
      }
      
      const result = gameLogic.drawFromDeck(gameState, socket.id);
      
      if (!result.success) {
        console.log(`[drawFromDeck socket] 拒绝摸牌: ${result.message}`);
        socket.emit('error', { message: result.message });
        return;
      }
      
      room.gameState = result.gameState;
      
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'DRAW_DECK',
        timestamp: Date.now()
      };
      room.gameState.actionHistory.push(action);
      
      broadcastGameState(io, room);
    });
    
    socket.on('drawFromMarket', (data: { roomId: string; marketIndex: number }) => {
      console.log(`[drawFromMarket socket] 收到从市场摸牌请求, socket.id: ${socket.id}, roomId: ${data.roomId}, marketIndex: ${data.marketIndex}`);
      
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        console.log(`[drawFromMarket socket] 拒绝摸牌: 不是你的回合, socket.id: ${socket.id}, currentPlayerIndex: ${gameState.currentPlayerIndex}`);
        socket.emit('error', { message: '不是你的回合' });
        return;
      }
      
      const result = gameLogic.drawFromMarket(gameState, socket.id, data.marketIndex);
      
      if (!result.success) {
        console.log(`[drawFromMarket socket] 拒绝摸牌: ${result.message}`);
        socket.emit('error', { message: result.message });
        return;
      }
      
      room.gameState = result.gameState;
      
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'DRAW_MARKET',
        timestamp: Date.now()
      };
      room.gameState.actionHistory.push(action);
      
      broadcastGameState(io, room);
    });
    
    socket.on('playCardToMarket', (data: { roomId: string; cardIndex: number }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: '不是你的回合' });
        return;
      }
      
      const result = gameLogic.playCardToMarket(gameState, socket.id, data.cardIndex);
      
      if (!result.success) {
        socket.emit('error', { message: result.message });
        return;
      }
      
      room.gameState = result.gameState;
      
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'PLAY_CARD',
        timestamp: Date.now()
      };
      room.gameState.actionHistory.push(action);
      
      if (result.roundEnded) {
        broadcastGameState(io, room);
        
        if (gameLogic.shouldEndGame(room.gameState)) {
          room.gameState.phase = 'FINISHED';
          room.players.forEach(player => {
            io.to(player.id).emit('gameFinished', sanitizeGameState(room.gameState!, player.id));
          });
        } else {
          room.players.forEach(player => {
            io.to(player.id).emit('roundEnded', sanitizeGameState(room.gameState!, player.id));
          });
        }
      } else {
        broadcastGameState(io, room);
      }
    });
    
    socket.on('playCardToInvestment', (data: { roomId: string; cardIndex: number }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === socket.id);
      
      if (!player || gameState.currentPlayerIndex !== gameState.players.indexOf(player)) {
        socket.emit('error', { message: '不是你的回合' });
        return;
      }
      
      const result = gameLogic.playCardToInvestment(gameState, socket.id, data.cardIndex);
      
      if (!result.success) {
        socket.emit('error', { message: result.message });
        return;
      }
      
      room.gameState = result.gameState;
      
      const action: GameAction = {
        playerId: socket.id,
        playerName: player.name,
        type: 'PLAY_CARD',
        timestamp: Date.now()
      };
      room.gameState.actionHistory.push(action);
      
      if (result.roundEnded) {
        broadcastGameState(io, room);
        
        if (gameLogic.shouldEndGame(room.gameState)) {
          room.gameState.phase = 'FINISHED';
          room.players.forEach(player => {
            io.to(player.id).emit('gameFinished', sanitizeGameState(room.gameState!, player.id));
          });
        } else {
          room.players.forEach(player => {
            io.to(player.id).emit('roundEnded', sanitizeGameState(room.gameState!, player.id));
          });
        }
      } else {
        broadcastGameState(io, room);
      }
    });
    
    socket.on('startNextRound', (data: { roomId: string }) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room || !room.gameState) return;
      
      if (room.gameState.phase !== 'SETTLEMENT') return;
      
      room.gameState = gameLogic.startNewRound(room.gameState);
      broadcastGameState(io, room);
    });
    
    socket.on('disconnect', () => {
      console.log(`玩家断开连接: ${socket.id}`);
      
      roomManager.getAllRooms().forEach(room => {
        const updatedRoom = roomManager.removePlayerFromRoom(room.id, socket.id);
        if (updatedRoom) {
          io.to(room.id).emit('roomUpdate', updatedRoom);
        }
      });
    });
  });
  
  setInterval(() => {
    roomManager.cleanupOldRooms();
  }, 3600000);
}

function startGame(io: Server, roomId: string) {
  const room = roomManager.getRoom(roomId);
  if (!room || room.players.length < 3) return;
  
  room.gameState = gameLogic.initializeGame(roomId, room.players);
  
  room.players.forEach(player => {
    const socketId = player.id;
    io.to(socketId).emit('gameStart', sanitizeGameState(room.gameState!, socketId));
  });
}

function sanitizeGameState(gameState: GameState, playerId: string): any {
  return {
    ...gameState,
    players: gameState.players.map(player => ({
      ...player,
      handCards: player.id === playerId ? player.handCards : []
    })),
    deck: gameState.deck.map(() => ({ id: 'hidden', company: 'A' as CompanyType })),
    removedCards: gameState.removedCards.map(() => ({ id: 'hidden', company: 'A' as CompanyType }))
  };
}
