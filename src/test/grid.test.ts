import { describe, it, expect } from 'vitest';
import {
  getNextPosition,
  isInBounds,
  rotateRight,
  rotateLeft,
  positionsEqual,
} from '../engine/grid';

describe('grid utilities', () => {
  describe('getNextPosition', () => {
    it('上方向に1マス進む', () => {
      expect(getNextPosition(2, 2, 'up')).toEqual({ x: 2, y: 1 });
    });
    it('下方向に1マス進む', () => {
      expect(getNextPosition(2, 2, 'down')).toEqual({ x: 2, y: 3 });
    });
    it('左方向に1マス進む', () => {
      expect(getNextPosition(2, 2, 'left')).toEqual({ x: 1, y: 2 });
    });
    it('右方向に1マス進む', () => {
      expect(getNextPosition(2, 2, 'right')).toEqual({ x: 3, y: 2 });
    });
  });

  describe('isInBounds', () => {
    it('グリッド内の座標は true', () => {
      expect(isInBounds(0, 0, 5)).toBe(true);
      expect(isInBounds(4, 4, 5)).toBe(true);
      expect(isInBounds(2, 3, 5)).toBe(true);
    });
    it('グリッド外の座標は false', () => {
      expect(isInBounds(-1, 0, 5)).toBe(false);
      expect(isInBounds(0, -1, 5)).toBe(false);
      expect(isInBounds(5, 0, 5)).toBe(false);
      expect(isInBounds(0, 5, 5)).toBe(false);
    });
  });

  describe('rotateRight', () => {
    it('上→右', () => expect(rotateRight('up')).toBe('right'));
    it('右→下', () => expect(rotateRight('right')).toBe('down'));
    it('下→左', () => expect(rotateRight('down')).toBe('left'));
    it('左→上', () => expect(rotateRight('left')).toBe('up'));
  });

  describe('rotateLeft', () => {
    it('上→左', () => expect(rotateLeft('up')).toBe('left'));
    it('左→下', () => expect(rotateLeft('left')).toBe('down'));
    it('下→右', () => expect(rotateLeft('down')).toBe('right'));
    it('右→上', () => expect(rotateLeft('right')).toBe('up'));
  });

  describe('positionsEqual', () => {
    it('同じ座標は true', () => {
      expect(positionsEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    });
    it('異なる座標は false', () => {
      expect(positionsEqual({ x: 1, y: 2 }, { x: 1, y: 3 })).toBe(false);
      expect(positionsEqual({ x: 1, y: 2 }, { x: 2, y: 2 })).toBe(false);
    });
  });
});
