import { create } from 'zustand';
import type { Character, Direction, Door, GameState, Item, Level, Position } from '../types';
import { getNextPosition, isInBounds, positionsEqual, rotateLeft, rotateRight } from './grid';

// Undo/Redo 用のスナップショット型
type GameSnapshot = {
  character: Character;
  trail: Position[];
  isCleared: boolean;
  penDown: boolean;
  items: Item[];
  inventory: string[];
  doors: Door[];
};

type GameStore = GameState & {
  currentLevel: Level | null;
  history: GameSnapshot[];
  future: GameSnapshot[];
  // アクション
  initLevel: (level: Level) => void;
  executeAction: (actionType: 'move_forward' | 'turn_right' | 'turn_left' | 'pick_up' | 'unlock_door' | 'open_door') => boolean;
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
  items: [],
  inventory: [],
  doors: [],
};

function snapshot(state: GameState): GameSnapshot {
  return {
    character: { ...state.character },
    trail: [...state.trail],
    isCleared: state.isCleared,
    penDown: state.penDown,
    items: state.items.map(i => ({ ...i, position: { ...i.position } })),
    inventory: [...state.inventory],
    doors: state.doors.map(d => ({ ...d, position: { ...d.position } })),
  };
}

// 現在地にアイテムがあるか判定する
export function canPickUp(state: GameState): boolean {
  const charPos = { x: state.character.x, y: state.character.y };
  return state.items.some(i => positionsEqual(i.position, charPos));
}

// 前方に未開かつ開錠済みの扉があるか判定する
export function canOpenDoor(state: GameState): boolean {
  const next = getNextPosition(state.character.x, state.character.y, state.character.direction);
  const door = state.doors.find(d => !d.isOpen && d.isUnlocked && positionsEqual(d.position, next));
  return door !== undefined;
}

// 前方に未開錠の扉があり、必要アイテムを所持しているか判定する
export function canUnlockDoor(state: GameState): boolean {
  const next = getNextPosition(state.character.x, state.character.y, state.character.direction);
  const door = state.doors.find(d => !d.isOpen && !d.isUnlocked && positionsEqual(d.position, next));
  if (!door) return false;
  return door.requiredItemId !== undefined && state.inventory.includes(door.requiredItemId);
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
    const doors = (level.doors ?? []).map(d => ({
      ...d,
      isOpen: false,
      isUnlocked: d.requiredItemId === undefined,
    }));
    set({
      currentLevel: level,
      character,
      trail,
      gridSize: level.gridSize,
      goal: level.goal,
      obstacles: level.obstacles ?? [],
      isCleared: false,
      penDown: true,
      items: level.items ? level.items.map(i => ({ ...i, position: { ...i.position } })) : [],
      inventory: [],
      doors,
      history: [],
      future: [],
    });
  },

  executeAction: (actionType) => {
    const state = get();
    if (state.isCleared) return false;

    const { character, gridSize, goal, obstacles, trail, penDown, history, items, inventory, doors } = state;

    if (actionType === 'move_forward') {
      const next = getNextPosition(character.x, character.y, character.direction);
      if (!isInBounds(next.x, next.y, gridSize)) return false;
      const isObstacle = obstacles.some((obs) => positionsEqual(obs, next));
      if (isObstacle) return false;
      // 未開の扉もブロック対象
      const blockedByDoor = doors.some(d => !d.isOpen && positionsEqual(d.position, next));
      if (blockedByDoor) return false;

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

    if (actionType === 'pick_up') {
      const charPos = { x: character.x, y: character.y };
      const item = items.find(i => positionsEqual(i.position, charPos));
      if (!item) return false;

      set({
        items: items.filter(i => i.id !== item.id),
        inventory: [...inventory, item.id],
        history: [...history, snapshot(state)],
        future: [],
      });
      return true;
    }

    if (actionType === 'unlock_door') {
      const next = getNextPosition(character.x, character.y, character.direction);
      const door = doors.find(d => !d.isOpen && !d.isUnlocked && positionsEqual(d.position, next));
      if (!door || !door.requiredItemId) return false;
      if (!inventory.includes(door.requiredItemId)) return false;

      set({
        doors: doors.map(d => d.id === door.id ? { ...d, isUnlocked: true } : d),
        history: [...history, snapshot(state)],
        future: [],
      });
      return true;
    }

    if (actionType === 'open_door') {
      const next = getNextPosition(character.x, character.y, character.direction);
      const door = doors.find(d => !d.isOpen && d.isUnlocked && positionsEqual(d.position, next));
      if (!door) return false;

      set({
        doors: doors.map(d => d.id === door.id ? { ...d, isOpen: true } : d),
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
