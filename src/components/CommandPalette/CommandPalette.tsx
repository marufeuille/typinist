import type { Command } from '../../types';
import styles from './CommandPalette.module.css';

const COMMAND_ICONS: Record<string, string> = {
  move_forward: '▶',
  turn_right: '↷',
  turn_left: '↶',
  pen_up: '✏️↑',
  pen_down: '✏️↓',
};

type Props = {
  commands: Command[];
  selectedCommand: Command | null;
  onSelect: (command: Command) => void;
  disabled?: boolean;
};

export function CommandPalette({
  commands,
  selectedCommand,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <div className={styles.palette}>
      <div className={styles.title}>コマンド一覧</div>
      <div className={styles.commandList}>
        {commands.map((cmd) => {
          let className = styles.commandButton;
          if (selectedCommand?.id === cmd.id) className += ' ' + styles.selected;
          if (disabled) className += ' ' + styles.disabled;

          return (
            <button
              key={cmd.id}
              className={className}
              onClick={() => !disabled && onSelect(cmd)}
              disabled={disabled}
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
