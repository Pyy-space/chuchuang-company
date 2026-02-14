# 🎲 Game Rules / 游戏规则

## Game Components / 游戏组成
- **Card System** / 卡牌系统：Total 45 cards across 6 companies / 共45张卡牌，分属6家公司
  - Company A / A公司：5 cards / 5张
  - Company B / B公司：6 cards / 6张
  - Company C / C公司：7 cards / 7张
  - Company D / D公司：8 cards / 8张
  - Company E / E公司：9 cards / 9张
  - Company F / F公司：10 cards / 10张
- **Coin System** / 硬币系统：Each coin has two sides (value 1 and 3) / 每枚硬币有"1"面和"3"面
- **Majority Shareholder Markers** / 大股东标记

## Setup Phase / 准备阶段
1. **Shuffle** / 洗牌：Shuffle all 45 cards / 将45张卡牌充分洗混
2. **Remove Cards** / 移除卡牌：Remove 5 cards from the top (not used this round) / 从牌堆顶部移除5张牌
3. **Deal Hands** / 分发手牌：Each player receives 3 cards / 每位玩家分发3张手牌
4. **Distribute Coins** / 分发硬币：Each player starts with 10 coins (value 1 face up) / 每位玩家获得10枚硬币，"1"面朝上
5. **Setup Market** / 设置市场：Place 5 cards face-up as the market / 翻开5张牌作为市场区域
6. **Remaining Cards** / 剩余卡牌：Form the draw deck (face down) / 作为抽牌堆（背面朝上）

## Action Phase (Two-Step System) ⭐
**This is the core game mechanic!** Players take turns. Each turn **must** complete two steps:

### Step 1: Take a Card
Choose one of the following:

**A. Draw from Deck**
- Draw the top card from the deck
- **Payment Rule**: Pay 1 coin for each card in the market
- Place paid coins on the corresponding market cards
- **Exception**: If you're a majority shareholder and ALL market cards are from your company, draw for FREE

**B. Take from Market**
- Choose one visible card from the market
- Collect all coins on that card (if any)
- Market automatically refills to 5 cards from the deck

### Step 2: Play a Card
Choose a card from your hand and choose one:

**A. Play to Market**
- Place the card into the market area (for others to take)
- **Restriction**: Cannot play the same company card you just took from market
- **Restriction**: Majority shareholders cannot play their company's cards to market (anti-monopoly rule)

**B. Play to Investment**
- Place the card face-up in front of you as an investment
- Invested cards cannot be taken back

**Important**: After completing both steps, you should always have 3 cards in hand


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



仅供个人学习使用 / For personal learning use only
