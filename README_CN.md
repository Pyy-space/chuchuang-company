# 初创公司投资游戏

一个支持3-7人的多人在线桌游，模拟投资经营类卡牌游戏。

## 游戏介绍

玩家通过投资6家不同的公司、争夺大股东地位来获取收益。游戏时长约20分钟/局。

## 主要特性

- 🎯 支持3-7人实时在线对战
- 🏢 6家公司的投资系统
- 💰 硬币双面增值机制
- 🔒 反垄断规则
- 📊 实时结算系统
- 🎨 响应式设计
- 🔄 多轮游戏支持

## 游戏规则

### 游戏组成
- 6家不同公司的卡牌（每家公司12张）
- 硬币系统：每枚硬币有"1"面和"3"面
- 大股东标记

### 准备阶段
1. 洗牌并为每位玩家分发3张手牌
2. 从牌堆中移除5张牌（不参与游戏）
3. 每位玩家获得10枚硬币，"1"面朝上
4. 剩余卡牌作为抽牌堆，部分卡牌放在市场区域

### 行动阶段
玩家轮流行动，每回合选择以下行动之一：

1. **从抽牌堆抽牌**：从牌堆顶部抽取一张牌
2. **从市场区抽牌**：从可见的市场卡牌中选择一张
3. **打出手牌**：打出一张手牌到自己面前（代表投资该公司）

### 反垄断规则 ⚠️
这是游戏的核心机制：

- 在某家公司投资牌数量最多的玩家，将获得该公司的**大股东代币**
- 持有大股东代币后，该玩家**不能再从市场中获取**该公司的新投资牌
- 但可以**打出手中已有的牌**继续投资该公司

### 收益结算
当抽牌堆耗尽时，进行收益结算：

1. **确定大股东**：在每家公司中，持有最多投资牌的玩家成为大股东
2. **其他玩家支付**：其他持有该公司投资牌的玩家，每持有一张该公司投资牌，需向大股东支付1枚硬币
3. **硬币增值**：支付的硬币翻面为"3"面，价值提升
4. **计算得分**：计算每位玩家手中硬币的总价值，累计到得分中

### 游戏结束
- 当所有玩家都作为起始玩家完成一局后，视为一轮游戏结束
- 计算每个人的得分总和
- 得分最高者赢得游戏

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS（响应式设计）
- Socket.io-client（实时通信）
- Vite（构建工具）

### 后端
- Node.js + Express
- Socket.io（WebSocket实时多人通信）
- TypeScript

## 本地开发

### 前置要求
- Node.js 18或更高版本
- npm或yarn

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd chuchuang-company
```

2. 安装服务端依赖
```bash
cd server
npm install
```

3. 安装客户端依赖
```bash
cd ../client
npm install
```

4. 配置环境变量

服务端：
```bash
cd server
cp .env.example .env
# 根据需要编辑 .env
```

客户端：
```bash
cd client
cp .env.example .env
# 根据需要编辑 .env
```

### 运行开发服务器

1. 启动服务端（终端1）
```bash
cd server
npm run dev
```

服务器将在 http://localhost:3001 运行

2. 启动客户端（终端2）
```bash
cd client
npm run dev
```

客户端将在 http://localhost:3000 运行

3. 在浏览器中打开 http://localhost:3000 开始游戏

## 部署指南

### 前端部署（Vercel）

1. 将代码推送到GitHub

2. 在Vercel中导入项目

3. 配置构建设置：
   - 根目录：`client`
   - 构建命令：`npm run build`
   - 输出目录：`dist`

4. 添加环境变量：
   - `VITE_SERVER_URL`: 你的后端服务器URL

5. 部署完成后，记录前端URL用于后端配置

### 后端部署（Railway）

1. 在Railway创建新项目

2. 连接GitHub仓库

3. 配置服务：
   - 根目录：`server`
   - 构建命令：`npm install && npm run build`
   - 启动命令：`npm start`

4. 添加环境变量：
   - `PORT`: Railway会自动设置
   - `CLIENT_URL`: 你的前端URL（Vercel URL）

### 后端部署（Render）

1. 在Render创建新Web Service

2. 连接GitHub仓库

3. 配置：
   - 根目录：`server`
   - 构建命令：`npm install && npm run build`
   - 启动命令：`npm start`

4. 环境变量：
   - `CLIENT_URL`: 你的前端URL

### 使用Docker部署

```bash
cd server
docker build -t chuchuang-game .
docker run -p 3001:3001 \
  -e CLIENT_URL=https://your-frontend.vercel.app \
  chuchuang-game
```

## 游戏玩法提示

1. **控制大股东身份**：成为大股东虽然能获得收益，但也限制了你从市场抽取该公司的牌。要平衡投资分布。

2. **观察对手**：注意其他玩家的投资情况，避免在竞争激烈的公司过度投资。

3. **手牌管理**：合理利用手牌，在适当的时候打出，也要注意保留一些牌作为后手。

4. **硬币策略**：支付出去的硬币会增值到3，所以适当的支付也是一种策略。

5. **市场观察**：注意市场区域的牌，规划好何时从市场抽牌，何时从牌堆抽牌。

## 常见问题

### 如何创建房间？
1. 进入游戏主页
2. 点击"创建房间"
3. 输入你的名字
4. 选择最大玩家数（3-7人）
5. 分享房间码给朋友

### 如何加入房间？
1. 获取朋友分享的房间码
2. 点击"加入房间"
3. 输入你的名字和房间码
4. 点击加入

### 游戏什么时候开始？
当房间内至少有3名玩家，且所有玩家都点击"准备"后，游戏自动开始。

### 如何知道该我行动了？
当前行动的玩家名字会高亮显示，如果是你的回合，会显示"你的回合"提示。

### 断线了怎么办？
目前版本暂不支持断线重连，请确保网络稳定。后续版本会添加此功能。

## 项目结构

```
chuchuang-company/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── contexts/      # Context API
│   │   ├── types/         # TypeScript 类型定义
│   │   └── App.tsx        # 主应用
│   └── package.json
│
├── server/                # 后端代码
│   ├── src/
│   │   ├── game/          # 游戏逻辑
│   │   ├── rooms/         # 房间管理
│   │   ├── socket/        # Socket.io 处理
│   │   ├── types/         # 类型定义
│   │   └── index.ts       # 服务器入口
│   └── package.json
│
└── README.md
```

## 开发路线图

- [x] 基础游戏功能
- [x] 多人房间系统
- [x] 实时游戏同步
- [x] 结算系统
- [x] 多轮游戏
- [ ] 断线重连
- [ ] 游戏回放
- [ ] 排行榜系统
- [ ] 聊天功能
- [ ] 移动端优化

## 贡献指南

欢迎提交问题和拉取请求！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 联系方式

如有问题或建议，欢迎提交 Issue。

---

**仅供个人学习使用**
