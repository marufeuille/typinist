import type { Direction, Position } from '../types';

/**
 * 指定方向の1マス先の座標を返す
 */
export function getNextPosition(
  x: number,
  y: number,
  direction: Direction
): Position {
  switch (direction) {
    case 'up':    return { x, y: y - 1 };
    case 'down':  return { x, y: y + 1 };
    case 'left':  return { x: x - 1, y };
    case 'right': return { x: x + 1, y };
  }
}

/**
 * 座標がグリッド内かどうかを判定する
 */
export function isInBounds(x: number, y: number, gridSize: number): boolean {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
}

/**
 * 時計回りに90°回転した向きを返す
 */
export function rotateRight(direction: Direction): Direction {
  const map: Record<Direction, Direction> = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up',
  };
  return map[direction];
}

/**
 * 反時計回りに90°回転した向きを返す
 */
export function rotateLeft(direction: Direction): Direction {
  const map: Record<Direction, Direction> = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up',
  };
  return map[direction];
}

/**
 * 2つの座標が等しいかどうかを判定する
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * セルのキャンバス座標（左上角）を返す
 */
export function cellToCanvas(
  gridX: number,
  gridY: number,
  cellSize: number
): { canvasX: number; canvasY: number } {
  return {
    canvasX: gridX * cellSize,
    canvasY: gridY * cellSize,
  };
}
