import { Room, Player } from '../types/game';

/**
 * Room management for multiplayer games
 * 房间管理系统
 */

const rooms = new Map<string, Room>();

/**
 * Generate a random room code
 * 生成随机房间码
 */
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a new room
 * 创建新房间
 */
export function createRoom(maxPlayers: number = 7): Room {
  const roomId = generateRoomCode();
  const room: Room = {
    id: roomId,
    players: [],
    maxPlayers: Math.min(Math.max(maxPlayers, 3), 7), // Between 3-7 players
    createdAt: Date.now()
  };
  
  rooms.set(roomId, room);
  return room;
}

/**
 * Get a room by ID
 * 获取房间
 */
export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

/**
 * Add player to room
 * 添加玩家到房间
 */
export function addPlayerToRoom(roomId: string, player: Player): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  // Check if room is full
  if (room.players.length >= room.maxPlayers) {
    return null;
  }
  
  // Check if player already in room
  if (room.players.find(p => p.id === player.id)) {
    return room;
  }
  
  room.players.push(player);
  return room;
}

/**
 * Remove player from room
 * 从房间移除玩家
 */
export function removePlayerFromRoom(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  room.players = room.players.filter(p => p.id !== playerId);
  
  // Delete room if empty
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }
  
  return room;
}

/**
 * Set player ready status
 * 设置玩家准备状态
 */
export function setPlayerReady(roomId: string, playerId: string, isReady: boolean): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.isReady = isReady;
  }
  
  return room;
}

/**
 * Check if all players are ready
 * 检查所有玩家是否准备就绪
 */
export function allPlayersReady(room: Room): boolean {
  return room.players.length >= 3 && room.players.every(p => p.isReady);
}

/**
 * Get all rooms (for debugging)
 * 获取所有房间
 */
export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

/**
 * Clean up old empty rooms
 * 清理旧的空房间
 */
export function cleanupOldRooms(maxAge: number = 3600000): void {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (room.players.length === 0 && now - room.createdAt > maxAge) {
      rooms.delete(roomId);
    }
  });
}
