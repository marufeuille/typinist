import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useGameStore } from '../../engine/gameState';
import { AnimationQueue } from '../../engine/animation';
import type { AnimatingChar } from '../../engine/animation';
import {
  clearCanvas,
  drawGrid,
  drawTrail,
  drawGoal,
  drawCharacter,
  drawObstacles,
  drawClearOverlay,
} from './renderer';
import styles from './GameCanvas.module.css';

const CANVAS_SIZE = 400;

export type GameCanvasRef = {
  enqueue: (anim: Omit<AnimatingChar, 'progress'>) => void;
};

type Props = {
  onAnimationEnd?: () => void;
};

export const GameCanvas = forwardRef<GameCanvasRef, Props>(
  ({ onAnimationEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animQueueRef = useRef<AnimationQueue | null>(null);
    const currentAnimRef = useRef<AnimatingChar | null>(null);

    const character = useGameStore((s) => s.character);
    const trail = useGameStore((s) => s.trail);
    const gridSize = useGameStore((s) => s.gridSize);
    const goal = useGameStore((s) => s.goal);
    const obstacles = useGameStore((s) => s.obstacles);
    const isCleared = useGameStore((s) => s.isCleared);

    const cellSize = CANVAS_SIZE / gridSize;

    const render = useCallback(
      (anim: AnimatingChar | null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const snapChar = useGameStore.getState().character;

        clearCanvas(ctx, CANVAS_SIZE, CANVAS_SIZE);
        drawGrid(ctx, gridSize, cellSize);
        drawTrail(ctx, useGameStore.getState().trail, cellSize);
        drawGoal(ctx, goal, cellSize);
        drawObstacles(ctx, obstacles, cellSize);

        if (anim) {
          const animX =
            anim.type === 'move'
              ? anim.fromX + (anim.toX - anim.fromX) * anim.progress
              : anim.fromX;
          const animY =
            anim.type === 'move'
              ? anim.fromY + (anim.toY - anim.fromY) * anim.progress
              : anim.fromY;

          let animAngle: number | undefined;
          if (anim.type === 'turn') {
            const dirAngles: Record<string, number> = {
              right: 0,
              down: Math.PI / 2,
              left: Math.PI,
              up: -Math.PI / 2,
            };
            const from = dirAngles[anim.fromDirection];
            let to = dirAngles[anim.toDirection];
            const diff = to - from;
            if (diff > Math.PI) to -= Math.PI * 2;
            if (diff < -Math.PI) to += Math.PI * 2;
            animAngle = from + (to - from) * anim.progress;
          }

          drawCharacter(ctx, snapChar, cellSize, animX, animY, animAngle);
        } else {
          drawCharacter(ctx, snapChar, cellSize);
        }

        if (useGameStore.getState().isCleared && !anim) {
          drawClearOverlay(ctx, CANVAS_SIZE, CANVAS_SIZE);
        }
      },
      [gridSize, cellSize, goal, obstacles]
    );

    // アニメーションキューの初期化
    useEffect(() => {
      const queue = new AnimationQueue((anim) => {
        currentAnimRef.current = anim;
        render(anim);
        if (anim === null) {
          onAnimationEnd?.();
        }
      });
      animQueueRef.current = queue;
      return () => queue.clear();
    }, [render, onAnimationEnd]);

    // 外部からエンキューできるようにする
    useImperativeHandle(ref, () => ({
      enqueue: (anim: Omit<AnimatingChar, 'progress'>) => {
        animQueueRef.current?.enqueue(anim);
      },
    }));

    // 状態変化時（アニメーションなし）の再描画
    useEffect(() => {
      if (!currentAnimRef.current) {
        render(null);
      }
    }, [character, trail, isCleared, render]);

    return (
      <div className={styles.wrapper}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={styles.canvas}
        />
      </div>
    );
  }
);

GameCanvas.displayName = 'GameCanvas';
