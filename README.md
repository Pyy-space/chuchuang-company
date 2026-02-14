# 初创公司投资游戏 / Startup Investment Game

一个支持3-7人的多人在线桌游，模拟投资经营类卡牌游戏。

A multiplayer online board game for 3-7 players, simulating an investment-based card game.

## 🎮 游戏介绍 / Game Overview

玩家通过投资6家不同的公司、争夺大股东地位来获取收益。游戏时长约20分钟/局。

Players invest in 6 different companies and compete to become majority shareholders to earn profits. Each game lasts approximately 20 minutes.

## ✨ 主要特性 / Key Features

- 🎯 支持3-7人实时在线对战 / Real-time multiplayer for 3-7 players
- 🏢 6家公司的投资系统 / Investment system with 6 companies
- 💰 硬币双面增值机制 / Dual-sided coin appreciation system
- 🔒 反垄断规则 / Anti-monopoly rules
- 📊 实时结算系统 / Real-time settlement system
- 🎨 响应式设计 / Responsive design
- 🔄 多轮游戏支持 / Multi-round gameplay

## 🎲 游戏规则 / Game Rules

### 准备阶段 / Setup
- 每位玩家分发3张手牌 / Each player receives 3 cards
- 每位玩家10枚硬币（值为1） / Each player starts with 10 coins (value 1)
- 5张牌移除不参与游戏 / 5 cards removed from the game

### 行动阶段 / Actions
玩家轮流选择以下行动之一 / Players take turns choosing one action:
1. 从抽牌堆抽一张牌 / Draw from deck
2. 从市场区抽一张牌 / Draw from market
3. 打出一张手牌进行投资 / Play a card to invest

### 反垄断规则 / Anti-Monopoly Rule
⚠️ **重要**：持有某公司最多投资牌的玩家（大股东）不能从市场抽取该公司的新牌！

⚠️ **Important**: Majority shareholders cannot draw cards of their company from the market!

### 收益结算 / Settlement
当抽牌堆耗尽时 / When the deck is empty:
- 每家公司的大股东获利 / Majority shareholders earn profits
- 其他玩家每持有一张该公司牌，支付1枚硬币给大股东 / Others pay 1 coin per card to majority shareholders
- 支付的硬币翻面为"3"，价值提升 / Paid coins flip to value 3
- 计算每位玩家硬币总价值得分 / Calculate scores based on total coin value

### 游戏结束 / Game End
当所有玩家都作为起始玩家完成一局后，得分最高者获胜。

After each player has been the starting player once, the highest score wins.

## 🛠️ 技术栈 / Tech Stack

### 前端 / Frontend
- React 18
- TypeScript
- Tailwind CSS
- Socket.io Client
- Vite

### 后端 / Backend
- Node.js
- Express
- Socket.io
- TypeScript

## 📦 本地开发 / Local Development

### 前置要求 / Prerequisites
- Node.js 18+
- npm or yarn

### 安装步骤 / Installation

1. 克隆仓库 / Clone repository
```bash
git clone <repository-url>
cd chuchuang-company
```

2. 安装服务端依赖 / Install server dependencies
```bash
cd server
npm install
```

3. 安装客户端依赖 / Install client dependencies
```bash
cd ../client
npm install
```

4. 配置环境变量 / Configure environment variables

服务端 / Server:
```bash
cd server
cp .env.example .env
# Edit .env if needed
```

客户端 / Client:
```bash
cd client
cp .env.example .env
# Edit .env if needed
```

### 运行开发服务器 / Run Development Servers

1. 启动服务端 / Start server (Terminal 1)
```bash
cd server
npm run dev
```

服务器将在 http://localhost:3001 运行

Server runs at http://localhost:3001

2. 启动客户端 / Start client (Terminal 2)
```bash
cd client
npm run dev
```

客户端将在 http://localhost:3000 运行

Client runs at http://localhost:3000

## 🚀 部署 / Deployment

### 前端部署（Vercel） / Frontend Deployment (Vercel)

1. 推送代码到GitHub / Push code to GitHub

2. 在Vercel导入项目 / Import project in Vercel

3. 配置构建设置 / Configure build settings:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. 添加环境变量 / Add environment variable:
   - `VITE_SERVER_URL`: 你的后端URL / Your backend URL

### 后端部署（Railway/Render） / Backend Deployment (Railway/Render)

#### 使用Railway / Using Railway

1. 在Railway创建新项目 / Create new project in Railway

2. 连接GitHub仓库 / Connect GitHub repository

3. 配置服务 / Configure service:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. 添加环境变量 / Add environment variables:
   - `PORT`: Railway会自动设置 / Automatically set by Railway
   - `CLIENT_URL`: 你的前端URL / Your frontend URL

#### 使用Docker / Using Docker

```bash
cd server
docker build -t chuchuang-game .
docker run -p 3001:3001 -e CLIENT_URL=https://your-frontend.vercel.app chuchuang-game
```

## 📖 API文档 / API Documentation

### Socket.io Events

#### 客户端发送 / Client Emits
- `createRoom`: 创建房间 / Create room
- `joinRoom`: 加入房间 / Join room
- `setReady`: 设置准备状态 / Set ready status
- `drawFromDeck`: 从牌堆抽牌 / Draw from deck
- `drawFromMarket`: 从市场抽牌 / Draw from market
- `playCard`: 打出手牌 / Play card
- `startNextRound`: 开始下一轮 / Start next round

#### 服务端发送 / Server Emits
- `roomUpdate`: 房间状态更新 / Room state update
- `gameStart`: 游戏开始 / Game start
- `gameUpdate`: 游戏状态更新 / Game state update
- `settlement`: 结算 / Settlement
- `gameFinished`: 游戏结束 / Game finished
- `error`: 错误信息 / Error message

## 🎨 游戏截图 / Screenshots

待添加 / To be added

## 🤝 贡献 / Contributing

欢迎提交问题和拉取请求！

Issues and pull requests are welcome!

## 📄 许可证 / License

MIT License

## 👥 作者 / Authors

初创公司游戏团队 / Chuchuang Game Team

---

仅供个人学习使用 / For personal learning use only
