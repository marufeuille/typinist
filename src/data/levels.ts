import type { Level } from '../types';

export const LEVELS: Level[] = [
  // --- Stage 1: 3x3 直進のみ ---
  {
    id: 1,
    name: 'ステージ 1',
    description: 'まえにすすんでゴールをめざそう！',
    gridSize: 3,
    start: { x: 0, y: 2, direction: 'right' },
    goal: { x: 2, y: 2 },
    suggestedCommands: ['move_forward', 'move_forward'],
  },
  // --- Stage 2: 3x3 旋回 ---
  {
    id: 2,
    name: 'ステージ 2',
    description: 'まがってすすもう！',
    gridSize: 3,
    start: { x: 0, y: 2, direction: 'right' },
    goal: { x: 2, y: 0 },
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'move_forward',
    ],
  },
  // --- Stage 3: 5x5 障害物 ---
  {
    id: 3,
    name: 'ステージ 3',
    description: 'かべをさけてゴールへ！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'up' },
    goal: { x: 4, y: 0 },
    // L字型の壁で直進を阻む + (3,0)でゴールへは下からのみ進入可
    obstacles: [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 3, y: 0 },
    ],
    suggestedCommands: [
      'turn_right',
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
    ],
  },
  // --- Stage 4: 5x5 鍵なし扉 ---
  {
    id: 4,
    name: 'ステージ 4',
    description: 'とびらをひらいてすすもう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'right' },
    goal: { x: 4, y: 0 },
    // 壁ライン(y=1, x=0〜3) + コーナー壁(3,0) で扉(4,1)が唯一の通路
    // ゴール(4,0)は扉のすぐ上: 壁☆ / 壁扉 の配置
    // パス: 右4→上2→open_door→上2=ゴール
    obstacles: [
      { x: 3, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    doors: [{ id: 'door-1', position: { x: 4, y: 1 } }],
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'move_forward',
      'open_door',
      'move_forward',
      'move_forward',
    ],
  },
  // --- Stage 5: 5x5 鍵付き扉（回り道して鍵を取る） ---
  {
    id: 5,
    name: 'ステージ 5',
    description: 'さいごのちょうせん！かぎをひろって とびらをひらこう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'right' },
    goal: { x: 4, y: 0 },
    // 壁ライン(y=1, x=0〜3) + コーナー壁(3,0) で扉(4,1)が唯一の通路
    // ゴール(4,0)は扉のすぐ上: 壁☆ / 壁扉 の配置
    // 鍵は(2,3)に配置 → 回り道して取得が必要
    // パス: 右2→上1(pick_up)→右2→上1→unlock_door→open_door→上2=ゴール
    obstacles: [
      { x: 3, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    items: [{ id: 'key', label: 'かぎ', position: { x: 2, y: 3 } }],
    doors: [{ id: 'door-1', position: { x: 4, y: 1 }, requiredItemId: 'key' }],
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'pick_up',
      'turn_right',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'unlock_door',
      'open_door',
      'move_forward',
      'move_forward',
    ],
  },
  // --- Stage 6: 9x9 迷路（最終ステージ） ---
  {
    id: 6,
    name: 'ステージ 6',
    description: 'めいろをぬけてゴールをめざそう！かぎもわすれずに！',
    gridSize: 9,
    start: { x: 0, y: 8, direction: 'right' },
    goal: { x: 8, y: 0 },
    // Z字型の一本道迷路
    // パス: 右2→上4→右3(鍵)→上3→左3→上1→右4→unlock→open→右2=ゴール
    //
    //      0  1  2  3  4  5  6  7  8
    // y=0: W  W  .  .  .  .  .  D  G
    // y=1: W  W  .  .  .  .  W  W  W
    // y=2: W  W  W  W  W  .  W  W  W
    // y=3: W  W  W  W  W  .  W  W  W
    // y=4: W  W  .  .  .  K  W  W  W
    // y=5: W  W  .  W  W  W  W  W  W
    // y=6: W  W  .  W  W  W  W  W  W
    // y=7: W  W  .  W  W  W  W  W  W
    // y=8: S  .  .  W  W  W  W  W  W
    obstacles: [
      // y=0
      { x: 0, y: 0 }, { x: 1, y: 0 },
      // y=1
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
      // y=2
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
      { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
      // y=3
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
      { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
      // y=4
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
      // y=5
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
      { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
      // y=6
      { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
      { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
      // y=7
      { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
      { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
      // y=8
      { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
    ],
    items: [{ id: 'key', label: 'かぎ', position: { x: 5, y: 4 } }],
    doors: [{ id: 'door-1', position: { x: 7, y: 0 }, requiredItemId: 'key' }],
    suggestedCommands: [
      'move_forward', 'move_forward',                               // → (2,8)
      'turn_left',
      'move_forward', 'move_forward', 'move_forward', 'move_forward', // → (2,4)
      'turn_right',
      'move_forward', 'move_forward', 'move_forward',               // → (5,4)
      'pick_up',
      'turn_left',
      'move_forward', 'move_forward', 'move_forward',               // → (5,1)
      'turn_left',
      'move_forward', 'move_forward', 'move_forward',               // → (2,1)
      'turn_right',
      'move_forward',                                               // → (2,0)
      'turn_right',
      'move_forward', 'move_forward', 'move_forward', 'move_forward', // → (6,0)
      'unlock_door',
      'open_door',
      'move_forward',                                               // → (7,0)
      'move_forward',                                               // → (8,0) GOAL
    ],
  },
  // --- Stage 7: 9x9 分岐あり迷路（まっすぐ進むと行き止まり） ---
  {
    id: 7,
    name: 'ステージ 7',
    description: 'わかれみちに気をつけて！まよったらひきかえそう！',
    gridSize: 9,
    start: { x: 0, y: 8, direction: 'right' },
    goal: { x: 8, y: 0 },
    // 3つの分岐（すべてまっすぐ進むと行き止まり）
    //
    //      0  1  2  3  4  5  6  7  8
    // y=0: W  W  W  W  W  W  .  D  G
    // y=1: W  W  W  .  W  W  .  W  W
    // y=2: W  W  W  .  W  W  .  W  W
    // y=3: W  W  W  .  W  W  .  W  W
    // y=4: W  W  W  .  .  .  K  .  .  ← 分岐③: 右は行き止まり
    // y=5: W  W  W  .  W  W  W  W  W
    // y=6: W  W  W  .  W  W  W  W  W
    // y=7: W  W  W  .  W  W  W  W  W
    // y=8: S  .  .  .  .  .  W  W  W  ← 分岐①: 右は行き止まり
    //                  ↑ 分岐②: x=3 を上に行くと行き止まり
    obstacles: [
      // y=0: x=0..5
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
      // y=1: x=0..2, x=4..5, x=7..8
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
      // y=2: 同上
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
      // y=3: 同上
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
      // y=4: x=0..2（x=3..8は通路＋行き止まり）
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
      // y=5: x=0..2, x=4..8
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
      // y=6: 同上
      { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
      // y=7: 同上
      { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
      // y=8: x=6..8
      { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
    ],
    items: [{ id: 'key', label: 'かぎ', position: { x: 6, y: 4 } }],
    doors: [{ id: 'door-1', position: { x: 7, y: 0 }, requiredItemId: 'key' }],
    suggestedCommands: [
      'move_forward', 'move_forward', 'move_forward',        // → (3,8)  ※右は行き止まり
      'turn_left',
      'move_forward', 'move_forward', 'move_forward', 'move_forward',  // → (3,4)  ※上に行くと行き止まり
      'turn_right',
      'move_forward', 'move_forward', 'move_forward',        // → (6,4)  ※右は行き止まり
      'pick_up',
      'turn_left',
      'move_forward', 'move_forward', 'move_forward', 'move_forward',  // → (6,0)
      'turn_right',
      'unlock_door',
      'open_door',
      'move_forward',                                        // → (7,0)
      'move_forward',                                        // → (8,0) GOAL
    ],
  },
];
