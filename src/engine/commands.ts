import type { Command, GameAction } from '../types';

/**
 * Step 1 MVPで使用するコマンド定義
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
 * コマンドIDからコマンドを取得する
 */
export function getCommandById(id: string): Command | undefined {
  return COMMANDS.find((cmd) => cmd.id === id);
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
  }
}
