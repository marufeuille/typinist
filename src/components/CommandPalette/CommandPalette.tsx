import type { Command } from '../../types';
import styles from './CommandPalette.module.css';

const COMMAND_ICONS: Record<string, string> = {
  move_forward: '▶',
  turn_right: '↷',
  turn_left: '↶',
  pen_up: '✏️↑',
  pen_down: '✏️↓',
  pick_up: '🪙',
  open_door: '🚪',
};

type Props = {
  commands: Command[];
  selectedCommand: Command | null;
  onSelect: (command: Command) => void;
  disabled?: boolean;              // 全体グレーアウト
  disabledCommandIds?: string[];   // 個別グレーアウト
  hiddenCommandIds?: string[];     // 非表示だがスペースは維持（じごくモードで未解放のコマンド）
};

export function CommandPalette({
  commands,
  selectedCommand,
  onSelect,
  disabled = false,
  disabledCommandIds = [],
  hiddenCommandIds = [],
}: Props) {
  return (
    <div className={styles.palette}>
      <div className={styles.title}>コマンド一覧</div>
      <div className={styles.commandList}>
        {commands.map((cmd) => {
          const isIndividuallyDisabled = disabledCommandIds.includes(cmd.id);
          const isHidden = hiddenCommandIds.includes(cmd.id);
          const isDisabled = disabled || isIndividuallyDisabled;

          let className = styles.commandButton;
          if (selectedCommand?.id === cmd.id) className += ' ' + styles.selected;
          if (isDisabled) className += ' ' + styles.disabled;
          if (isHidden) className += ' ' + styles.hidden;

          return (
            <button
              key={cmd.id}
              className={className}
              onClick={() => !isDisabled && !isHidden && onSelect(cmd)}
              disabled={isDisabled || isHidden}
              aria-hidden={isHidden}
            >
              <span className={styles.commandIcon}>
                {COMMAND_ICONS[cmd.id] ?? '▶'}
              </span>
              <span className={styles.commandLabel}>{cmd.label}</span>
              <span className={styles.commandRomaji}>{cmd.romaji}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
