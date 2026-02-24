# Typinist - 技術仕様書

## 技術スタック

| 項目 | 選定 | 理由 |
|---|---|---|
| フレームワーク | React 19 + TypeScript | コンポーネント分割・状態管理に強い |
| ビルドツール | Vite | 高速なHMR、React+TSの標準的選択 |
| 描画 | HTML5 Canvas (raw) | ペン軌跡・アニメーションに最適。ライブラリ不要 |
| 状態管理 | Zustand | 軽量でボイラープレート少。ゲーム状態管理に向く |
| CSS | CSS Modules | シンプル、スコープ付き、依存なし |
| ローマ字変換 | wanakana | ローマ字⇔ひらがな変換の定番ライブラリ |
| テスト | Vitest | Viteとの統合が自然 |
| パッケージマネージャ | npm | 標準的 |

---

## プロジェクト構成

```
typinist/
├── docs/
│   ├── requirements.md
│   └── technical-spec.md
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── GameCanvas/
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── GameCanvas.module.css
│   │   │   └── renderer.ts
│   │   ├── TypingInput/
│   │   │   ├── TypingInput.tsx
│   │   │   └── TypingInput.module.css
│   │   ├── CommandPalette/
│   │   │   ├── CommandPalette.tsx
│   │   │   └── CommandPalette.module.css
│   │   └── GameHeader/
│   │       ├── GameHeader.tsx
│   │       └── GameHeader.module.css
│   ├── engine/
│   │   ├── gameState.ts
│   │   ├── commands.ts
│   │   ├── grid.ts
│   │   └── animation.ts
│   ├── typing/
│   │   ├── romajiMap.ts
│   │   └── typingEngine.ts
│   ├── data/
│   │   └── levels.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.module.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 画面構成（Step 2 現在）

```
┌──────────────────────────────────────────────────────────┐
│  [Typinist]  ステージ 7  [やさしい] [↩][↪] [ステージ] [リセット] │  ← GameHeader
├────────────────────┬─────────────────────────────────────┤
│                    │                                     │
│  ┌──┬──┬──┬──┬──┐  │  コマンド一覧:                       │
│  │  │  │  │  │☆│  │  ▶ まえにすすむ   maenisusuumu       │
│  ├──┼──┼──┼──┼──┤  │    みぎをむく    migiwomuku          │  ← CommandPalette
│  │  │🔒│  │  │  │  │    ひだりをむく   hidariwomuku        │
│  ├──┼──┼──┼──┼──┤  │  🪙 ひろう       hirou （グレーアウト）│
│  │  │  │  │  │  │  │  🚪 とびらをひらく tobiraohiraku       │
│  ├──┼──┼──┼──┼──┤  │    （グレーアウト）                   │
│  │▶ │  │  │🪙│  │  │                                     │
│  └──┴──┴──┴──┴──┘  │                                     │
│                    │                                     │
│  ← GameCanvas →    │                                     │
├────────────────────┴─────────────────────────────────────┤
│                                                          │
│  お手本:  まえにすすむ                                       │
│  ローマ字: [m][a][e][n][i][s][u][s][u][m][u]               │
│  入力:    ma_                                             │  ← TypingInput
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**レスポンシブ:** 画面幅 < 768px で Canvas + CommandPalette を縦並びに切り替え

---

## コアデータ型定義

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';

type GameAction =
  | { type: 'move_forward' }
  | { type: 'turn_right' }
  | { type: 'turn_left' }
  | { type: 'pen_up' }
  | { type: 'pen_down' }
  | { type: 'pick_up' }
  | { type: 'open_door' };

type Command = {
  id: string;
  label: string;
  romaji: string;
  hiragana: string;
  action: GameAction;
};

type Position = { x: number; y: number };

type Character = { x: number; y: number; direction: Direction };

// マップ上に配置されるアイテム（鍵など）
type Item = {
  id: string;
  label: string;   // 「かぎ」など Canvas 描画に使う
  position: Position;
};

// 扉（アイテムで開錠可能な障害物）
type Door = {
  id: string;
  position: Position;
  requiredItemId: string;
  isOpen: boolean;
};

// 難易度設定
type DifficultyMode = 'easy' | 'hard';

type GameState = {
  character: Character;
  trail: Position[];
  gridSize: number;
  goal: Position;
  obstacles: Position[];
  isCleared: boolean;
  penDown: boolean;
  items: Item[];          // マップ上の残りアイテム
  inventory: string[];    // 所持アイテムの id
  doors: Door[];
};

type Level = {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  start: { x: number; y: number; direction: Direction };
  goal: Position;
  obstacles?: Position[];
  suggestedCommands?: string[];
  items?: Item[];
  doors?: Array<Omit<Door, 'isOpen'>>;  // レベル定義では isOpen を含めない
};
```

---

## コマンド体系（Step 2）

### 基本コマンド（COMMANDS）
```typescript
// src/engine/commands.ts
export const COMMANDS: Command[] = [move_forward, turn_right, turn_left];
```

### コンテキストコマンド（CONTEXT_COMMANDS）
```typescript
export const CONTEXT_COMMANDS: Command[] = [pick_up, open_door];

