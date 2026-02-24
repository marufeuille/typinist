import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../engine/gameState';
import type { Level } from '../types';

const SAMPLE_LEVEL: Level = {
  id: 1,
  name: 'テスト',
  description: 'テスト用レベル',
  gridSize: 5,
  start: { x: 0, y: 4, direction: 'right' },
  goal: { x: 4, y: 4 },
};

describe('gameState store', () => {
  beforeEach(() => {
    useGameStore.getState().initLevel(SAMPLE_LEVEL);
  });

  describe('initLevel', () => {
    it('キャラクターがstart位置に配置される', () => {
      const { character } = useGameStore.getState();
      expect(character.x).toBe(0);
      expect(character.y).toBe(4);
      expect(character.direction).toBe('right');
    });

    it('isCleared が false に初期化される', () => {
      expect(useGameStore.getState().isCleared).toBe(false);
    });
  });

  describe('move_forward', () => {
    it('右向きで1マス右に進む', () => {
      useGameStore.getState().executeAction('move_forward');
      const { character } = useGameStore.getState();
      expect(character.x).toBe(1);
      expect(character.y).toBe(4);
    });

    it('グリッド端での移動は失敗する', () => {
      // 左端(x=0)で左向きは移動失敗
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 2, direction: 'left' },
      });
      const result = useGameStore.getState().executeAction('move_forward');
      expect(result).toBe(false);
      expect(useGameStore.getState().character.x).toBe(0);
    });

    it('ゴールに到達すると isCleared が true になる', () => {
      // x=0 から right向きで4回移動するとゴール(x=4)
      for (let i = 0; i < 4; i++) {
        useGameStore.getState().executeAction('move_forward');
      }
      expect(useGameStore.getState().isCleared).toBe(true);
    });
  });

  describe('turn_right', () => {
    it('右回転で向きが変わる', () => {
      useGameStore.getState().executeAction('turn_right');
      expect(useGameStore.getState().character.direction).toBe('down');
    });
  });

  describe('turn_left', () => {
    it('左回転で向きが変わる', () => {
      useGameStore.getState().executeAction('turn_left');
      expect(useGameStore.getState().character.direction).toBe('up');
    });
  });

  describe('reset', () => {
    it('resetでstart位置に戻る', () => {
      useGameStore.getState().executeAction('move_forward');
      useGameStore.getState().reset();
      const { character } = useGameStore.getState();
      expect(character.x).toBe(0);
      expect(character.y).toBe(4);
    });

    it('resetでisCleared が false になる', () => {
      for (let i = 0; i < 4; i++) {
        useGameStore.getState().executeAction('move_forward');
      }
      expect(useGameStore.getState().isCleared).toBe(true);
      useGameStore.getState().reset();
      expect(useGameStore.getState().isCleared).toBe(false);
    });
  });

  describe('軌跡 (trail)', () => {
    it('移動するたびに軌跡が追加される', () => {
      useGameStore.getState().executeAction('move_forward');
      const { trail } = useGameStore.getState();
      expect(trail.length).toBe(2); // 開始点 + 移動先
    });

    it('回転しても軌跡は増えない', () => {
      const before = useGameStore.getState().trail.length;
      useGameStore.getState().executeAction('turn_right');
      const after = useGameStore.getState().trail.length;
      expect(after).toBe(before);
    });
  });
});
