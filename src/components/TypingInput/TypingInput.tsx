import { useEffect, useRef, useState, useCallback } from 'react';
import type { Command } from '../../types';
import { TypingEngine } from '../../typing/typingEngine';
import { hiraganaToDefaultRomaji } from '../../typing/romajiMap';
import styles from './TypingInput.module.css';

type Props = {
  command: Command | null;
  onComplete: (command: Command) => void;
  disabled?: boolean;
};

type FeedbackState = 'idle' | 'correct' | 'wrong';

export function TypingInput({ command, onComplete, disabled = false }: Props) {
  const engineRef = useRef<TypingEngine | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentBuffer, setCurrentBuffer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [isComplete, setIsComplete] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // コマンドが変わったらエンジンをリセットし、隠し input にフォーカス
  useEffect(() => {
    if (!command) {
      engineRef.current = null;
      setCompletedCount(0);
      setCurrentBuffer([]);
      setFeedback('idle');
      setIsComplete(false);
      return;
    }
    engineRef.current = new TypingEngine(command.hiragana);
    setCompletedCount(0);
    setCurrentBuffer([]);
    setFeedback('idle');
    setIsComplete(false);
    // コマンド選択時に即座にフォーカス
    hiddenInputRef.current?.focus();
  }, [command]);

  // disabled 解除時もフォーカスを戻す
  useEffect(() => {
    if (!disabled && command && !isComplete) {
      hiddenInputRef.current?.focus();
    }
  }, [disabled, command, isComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || !command || !engineRef.current) return;
      if (isComplete) return;

      // 記号・特殊キーを無視
      if (e.key.length !== 1) return;
      e.preventDefault();

      const key = e.key.toLowerCase();
      const result = engineRef.current.processKey(key);

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

      if (result === 'complete') {
        setCompletedCount(engineRef.current.getTotalCount());
        setCurrentBuffer([]);
        setFeedback('correct');
        setIsComplete(true);
        feedbackTimerRef.current = setTimeout(() => {
          onComplete(command);
        }, 300);
      } else if (result === 'correct') {
        setCompletedCount(engineRef.current.getCompletedCount());
        setCurrentBuffer([...engineRef.current.getCurrentBuffer()]);
        setFeedback('correct');
        feedbackTimerRef.current = setTimeout(() => setFeedback('idle'), 150);
      } else {
        setFeedback('wrong');
        feedbackTimerRef.current = setTimeout(() => setFeedback('idle'), 300);
      }
    },
    [command, disabled, isComplete, onComplete]
  );

  return (
    <div className={styles.container}>
      {/* ブラウザ拡張のキー横取りを防ぐための隠し入力欄 */}
      <input
        ref={hiddenInputRef}
        className={styles.hiddenInput}
        onKeyDown={handleKeyDown}
        readOnly
        aria-hidden="true"
        tabIndex={command && !disabled ? 0 : -1}
      />

      {!command ? (
        <div className={styles.empty}>← コマンドをえらんでね</div>
      ) : (
        <>
          <div className={styles.targetHiragana}>{command.hiragana}</div>

          <div className={styles.romajiGuide}>
            {(() => {
              const displayRomaji = hiraganaToDefaultRomaji(command.hiragana);
              // 完了済みひらがな分のローマ字数 + 現在の文字で打ち終えたキー数
              const doneCount = countCompletedRomaji(command.hiragana, completedCount)
                + currentBuffer.length;
              return displayRomaji.map((char, idx) => {
                let cls = styles.romajiChar;
                if (idx < doneCount) cls += ' ' + styles.done;
                else if (idx === doneCount) cls += ' ' + styles.current;
                return (
                  <span key={idx} className={cls}>
                    {char}
                  </span>
                );
              });
            })()}
          </div>

          <div className={styles.inputArea}>
            <span className={styles.inputLabel}>にゅうりょく:</span>
            <div className={styles.inputDisplay}>
              {currentBuffer.map((ch, idx) => (
                <span key={idx} className={styles.inputChar}>{ch}</span>
              ))}
              {!isComplete && <span className={styles.cursor} />}
            </div>
          </div>

          {feedback === 'wrong' && (
            <div className={`${styles.feedback} ${styles.feedbackWrong}`}>
              ちがうよ！もういちど
            </div>
          )}
          {isComplete && (
            <div className={styles.completeMessage}>OK！</div>
          )}
        </>
      )}
    </div>
  );
}

function countCompletedRomaji(hiragana: string, charCount: number): number {
  const chars = Array.from(hiragana).slice(0, charCount);
  return hiraganaToDefaultRomaji(chars.join('')).length;
}
