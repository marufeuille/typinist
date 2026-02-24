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

## 画面構成（Step 1 MVP）

```
┌─────────────────────────────────────────┐
│  [Typinist]    ステージ 1    [リセット]    │  ← GameHeader
├────────────────────┬────────────────────┤
│                    │                    │
│   ┌──┬──┬──┬──┬──┐ │   コマンド一覧:     │
│   │  │  │  │  │☆│ │   ▶ まえにすすむ    │  ← CommandPalette
│   ├──┼──┼──┼──┼──┤ │     みぎをむく      │
│   │  │  │  │  │  │ │     ひだりをむく     │
│   ├──┼──┼──┼──┼──┤ │                    │
│   │  │  │  │  │  │ │                    │
│   ├──┼──┼──┼──┼──┤ │                    │
│   │▶│  │  │  │  │ │                    │
│   └──┴──┴──┴──┴──┘ │                    │
│                    │                    │
│  ← GameCanvas →    │                    │
├────────────────────┴────────────────────┤
│                                         │
│  お手本:  まえにすすむ                     │
│  ローマ字: [m][a][e][n][i][s][u][s][u][m][u] │
│  入力:    ma_                            │  ← TypingInput
│                                         │
└─────────────────────────────────────────┘
```

**レスポンシブ:** 画面幅 < 768px で Canvas + CommandPalette を縦並びに切り替え

---

## コアデータ型定義

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';

type GameAction =
  | { type: 'move_forward' }
  | { type: 'turn_right' }
  | { type: 'turn_left' };

type Command = {
  id: string;
  label: string;
  romaji: string;
  hiragana: string;
  action: GameAction;
};

type Position = { x: number; y: number };

type Character = { x: number; y: number; direction: Direction };

type GameState = {
  character: Character;
  trail: Position[];
  gridSize: number;
  goal: Position;
  obstacles: Position[];
  isCleared: boolean;
  penDown: boolean;
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
};
```

---

## ローマ字タイピングエンジン仕様

### 入力フロー
1. CommandPaletteからコマンドを選択（クリック）
2. TypingInputにお手本（ひらがな）とローマ字ガイドが表示される
3. ユーザーがキーボードで1文字ずつローマ字を入力
4. 正しいキー → 緑ハイライト
5. 間違いキー → 赤フラッシュ（ペナルティなし、やり直し可）
6. 全文字入力完了 → コマンド実行 → キャラクター移動

### 複数パターン対応ロジック（typingEngine.ts）

```typescript
// ひらがな1文字に対する受け入れローマ字パターン
const ROMAJI_PATTERNS: Record<string, string[][]> = {
  'し': [['s','i'], ['s','h','i']],
  'つ': [['t','u'], ['t','s','u']],
  'ち': [['t','i'], ['c','h','i']],
  // ...
};
```

入力中のバッファと各パターンの先頭部分を比較し、
まだいずれかのパターンに一致できる場合は「受け入れ」、
全パターンと不一致なら「エラー」。

### TypingState

```typescript
type TypingState = {
  targetHiragana: string;
  targetRomaji: string[];    // 表示用ローマ字（最初の候補）
  inputBuffer: string;       // 現在入力中のバッファ
  completedChars: number;    // 完了した文字数
  isComplete: boolean;
  lastKeyCorrect: boolean | null;
};
```

---

## Canvas描画・アニメーション仕様

### renderer.ts（純関数群）

```typescript
// グリッド線描画
function drawGrid(ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number): void;

// ゴール（星マーク）描画
function drawGoal(ctx: CanvasRenderingContext2D, pos: Position, cellSize: number): void;

// キャラクター（三角形矢印）描画
function drawCharacter(ctx: CanvasRenderingContext2D, char: Character, cellSize: number): void;

// 軌跡描画
function drawTrail(ctx: CanvasRenderingContext2D, trail: Position[], cellSize: number): void;
```

### アニメーション仕様

- `requestAnimationFrame` ベース
- 移動アニメーション: 250ms、ease-out イージング
- 回転アニメーション: 150ms
- コマンドキュー: 複数コマンドを順次実行

---

## 状態管理設計（Zustand）

### gameStateStore

```typescript
type GameStateStore = GameState & {
  // アクション
  initLevel: (level: Level) => void;
  moveForward: () => void;
  turnRight: () => void;
  turnLeft: () => void;
  reset: () => void;
  // アニメーション
  animationState: AnimationState | null;
  startAnimation: (anim: AnimationState) => void;
  updateAnimation: (progress: number) => void;
  completeAnimation: () => void;
};
```

### typingStateStore

```typescript
type TypingStateStore = TypingState & {
  selectCommand: (command: Command) => void;
  processKey: (key: string) => boolean; // 正解/不正解
  reset: () => void;
};
```

---

## 実装順序

| サブステップ | 内容 |
|---|---|
| 1-1 | プロジェクトセットアップ |
| 1-2 | Canvas描画基盤 |
| 1-3 | ゲーム状態管理 |
| 1-4 | アニメーション実装 |
| 1-5 | タイピングエンジン |
| 1-6 | UI統合 |
| 1-7 | レベルデータとプレイ体験 |
| 1-8 | テスト |
