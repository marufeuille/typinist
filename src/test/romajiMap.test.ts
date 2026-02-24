import { describe, it, expect } from 'vitest';
import { hiraganaToDefaultRomaji, getPatternsFor } from '../typing/romajiMap';

describe('romajiMap', () => {
  describe('hiraganaToDefaultRomaji', () => {
    it('「まえにすすむ」を正しいローマ字列に変換する', () => {
      expect(hiraganaToDefaultRomaji('まえにすすむ')).toEqual(
        ['m','a','e','n','i','s','u','s','u','m','u']
      );
    });

    it('「みぎをむく」を正しいローマ字列に変換する', () => {
      expect(hiraganaToDefaultRomaji('みぎをむく')).toEqual(
        ['m','i','g','i','w','o','m','u','k','u']
      );
    });

    it('「ひだりをむく」を正しいローマ字列に変換する', () => {
      expect(hiraganaToDefaultRomaji('ひだりをむく')).toEqual(
        ['h','i','d','a','r','i','w','o','m','u','k','u']
      );
    });
  });

  describe('getPatternsFor', () => {
    it('「し」は "si" と "shi" の2パターンを持つ', () => {
      const patterns = getPatternsFor('し');
      expect(patterns).toContainEqual(['s','i']);
      expect(patterns).toContainEqual(['s','h','i']);
    });

    it('「つ」は "tu" と "tsu" の2パターンを持つ', () => {
      const patterns = getPatternsFor('つ');
      expect(patterns).toContainEqual(['t','u']);
      expect(patterns).toContainEqual(['t','s','u']);
    });

    it('未登録の文字は空配列を返す', () => {
      expect(getPatternsFor('A')).toEqual([]);
    });
  });
});
