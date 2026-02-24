import { getPatternsFor, hiraganaToDefaultRomaji } from './romajiMap';

/**
 * 1文字（ひらがな）の入力状態を管理する
 */
type CharState = {
  hiragana: string;
  patterns: string[][];      // 受け入れ可能なローマ字パターン一覧
  inputBuffer: string[];     // 現在入力済みのキー列
  completed: boolean;
};

/**
 * タイピングエンジン（純粋ロジック）
 * 1コマンド分のひらがな文字列に対して、キー入力を1文字ずつ判定する
 */
export class TypingEngine {
  private chars: CharState[];
  private currentIndex: number;

  constructor(hiragana: string) {
    this.chars = this.buildCharStates(hiragana);
    this.currentIndex = 0;
  }

  private buildCharStates(hiragana: string): CharState[] {
    const charList = Array.from(hiragana);
    return charList.map((char) => ({
      hiragana: char,
      patterns: getPatternsFor(char),
      inputBuffer: [],
      completed: false,
    }));
  }

  /**
   * キー入力を処理する
   * @returns 'correct' | 'wrong' | 'complete'
   */
  processKey(key: string): 'correct' | 'wrong' | 'complete' {
    if (this.isComplete()) return 'complete';

    const char = this.chars[this.currentIndex];
    const candidate = [...char.inputBuffer, key];

    // 「っ」の子音重ね打ち特別処理
    // 次の文字の先頭子音と同じキーを打った場合に「っ」として受け入れる
    if (char.hiragana === 'っ' && char.patterns.every(p => p[0] === 'x' || p[0] === 'l')) {
      const nextChar = this.chars[this.currentIndex + 1];
      if (nextChar) {
        const nextPatterns = nextChar.patterns;
        const isDoubleConsonant = nextPatterns.some(
          (p) => p.length > 0 && p[0] === key && key !== 'a' && key !== 'i' && key !== 'u' && key !== 'e' && key !== 'o'
        );
        if (isDoubleConsonant && char.inputBuffer.length === 0) {
          char.completed = true;
          this.currentIndex++;
          // 同じキーを次の文字に引き継ぐ
          return this.processKey(key);
        }
      }
    }

    // 「ん」の特別処理（次が母音・なし の場合 'nn' が必要、それ以外は 'n' 単体も可）
    if (char.hiragana === 'ん') {
      if (key === 'n' && char.inputBuffer.length === 0) {
        const nextChar = this.chars[this.currentIndex + 1];
        const nextPatterns = nextChar?.patterns ?? [];
        const nextStartsWithVowel = nextPatterns.some((p) =>
          p.length > 0 && ['a', 'i', 'u', 'e', 'o', 'n', 'y'].includes(p[0])
        );
        if (!nextStartsWithVowel) {
          // 'n' 単体で「ん」完了
          char.completed = true;
          this.currentIndex++;
          if (this.isComplete()) return 'complete';
          return 'correct';
        }
      }
    }

    // 通常パターンマッチング
    const matched = this.matchPatterns(char.patterns, candidate);

    if (matched === 'complete') {
      char.inputBuffer = candidate;
      char.completed = true;
      this.currentIndex++;
      if (this.isComplete()) return 'complete';
      return 'correct';
    } else if (matched === 'partial') {
      char.inputBuffer = candidate;
      return 'correct';
    } else {
      return 'wrong';
    }
  }

  private matchPatterns(
    patterns: string[][],
    input: string[]
  ): 'complete' | 'partial' | 'none' {
    let hasPartial = false;
    for (const pattern of patterns) {
      if (pattern.length < input.length) continue;
      const isPrefix = input.every((k, i) => k === pattern[i]);
      if (!isPrefix) continue;
      if (pattern.length === input.length) return 'complete';
      hasPartial = true;
    }
    return hasPartial ? 'partial' : 'none';
  }

  isComplete(): boolean {
    return this.currentIndex >= this.chars.length;
  }

  /**
   * 現在の文字インデックスを返す
   */
  getCurrentCharIndex(): number {
    return this.currentIndex;
  }

  /**
   * 完了文字数を返す（写経ガイド表示用）
   */
  getCompletedCount(): number {
    return this.currentIndex;
  }

  /**
   * 全文字数を返す
   */
  getTotalCount(): number {
    return this.chars.length;
  }

  /**
   * 表示用ローマ字リスト（デフォルトパターン）を返す
   */
  getDisplayRomaji(hiragana: string): string[] {
    return hiraganaToDefaultRomaji(hiragana);
  }

  /**
   * 現在の文字の入力バッファを返す
   */
  getCurrentBuffer(): string[] {
    if (this.isComplete()) return [];
    return this.chars[this.currentIndex].inputBuffer;
  }
}
