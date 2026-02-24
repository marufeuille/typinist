import { useState, useEffect, useRef, useMemo } from 'react';
import type { Command, DifficultyMode } from './types';
import { useGameStore, canPickUp, canOpenDoor } from './engine/gameState';
import { COMMANDS, CONTEXT_COMMANDS } from './engine/commands';
import { LEVELS } from './data/levels';
import { GameCanvas } from './components/GameCanvas/GameCanvas';
import type { GameCanvasRef } from './components/GameCanvas/GameCanvas';
import { GameHeader } from './components/GameHeader/GameHeader';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { TypingInput } from './components/TypingInput/TypingInput';
import styles from './App.module.css';

export default function App() {
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [showStageSelect, setShowStageSelect] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('easy');

  const canvasRef = useRef<GameCanvasRef>(null);

  const character = useGameStore((s) => s.character);
  const isCleared = useGameStore((s) => s.isCleared);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const history = useGameStore((s) => s.history);
  const future = useGameStore((s) => s.future);
  const items = useGameStore((s) => s.items);
  const inventory = useGameStore((s) => s.inventory);
  const doors = useGameStore((s) => s.doors);
  const initLevel = useGameStore((s) => s.initLevel);
  const executeAction = useGameStore((s) => s.executeAction);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    initLevel(LEVELS[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 常に全コマンドを表示（レイアウトシフトを防ぐため）
  const allCommands = useMemo(() => [...COMMANDS, ...CONTEXT_COMMANDS], []);

  // 個別にグレーアウトするコマンドのID（やさしいモード: 条件未満のコンテキストコマンド）
  const disabledCommandIds = useMemo(() => {
    if (difficulty !== 'easy') return [];
    const state = useGameStore.getState();
    return CONTEXT_COMMANDS
      .filter(cmd => {
        if (cmd.id === 'pick_up') return !canPickUp(state);
        if (cmd.id === 'open_door') return !canOpenDoor(state);
        return false;
      })
      .map(cmd => cmd.id);
  }, [difficulty, character, items, inventory, doors]);

  // 非表示（スペースは維持）にするコマンドのID（じごくモード: 条件未達のコンテキストコマンド）
  const hiddenCommandIds = useMemo(() => {
    if (difficulty !== 'hard') return [];
    const state = useGameStore.getState();
    return CONTEXT_COMMANDS
      .filter(cmd => {
        if (cmd.id === 'pick_up') return !canPickUp(state);
        if (cmd.id === 'open_door') return !canOpenDoor(state);
        return false;
      })
      .map(cmd => cmd.id);
  }, [difficulty, character, items, inventory, doors]);

  const handleLevelSelect = (index: number) => {
    setCurrentLevelIndex(index);
    initLevel(LEVELS[index]);
    setSelectedCommand(null);
    setShowStageSelect(false);
  };

  const handleReset = () => {
    reset();
    setSelectedCommand(null);
  };

  const handleTypingComplete = (command: Command) => {
    if (isAnimating) return;

    const actionType = command.action.type;

    // pick_up / open_door はアニメーションなし
    if (actionType === 'pick_up' || actionType === 'open_door') {
      executeAction(actionType);
      setSelectedCommand(null);
      return;
    }

    const moveOrTurn = actionType as 'move_forward' | 'turn_right' | 'turn_left';
    const prevChar = { ...character };
    const success = executeAction(moveOrTurn);

    if (success) {
      setIsAnimating(true);
      const nextChar = useGameStore.getState().character;

      if (moveOrTurn === 'move_forward') {
        canvasRef.current?.enqueue({
          type: 'move',
          fromX: prevChar.x,
          fromY: prevChar.y,
          toX: nextChar.x,
          toY: nextChar.y,
          fromDirection: prevChar.direction,
          toDirection: nextChar.direction,
        });
      } else {
        canvasRef.current?.enqueue({
          type: 'turn',
          fromX: prevChar.x,
          fromY: prevChar.y,
          toX: prevChar.x,
          toY: prevChar.y,
          fromDirection: prevChar.direction,
          toDirection: nextChar.direction,
        });
      }
    }

    setSelectedCommand(null);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  const handleUndo = () => {
    if (isAnimating) return;
    undo();
    setSelectedCommand(null);
  };

  const handleRedo = () => {
    if (isAnimating) return;
    redo();
    setSelectedCommand(null);
  };

  const handleNextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex < LEVELS.length) {
      handleLevelSelect(nextIndex);
    } else {
      setShowStageSelect(true);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.gameContainer}>
        <GameHeader
          currentLevel={currentLevel}
          moveCount={history.length}
          canUndo={history.length > 0 && !isAnimating}
          canRedo={future.length > 0 && !isAnimating}
          difficulty={difficulty}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onStageSelect={() => setShowStageSelect(true)}
          onDifficultyChange={setDifficulty}
        />

        <div className={styles.mainArea}>
          <div className={styles.canvasArea}>
            <GameCanvas ref={canvasRef} onAnimationEnd={handleAnimationEnd} />
          </div>

          <CommandPalette
            commands={allCommands}
            selectedCommand={selectedCommand}
            onSelect={setSelectedCommand}
            disabled={isAnimating || isCleared}
            disabledCommandIds={disabledCommandIds}
            hiddenCommandIds={hiddenCommandIds}
          />
        </div>

        <TypingInput
          command={selectedCommand}
          onComplete={handleTypingComplete}
          disabled={isAnimating || isCleared}
        />
      </div>

      {/* ステージ選択モーダル */}
      {showStageSelect && (
        <div
          className={styles.modalOverlay}
          onClick={() => currentLevel && setShowStageSelect(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>ステージをえらんでね</div>
            <div className={styles.levelList}>
              {LEVELS.map((level, index) => (
                <button
                  key={level.id}
                  className={`${styles.levelButton} ${index === currentLevelIndex ? styles.active : ''}`}
                  onClick={() => handleLevelSelect(index)}
                >
                  <div className={styles.levelName}>{level.name}</div>
                  <div className={styles.levelDesc}>{level.description}</div>
                </button>
              ))}
            </div>
            {currentLevel && (
              <button
                className={styles.modalClose}
                onClick={() => setShowStageSelect(false)}
              >
                とじる
              </button>
            )}
          </div>
        </div>
      )}

      {/* クリア画面 */}
      {isCleared && (
        <div className={styles.clearScreen}>
          <div className={styles.clearCard}>
            <div className={styles.clearEmoji}>⭐</div>
            <div className={styles.clearTitle}>クリア！</div>
            <div className={styles.clearMessage}>
              {currentLevel?.name}をクリアしたよ！すごい！
              <br />
              <span className={styles.clearMoveCount}>{history.length}手でクリア</span>
            </div>
            <div className={styles.clearButtons}>
              {currentLevelIndex + 1 < LEVELS.length && (
                <button
                  className={styles.clearButtonNext}
                  onClick={handleNextLevel}
                >
                  つぎのステージへ
                </button>
              )}
              <button
                className={styles.clearButtonRetry}
                onClick={handleReset}
              >
                もういちど
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
