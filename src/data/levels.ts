import type { Level } from '../types';

export const LEVELS: Level[] = [
  // --- Stage 1-2: チュートリアル（変更なし）---
  {
    id: 1,
    name: 'ステージ 1',
    description: 'まえにすすんでゴールをめざそう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'right' },
    goal: { x: 4, y: 4 },
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
    ],
  },
  {
    id: 2,
    name: 'ステージ 2',
    description: 'まがってすすもう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'right' },
    goal: { x: 4, y: 0 },
    suggestedCommands: [
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
  // --- Stage 3-5: 障害物追加で改訂 ---
  {
    id: 3,
    name: 'ステージ 3',
    description: 'かべをさけてゴールへ！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'up' },
    goal: { x: 4, y: 0 },
    // 左列に壁: 直進できないのでまず右へ迂回
    obstacles: [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
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
  {
    id: 4,
    name: 'ステージ 4',
    description: 'じぶんでかんがえてゴールへすすもう！',
    gridSize: 5,
    start: { x: 0, y: 2, direction: 'right' },
    goal: { x: 2, y: 0 },
    // 直進するとゴールに届かない壁
    obstacles: [
      { x: 2, y: 2 },
      { x: 2, y: 1 },
    ],
  },
  {
    id: 5,
    name: 'ステージ 5',
    description: 'さいごのちょうせん！',
    gridSize: 5,
    start: { x: 2, y: 4, direction: 'up' },
    goal: { x: 4, y: 2 },
    // 真上に進めないので右方向に迂回
    obstacles: [
      { x: 2, y: 3 },
      { x: 2, y: 2 },
    ],
  },
  // --- Stage 6: 純障害物迷路（自由モード）---
  {
    id: 6,
    name: 'ステージ 6',
    description: 'かべだらけ！じぶんでみちをさがそう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'up' },
    goal: { x: 4, y: 0 },
    // 左列上部と上行の壁がスペースを区切る
    // パス: 右に4マス → 上に4マス
    obstacles: [
      { x: 0, y: 3 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
  },
  // --- Stage 7: アイテム入門 ---
  {
    id: 7,
    name: 'ステージ 7',
    description: 'かぎをひろって とびらをひらこう！',
    gridSize: 5,
    start: { x: 0, y: 4, direction: 'right' },
    goal: { x: 4, y: 0 },
    // パス: 右3マス→pick_up→右1マス→turn_left→上1マス→open_door→上3マス=ゴール
    obstacles: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    items: [
      { id: 'key', label: 'かぎ', position: { x: 3, y: 4 } },
    ],
    doors: [
      { id: 'door-1', position: { x: 4, y: 2 }, requiredItemId: 'key' },
    ],
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'move_forward',
      'pick_up',
      'move_forward',
      'turn_left',
      'move_forward',
      'open_door',
      'move_forward',
      'move_forward',
      'move_forward',
    ],
  },
  // --- Stage 8: 複合パズル（6x6）---
  {
    id: 8,
    name: 'ステージ 8',
    description: 'むずかしいぞ！かぎをひろって とびらをひらこう！',
    gridSize: 6,
    start: { x: 0, y: 5, direction: 'right' },
    goal: { x: 5, y: 0 },
    // パス: 右5マス→turn_left→上2マス→turn_left→左2マス→pick_up→
    //       turn_right×2→右2マス→turn_left→上2マス→open_door→上2マス=ゴール
    obstacles: [
      // 行0（ゴール列以外を封鎖）
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      // 行1（扉の列以外を封鎖）
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      // 行2（扉の列以外を封鎖）
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      // 行3（アイテム・通路を除いて封鎖）
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      // 行4（全列封鎖）
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
    ],
    items: [
      { id: 'key', label: 'かぎ', position: { x: 3, y: 3 } },
    ],
    doors: [
      { id: 'door-1', position: { x: 5, y: 1 }, requiredItemId: 'key' },
    ],
    suggestedCommands: [
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'move_forward',
      'pick_up',
      'turn_right',
      'turn_right',
      'move_forward',
      'move_forward',
      'turn_left',
      'move_forward',
      'open_door',
      'move_forward',
      'move_forward',
    ],
  },
];
