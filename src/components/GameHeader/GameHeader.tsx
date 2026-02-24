import type { Level } from '../../types';
import styles from './GameHeader.module.css';

type Props = {
  currentLevel: Level | null;
  moveCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onStageSelect: () => void;
};

export function GameHeader({
  currentLevel,
  moveCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onStageSelect,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.title}>Typinist</div>

      <div className={styles.stageInfo}>
        {currentLevel ? (
          <>
            <div>{currentLevel.name}</div>
            <div className={styles.stageDescription}>
              {currentLevel.description}
            </div>
          </>
        ) : (
          <div>ステージをえらんでね</div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.moveCount}>
          <span className={styles.moveCountLabel}>手数</span>
          <span className={styles.moveCountValue}>{moveCount}</span>
        </div>

        <button
          className={styles.iconButton}
          onClick={onUndo}
          disabled={!canUndo}
          title="もどす (Undo)"
        >
          ↩
        </button>
        <button
          className={styles.iconButton}
          onClick={onRedo}
          disabled={!canRedo}
          title="やりなおし (Redo)"
        >
          ↪
        </button>

        <button className={styles.stageSelectButton} onClick={onStageSelect}>
          ステージ
        </button>
        <button className={styles.resetButton} onClick={onReset}>
          リセット
        </button>
      </div>
    </header>
  );
}
