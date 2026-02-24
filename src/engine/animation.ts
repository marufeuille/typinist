import type { Direction } from '../types';

export type AnimatingChar = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromDirection: Direction;
  toDirection: Direction;
  progress: number; // 0〜1
  type: 'move' | 'turn';
};

export type AnimationCallback = (anim: AnimatingChar | null) => void;

const MOVE_DURATION = 250; // ms
const TURN_DURATION = 150; // ms

/**
 * ease-out イージング関数
 */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2);
}

/**
 * アニメーションキュー管理クラス
 */
export class AnimationQueue {
  private queue: AnimatingChar[] = [];
  private current: AnimatingChar | null = null;
  private rafId: number | null = null;
  private startTime: number | null = null;
  private onUpdate: AnimationCallback;

  constructor(onUpdate: AnimationCallback) {
    this.onUpdate = onUpdate;
  }

  enqueue(anim: Omit<AnimatingChar, 'progress'>): void {
    this.queue.push({ ...anim, progress: 0 });
    if (!this.current) {
      this.next();
    }
  }

  private next(): void {
    if (this.queue.length === 0) {
      this.current = null;
      this.onUpdate(null);
      return;
    }
    this.current = this.queue.shift()!;
    this.startTime = null;
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  private tick(timestamp: number): void {
    if (!this.current) return;

    if (this.startTime === null) {
      this.startTime = timestamp;
    }

    const elapsed = timestamp - this.startTime;
    const duration = this.current.type === 'move' ? MOVE_DURATION : TURN_DURATION;
    const rawProgress = Math.min(elapsed / duration, 1);
    const progress = easeOut(rawProgress);

    this.current.progress = progress;
    this.onUpdate({ ...this.current });

    if (rawProgress < 1) {
      this.rafId = requestAnimationFrame(this.tick.bind(this));
    } else {
      this.next();
    }
  }

  clear(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.queue = [];
    this.current = null;
    this.startTime = null;
    this.onUpdate(null);
  }

  get isAnimating(): boolean {
    return this.current !== null || this.queue.length > 0;
  }
}
