import type { Character, Position } from '../../types';

const COLORS = {
  grid: '#e0e0e0',
  gridBg: '#f8f9fa',
  cell: '#ffffff',
  character: '#4a90e2',
  characterOutline: '#2c5f8a',
  goal: '#f5c842',
  goalOutline: '#c9a200',
  trail: '#a8d8ea',
  trailStroke: '#5bb5d5',
  obstacle: '#e57373',
  text: '#333333',
};

/**
 * Canvasをクリアする
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * グリッド背景とグリッド線を描画する
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number
): void {
  const totalSize = gridSize * cellSize;

  // 背景
  ctx.fillStyle = COLORS.gridBg;
  ctx.fillRect(0, 0, totalSize, totalSize);

  // セル
  ctx.fillStyle = COLORS.cell;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillRect(
        x * cellSize + 1,
        y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    }
  }

  // グリッド線
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, totalSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(totalSize, i * cellSize);
    ctx.stroke();
  }
}

/**
 * 軌跡を描画する
 */
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: Position[],
  cellSize: number
): void {
  if (trail.length < 2) return;

  const half = cellSize / 2;

  ctx.strokeStyle = COLORS.trailStroke;
  ctx.lineWidth = cellSize * 0.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(trail[0].x * cellSize + half, trail[0].y * cellSize + half);
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x * cellSize + half, trail[i].y * cellSize + half);
  }
  ctx.stroke();

  // 始点に丸を描く
  ctx.fillStyle = COLORS.trail;
  ctx.beginPath();
  ctx.arc(
    trail[0].x * cellSize + half,
    trail[0].y * cellSize + half,
    cellSize * 0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

/**
 * ゴール（星マーク）を描画する
 */
export function drawGoal(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  cellSize: number
): void {
  const cx = pos.x * cellSize + cellSize / 2;
  const cy = pos.y * cellSize + cellSize / 2;
  const outerR = cellSize * 0.38;
  const innerR = cellSize * 0.16;
  const points = 5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 2);

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.fillStyle = COLORS.goal;
  ctx.fill();
  ctx.strokeStyle = COLORS.goalOutline;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * キャラクター（三角形矢印）を描画する
 * direction に応じて向きを変える
 * animX/animY はアニメーション中の補間座標（グリッド単位）
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  char: Character,
  cellSize: number,
  animX?: number,
  animY?: number,
  animAngle?: number
): void {
  const x = animX !== undefined ? animX : char.x;
  const y = animY !== undefined ? animY : char.y;

  const cx = x * cellSize + cellSize / 2;
  const cy = y * cellSize + cellSize / 2;
  const size = cellSize * 0.36;

  // 向きに応じた回転角
  const directionAngles: Record<string, number> = {
    right: 0,
    down: Math.PI / 2,
    left: Math.PI,
    up: -Math.PI / 2,
  };
  const baseAngle = directionAngles[char.direction] ?? 0;
  const angle = animAngle !== undefined ? animAngle : baseAngle;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // 三角形
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.7, -size * 0.7);
  ctx.lineTo(-size * 0.4, 0);
  ctx.lineTo(-size * 0.7, size * 0.7);
  ctx.closePath();

  ctx.fillStyle = COLORS.character;
  ctx.fill();
  ctx.strokeStyle = COLORS.characterOutline;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * 障害物を描画する（将来のモードB用）
 */
export function drawObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: Position[],
  cellSize: number
): void {
  ctx.fillStyle = COLORS.obstacle;
  for (const obs of obstacles) {
    ctx.fillRect(
      obs.x * cellSize + 2,
      obs.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );
  }
}

/**
 * クリア表示のオーバーレイを描画する
 */
export function drawClearOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f5c842';
  ctx.font = `bold ${Math.floor(height * 0.15)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('クリア！', width / 2, height / 2);

  ctx.restore();
}
