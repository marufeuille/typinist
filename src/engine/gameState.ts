import { create } from 'zustand';
import type { Character, Direction, GameState, Level, Position } from '../types';
import { getNextPosition, isInBounds, positionsEqual, rotateLeft, rotateRight } from './grid';

// Undo/Redo 用のスナップショット型
type GameSnapshot = {
  character: Character;
  trail: Position[];
  isCleared: boolean;
  penDown: boolean;
};

type GameStore = GameState & {
  currentLevel: Level | null;
  history: GameSnapshot[];
  future: GameSnapshot[];
  // アクション
  initLevel: (level: Level) => void;
  executeAction: (actionType: 'move_forward' | 'turn_right' | 'turn_left') => boolean;
  undo: () => boolean;
  redo: () => boolean;
  reset: () => void;
};

const DEFAULT_STATE: GameState = {
  character: { x: 0, y: 0, direction: 'right' },
  trail: [],
  gridSize: 5,
  goal: { x: 4, y: 4 },
  obstacles: [],
  isCleared: false,
  penDown: false,
};

function snapshot(state: GameState): GameSnapshot {
  return {
    character: { ...state.character },
    trail: [...state.trail],
    isCleared: state.isCleared,
    penDown: state.penDown,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_STATE,
  currentLevel: null,
  history: [],
  future: [],

  initLevel: (level: Level) => {
    const character: Character = {
      x: level.start.x,
      y: level.start.y,
      direction: level.start.direction as Direction,
    };
    const trail: Position[] = [{ x: character.x, y: character.y }];
    set({
      currentLevel: level,
      character,
      trail,
      gridSize: level.gridSize,
      goal: level.goal,
      obstacles: level.obstacles ?? [],
      isCleared: false,
      penDown: true,
      history: [],
      future: [],
    });
  },

  executeAction: (actionType) => {
    const state = get();
    if (state.isCleared) return false;

    const { character, gridSize, goal, obstacles, trail, penDown, history } = state;

    if (actionType === 'move_forward') {
      const next = getNextPosition(character.x, character.y, character.direction);
      if (!isInBounds(next.x, next.y, gridSize)) return false;
      const isObstacle = obstacles.some((obs) => positionsEqual(obs, next));
      if (isObstacle) return false;

      const newTrail = penDown ? [...trail, { x: next.x, y: next.y }] : trail;
      const isCleared = positionsEqual(next, goal);

      set({
        character: { ...character, x: next.x, y: next.y },
        trail: newTrail,
        isCleared,
        history: [...history, snapshot(state)],
        future: [],
      });
      return true;
    }

    if (actionType === 'turn_right') {
      set({
        character: { ...character, direction: rotateRight(character.direction) },
        history: [...history, snapshot(state)],
        future: [],
      });
      return true;
    }

    if (actionType === 'turn_left') {
      set({
        character: { ...character, direction: rotateLeft(character.direction) },
        history: [...history, snapshot(state)],
        future: [],
      });
      return true;
    }

    return false;
  },

  undo: () => {
    const state = get();
    if (state.history.length === 0) return false;

    const prev = state.history[state.history.length - 1];
    set({
      ...prev,
      history: state.history.slice(0, -1),
      future: [snapshot(state), ...state.future],
    });
    return true;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return false;

    const next = state.future[0];
    set({
      ...next,
      history: [...state.history, snapshot(state)],
      future: state.future.slice(1),
    });
    return true;
  },

  reset: () => {
    const { currentLevel } = get();
    if (currentLevel) {
      get().initLevel(currentLevel);
    } else {
      set({ ...DEFAULT_STATE, history: [], future: [] });
    }
  },
}));
