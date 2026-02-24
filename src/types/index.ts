// キャラクターの向き
export type Direction = 'up' | 'down' | 'left' | 'right';

// ゲームアクション
export type GameAction =
  | { type: 'move_forward' }
  | { type: 'turn_right' }
  | { type: 'turn_left' }
  | { type: 'pen_up' }
  | { type: 'pen_down' }
  | { type: 'pick_up' }
  | { type: 'unlock_door' }
  | { type: 'open_door' };

// ゲームコマンド定義
export type Command = {
  id: string;
  label: string;      // "まえにすすむ"
  romaji: string;     // "maenisusuumu"
  hiragana: string;   // "まえにすすむ"
  action: GameAction;
};

// グリッド座標
export type Position = {
  x: number;
  y: number;
};

// キャラクター状態
export type Character = {
  x: number;
  y: number;
  direction: Direction;
};

// アニメーション状態
export type AnimationState = {
  isAnimating: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromDirection: Direction;
  toDirection: Direction;
  progress: number; // 0〜1
};

// マップ上に配置されるアイテム（鍵など）
export type Item = {
  id: string;
  label: string;   // 「かぎ」など Canvas 描画・インベントリ表示に使う
  position: Position;
};

// 扉（鍵付き or 鍵なしの障害物）
export type Door = {
  id: string;
  position: Position;
  requiredItemId?: string;  // 省略時は鍵不要（最初から開錠済み）
  isOpen: boolean;
  isUnlocked: boolean;      // 鍵なし扉は true、鍵あり扉は unlock_door 後に true
};

// 難易度設定
// easy: コンテキストコマンドは常時表示（条件未満はグレーアウト）
// hard: 条件達成時のみ表示
export type DifficultyMode = 'easy' | 'hard';

// ゲーム状態
export type GameState = {
  character: Character;
  trail: Position[];
  gridSize: number;
  goal: Position;
  obstacles: Position[];
  isCleared: boolean;
  penDown: boolean;
  items: Item[];
  inventory: string[];  // 所持アイテムの id
  doors: Door[];
};

// レベルデータ
export type Level = {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  start: { x: number; y: number; direction: Direction };
  goal: Position;
  obstacles?: Position[];
  suggestedCommands?: string[]; // コマンドID の順序（写経モード用）
  items?: Item[];
  doors?: Array<Omit<Door, 'isOpen' | 'isUnlocked'>>;  // レベル定義では isOpen・isUnlocked を含めない
};

// タイピング入力状態
export type TypingState = {
  targetHiragana: string;
  targetRomaji: string[];   // 各文字のローマ字候補（最初の候補を表示）
  inputBuffer: string;      // 現在入力中の文字列
  completedChars: number;   // 完了した文字数
  isComplete: boolean;
  lastKeyCorrect: boolean | null;
};

// タイピングエンジン設定
export type TypingEngineConfig = {
  hiragana: string;
};
