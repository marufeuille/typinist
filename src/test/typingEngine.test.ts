import { describe, it, expect } from 'vitest';
import { TypingEngine } from '../typing/typingEngine';

describe('TypingEngine', () => {
  describe('基本的な入力', () => {
    it('「まえにすすむ」を正しく入力できる', () => {
      const engine = new TypingEngine('まえにすすむ');
      const keys = 'maenisusuumu'.split('');
      let lastResult = '';
      for (const key of keys) {
        lastResult = engine.processKey(key);
      }
      expect(lastResult).toBe('complete');
      expect(engine.isComplete()).toBe(true);
    });

    it('「みぎをむく」を正しく入力できる', () => {
      const engine = new TypingEngine('みぎをむく');
      const keys = 'migiwomuku'.split('');
      for (const key of keys.slice(0, -1)) {
        expect(engine.processKey(key)).toBe('correct');
      }
      expect(engine.processKey(keys[keys.length - 1])).toBe('complete');
    });

    it('「ひだりをむく」を正しく入力できる', () => {
      const engine = new TypingEngine('ひだりをむく');
      const keys = 'hidariwomuku'.split('');
      for (const key of keys.slice(0, -1)) {
        engine.processKey(key);
      }
      expect(engine.processKey(keys[keys.length - 1])).toBe('complete');
    });
  });

  describe('不正な入力', () => {
    it('間違ったキーを入力するとwrongが返る', () => {
      const engine = new TypingEngine('まえにすすむ');
      expect(engine.processKey('z')).toBe('wrong');
    });

    it('間違ったキーを入力してもバッファはリセットされない', () => {
      const engine = new TypingEngine('まえにすすむ');
      engine.processKey('m'); // 正解
      expect(engine.processKey('z')).toBe('wrong'); // 不正解
      expect(engine.processKey('a')).toBe('correct'); // 「ま」完了
    });
  });

  describe('複数パターン対応', () => {
    it('「し」を "si" で入力できる', () => {
      const engine = new TypingEngine('し');
      expect(engine.processKey('s')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });

    it('「し」を "shi" で入力できる', () => {
      const engine = new TypingEngine('し');
      expect(engine.processKey('s')).toBe('correct');
      expect(engine.processKey('h')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });

    it('「つ」を "tu" で入力できる', () => {
      const engine = new TypingEngine('つ');
      expect(engine.processKey('t')).toBe('correct');
      expect(engine.processKey('u')).toBe('complete');
    });

    it('「つ」を "tsu" で入力できる', () => {
      const engine = new TypingEngine('つ');
      expect(engine.processKey('t')).toBe('correct');
      expect(engine.processKey('s')).toBe('correct');
      expect(engine.processKey('u')).toBe('complete');
    });

    it('「ち」を "ti" で入力できる', () => {
      const engine = new TypingEngine('ち');
      expect(engine.processKey('t')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });

    it('「ち」を "chi" で入力できる', () => {
      const engine = new TypingEngine('ち');
      expect(engine.processKey('c')).toBe('correct');
      expect(engine.processKey('h')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });

    it('「じ」を "ji" で入力できる', () => {
      const engine = new TypingEngine('じ');
      expect(engine.processKey('j')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });

    it('「じ」を "zi" で入力できる', () => {
      const engine = new TypingEngine('じ');
      expect(engine.processKey('z')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });
  });

  describe('「ん」の入力', () => {
    it('文末の「ん」は "n" 単体で完了できる', () => {
      const engine = new TypingEngine('にん');
      expect(engine.processKey('n')).toBe('correct');
      expect(engine.processKey('i')).toBe('correct');
      // 文末の「ん」は次が母音でないため、n単体で完了
      expect(engine.processKey('n')).toBe('complete');
    });

    it('「にん」を "ninn" でも入力できる', () => {
      const engine = new TypingEngine('にんい');
      expect(engine.processKey('n')).toBe('correct');
      expect(engine.processKey('i')).toBe('correct');
      // 次が母音(い)なので nn が必要
      expect(engine.processKey('n')).toBe('correct');
      expect(engine.processKey('n')).toBe('correct');
      expect(engine.processKey('i')).toBe('complete');
    });
  });

  describe('進捗管理', () => {
    it('getCompletedCount が正しく増える', () => {
      const engine = new TypingEngine('まえ');
      expect(engine.getCompletedCount()).toBe(0);
      engine.processKey('m');
      engine.processKey('a');
      expect(engine.getCompletedCount()).toBe(1);
      engine.processKey('e');
      expect(engine.getCompletedCount()).toBe(2);
    });

    it('getTotalCount が文字数を返す', () => {
      const engine = new TypingEngine('まえにすすむ');
      expect(engine.getTotalCount()).toBe(6);
    });
  });
});
