import type { Command, GameAction } from '../types';

/**
 * 基本コマンド定義（全ステージで使用）
 */
export const COMMANDS: Command[] = [
  {
    id: 'move_forward',
    label: 'まえにすすむ',
    hiragana: 'まえにすすむ',
    romaji: 'maenisusuumu',
    action: { type: 'move_forward' },
  },
  {
    id: 'turn_right',
    label: 'みぎをむく',
    hiragana: 'みぎをむく',
    romaji: 'migiwomuku',
    action: { type: 'turn_right' },
  },
  {
    id: 'turn_left',
    label: 'ひだりをむく',
    hiragana: 'ひだりをむく',
    romaji: 'hidariwomuku',
    action: { type: 'turn_left' },
  },
];

/**
 * コンテキストコマンド定義（条件が揃ったときのみ有効）
 */
export const CONTEXT_COMMANDS: Command[] = [
  {
    id: 'pick_up',
    label: 'ひろう',
    hiragana: 'ひろう',
    romaji: 'hirou',
    action: { type: 'pick_up' },
  },
  {
    id: 'unlock_door',
    label: 'かぎをひらく',
    hiragana: 'かぎをひらく',
    romaji: 'kagiwohiraku',
    action: { type: 'unlock_door' },
  },
  {
    id: 'open_door',
    label: 'とびらをひらく',
    hiragana: 'とびらをひらく',
    romaji: 'tobiraohiraku',
    action: { type: 'open_door' },
  },
];

export const ALL_COMMANDS: Command[] = [...COMMANDS, ...CONTEXT_COMMANDS];

/**
 * コマンドIDからコマンドを取得する
 */
export function getCommandById(id: string): Command | undefined {
  return ALL_COMMANDS.find((cmd) => cmd.id === id);
}

/**
 * アクションの種類の説明文を返す（デバッグ用）
 */
export function describeAction(action: GameAction): string {
  switch (action.type) {
    case 'move_forward': return '前に進む';
    case 'turn_right':   return '右を向く';
    case 'turn_left':    return '左を向く';
    case 'pen_up':       return 'ペンを上げる';
    case 'pen_down':     return 'ペンを下げる';
    case 'pick_up':      return 'アイテムを拾う';
    case 'unlock_door':  return '扉を開錠する';
    case 'open_door':    return '扉を開ける';
  }
}