// pick_up: hirou（は行・ら行をカバー）
// open_door: tobiraohiraku（た行・ば行・ら行・わ行・は行・か行をカバー）
```

### コンテキストコマンドの発動条件

| コマンドID | 条件 |
|---|---|
| pick_up | `canPickUp(state)`: 現在地にアイテムがある |
| open_door | `canOpenDoor(state)`: 前方に未開の扉があり必要アイテム所持 |

---

## ローマ字タイピングエンジン仕様

### 入力フロー
1. CommandPaletteからコマンドを選択（クリック）
2. TypingInputにお手本（ひらがな）とローマ字ガイドが表示される
3. ユーザーがキーボードで1文字ずつローマ字を入力
4. 正しいキー → 緑ハイライト
5. 間違いキー → 赤フラッシュ（ペナルティなし、やり直し可）
6. 全文字入力完了 → コマンド実行 → キャラクター移動（またはアクション）

### pick_up / open_door の実行
- アニメーションなしで即時実行
- `executeAction('pick_up')` / `executeAction('open_door')` を直接呼ぶ

---

## Canvas描画・アニメーション仕様

### renderer.ts（純関数群）

```typescript
// グリッド線描画
function drawGrid(ctx, gridSize, cellSize): void;

// ゴール（星マーク）描画
function drawGoal(ctx, pos, cellSize): void;

// キャラクター（三角形矢印）描画
function drawCharacter(ctx, char, cellSize, animX?, animY?, animAngle?): void;

// 軌跡描画
function drawTrail(ctx, trail, cellSize): void;

// 障害物描画（赤い四角）
function drawObstacles(ctx, obstacles, cellSize): void;

// アイテム描画（金色の円 + ラベル）
function drawItems(ctx, items, cellSize): void;

// 扉描画（閉: 茶色ブロック、開: 薄い枠線）
function drawDoors(ctx, doors, cellSize): void;
```

### アニメーション仕様

- `requestAnimationFrame` ベース
- 移動アニメーション: 250ms、ease-out イージング
- 回転アニメーション: 150ms
- コマンドキュー: 複数コマンドを順次実行
- pick_up / open_door: アニメーションなし（即時）

---

## 状態管理設計（Zustand）

### useGameStore

```typescript
type GameStore = GameState & {
  currentLevel: Level | null;
  history: GameSnapshot[];  // Undo 用（items/inventory/doors も含む）
  future: GameSnapshot[];   // Redo 用

  initLevel: (level: Level) => void;
  executeAction: (
    actionType: 'move_forward' | 'turn_right' | 'turn_left' | 'pick_up' | 'open_door'
  ) => boolean;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => void;
};
```

### ヘルパー関数（エクスポート）

```typescript
// src/engine/gameState.ts
export function canPickUp(state: GameState): boolean;
export function canOpenDoor(state: GameState): boolean;
```

---

## 難易度設定ロジック（App.tsx）

```typescript
// やさしいモード: コンテキストコマンドを常時表示、条件未達ならグレーアウト
// じごくモード: 条件達成時のみ表示
const visibleCommands = useMemo(() => {
  if (difficulty === 'easy') return [...COMMANDS, ...CONTEXT_COMMANDS];
  const applicable = CONTEXT_COMMANDS.filter(cmd =>
    cmd.id === 'pick_up' ? canPickUp(state) :
    cmd.id === 'open_door' ? canOpenDoor(state) : false
  );
  return [...COMMANDS, ...applicable];
}, [difficulty, character, items, inventory, doors]);

const disabledCommandIds = useMemo(() => {
  if (difficulty !== 'easy') return [];
  return CONTEXT_COMMANDS
    .filter(cmd => !conditionMet(cmd.id, state))
    .map(cmd => cmd.id);
}, [difficulty, character, items, inventory, doors]);
```

---

## レベルデータ（Step 2 現在: 8ステージ）

| Stage | グリッド | 特徴 |
|---|---|---|
| 1 | 5x5 | チュートリアル（直進のみ） |
| 2 | 5x5 | 曲がる（ターン1回） |
| 3 | 5x5 | 障害物あり（迂回） |
| 4 | 5x5 | 自由モード + 障害物 |
| 5 | 5x5 | 自由モード + 障害物 |
| 6 | 5x5 | 障害物迷路（自由モード） |
| 7 | 5x5 | アイテム + 扉（写経モード） |
| 8 | 6x6 | 複合パズル（写経モード） |

---

## テスト方針

- `src/test/*.test.ts` に配置
- ゲームロジック（engine/）のユニットテストを重点的にカバー
- `npm run test` が通らない状態でコミットしない
- 現在: 72件のテストが全パス
