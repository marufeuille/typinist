import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, canPickUp, canOpenDoor } from '../engine/gameState';
import type { Level } from '../types';

const SAMPLE_LEVEL: Level = {
  id: 1,
  name: 'テスト',
  description: 'テスト用レベル',
  gridSize: 5,
  start: { x: 0, y: 4, direction: 'right' },
  goal: { x: 4, y: 4 },
};

describe('gameState store', () => {
  beforeEach(() => {
    useGameStore.getState().initLevel(SAMPLE_LEVEL);
  });

  describe('initLevel', () => {
    it('キャラクターがstart位置に配置される', () => {
      const { character } = useGameStore.getState();
      expect(character.x).toBe(0);
      expect(character.y).toBe(4);
      expect(character.direction).toBe('right');
    });

    it('isCleared が false に初期化される', () => {
      expect(useGameStore.getState().isCleared).toBe(false);
    });

    it('items・inventory・doors が空で初期化される', () => {
      const state = useGameStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.inventory).toHaveLength(0);
      expect(state.doors).toHaveLength(0);
    });

    it('レベルにアイテムがある場合は正しく初期化される', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        items: [{ id: 'key', label: 'かぎ', position: { x: 2, y: 4 } }],
      });
      const { items } = useGameStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('key');
    });

    it('レベルに扉がある場合は isOpen: false で初期化される', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        doors: [{ id: 'door-1', position: { x: 4, y: 2 }, requiredItemId: 'key' }],
      });
      const { doors } = useGameStore.getState();
      expect(doors).toHaveLength(1);
      expect(doors[0].isOpen).toBe(false);
    });
  });

  describe('move_forward', () => {
    it('右向きで1マス右に進む', () => {
      useGameStore.getState().executeAction('move_forward');
      const { character } = useGameStore.getState();
      expect(character.x).toBe(1);
      expect(character.y).toBe(4);
    });

    it('グリッド端での移動は失敗する', () => {
      // 左端(x=0)で左向きは移動失敗
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 2, direction: 'left' },
      });
      const result = useGameStore.getState().executeAction('move_forward');
      expect(result).toBe(false);
      expect(useGameStore.getState().character.x).toBe(0);
    });

    it('ゴールに到達すると isCleared が true になる', () => {
      // x=0 から right向きで4回移動するとゴール(x=4)
      for (let i = 0; i < 4; i++) {
        useGameStore.getState().executeAction('move_forward');
      }
      expect(useGameStore.getState().isCleared).toBe(true);
    });

    it('未開の扉は move_forward をブロックする', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 4, direction: 'right' },
        doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
      });
      const result = useGameStore.getState().executeAction('move_forward');
      expect(result).toBe(false);
      expect(useGameStore.getState().character.x).toBe(0);
    });

    it('開いた扉は move_forward をブロックしない', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 4, direction: 'right' },
        items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
        doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
      });
      useGameStore.getState().executeAction('pick_up');   // 鍵を拾う
      useGameStore.getState().executeAction('open_door'); // 扉を開ける
      const result = useGameStore.getState().executeAction('move_forward');
      expect(result).toBe(true);
      expect(useGameStore.getState().character.x).toBe(1);
    });
  });

  describe('turn_right', () => {
    it('右回転で向きが変わる', () => {
      useGameStore.getState().executeAction('turn_right');
      expect(useGameStore.getState().character.direction).toBe('down');
    });
  });

  describe('turn_left', () => {
    it('左回転で向きが変わる', () => {
      useGameStore.getState().executeAction('turn_left');
      expect(useGameStore.getState().character.direction).toBe('up');
    });
  });

  describe('pick_up', () => {
    const LEVEL_WITH_ITEM: Level = {
      ...SAMPLE_LEVEL,
      items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
    };

    beforeEach(() => {
      useGameStore.getState().initLevel(LEVEL_WITH_ITEM);
    });

    it('現在地にアイテムがある場合、pick_up でインベントリに追加される', () => {
      const result = useGameStore.getState().executeAction('pick_up');
      expect(result).toBe(true);
      expect(useGameStore.getState().inventory).toContain('key');
    });

    it('pick_up 後にアイテムがマップから消える', () => {
      useGameStore.getState().executeAction('pick_up');
      expect(useGameStore.getState().items).toHaveLength(0);
    });

    it('アイテムのないマスで pick_up は失敗する', () => {
      useGameStore.getState().executeAction('move_forward'); // (1, 4) に移動（アイテムなし）
      const result = useGameStore.getState().executeAction('pick_up');
      expect(result).toBe(false);
    });

    it('pick_up を undo するとアイテムが戻る', () => {
      useGameStore.getState().executeAction('pick_up');
      expect(useGameStore.getState().inventory).toContain('key');
      useGameStore.getState().undo();
      expect(useGameStore.getState().inventory).not.toContain('key');
      expect(useGameStore.getState().items).toHaveLength(1);
    });
  });

  describe('open_door', () => {
    const LEVEL_WITH_DOOR: Level = {
      ...SAMPLE_LEVEL,
      start: { x: 0, y: 4, direction: 'right' },
      items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
      doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
    };

    beforeEach(() => {
      useGameStore.getState().initLevel(LEVEL_WITH_DOOR);
    });

    it('前方に扉があり必要アイテムを持っている場合、open_door は成功する', () => {
      useGameStore.getState().executeAction('pick_up');
      const result = useGameStore.getState().executeAction('open_door');
      expect(result).toBe(true);
      expect(useGameStore.getState().doors[0].isOpen).toBe(true);
    });

    it('アイテムがない場合、open_door は失敗する', () => {
      const result = useGameStore.getState().executeAction('open_door');
      expect(result).toBe(false);
      expect(useGameStore.getState().doors[0].isOpen).toBe(false);
    });

    it('扉のない方向では open_door は失敗する', () => {
      useGameStore.getState().executeAction('pick_up');
      useGameStore.getState().executeAction('turn_left'); // 上向きに変更
      const result = useGameStore.getState().executeAction('open_door');
      expect(result).toBe(false);
    });

    it('open_door 後に扉が開いてキャラが通れる', () => {
      useGameStore.getState().executeAction('pick_up');
      useGameStore.getState().executeAction('open_door');
      const result = useGameStore.getState().executeAction('move_forward');
      expect(result).toBe(true);
      expect(useGameStore.getState().character.x).toBe(1);
    });

    it('open_door を undo すると扉が閉じる', () => {
      useGameStore.getState().executeAction('pick_up');
      useGameStore.getState().executeAction('open_door');
      expect(useGameStore.getState().doors[0].isOpen).toBe(true);
      useGameStore.getState().undo();
      expect(useGameStore.getState().doors[0].isOpen).toBe(false);
    });
  });

  describe('canPickUp', () => {
    it('現在地にアイテムがある場合 true を返す', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
      });
      expect(canPickUp(useGameStore.getState())).toBe(true);
    });

    it('現在地にアイテムがない場合 false を返す', () => {
      expect(canPickUp(useGameStore.getState())).toBe(false);
    });
  });

  describe('canOpenDoor', () => {
    it('前方に未開の扉があり必要アイテムを所持している場合 true を返す', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 4, direction: 'right' },
        items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
        doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
      });
      useGameStore.getState().executeAction('pick_up');
      expect(canOpenDoor(useGameStore.getState())).toBe(true);
    });

    it('アイテムを所持していない場合 false を返す', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 4, direction: 'right' },
        doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
      });
      expect(canOpenDoor(useGameStore.getState())).toBe(false);
    });

    it('前方に扉がない場合 false を返す', () => {
      expect(canOpenDoor(useGameStore.getState())).toBe(false);
    });
  });

  describe('reset', () => {
    it('resetでstart位置に戻る', () => {
      useGameStore.getState().executeAction('move_forward');
      useGameStore.getState().reset();
      const { character } = useGameStore.getState();
      expect(character.x).toBe(0);
      expect(character.y).toBe(4);
    });

    it('resetでisCleared が false になる', () => {
      for (let i = 0; i < 4; i++) {
        useGameStore.getState().executeAction('move_forward');
      }
      expect(useGameStore.getState().isCleared).toBe(true);
      useGameStore.getState().reset();
      expect(useGameStore.getState().isCleared).toBe(false);
    });

    it('reset でアイテム・インベントリ・扉が初期状態に戻る', () => {
      useGameStore.getState().initLevel({
        ...SAMPLE_LEVEL,
        start: { x: 0, y: 4, direction: 'right' },
        items: [{ id: 'key', label: 'かぎ', position: { x: 0, y: 4 } }],
        doors: [{ id: 'door-1', position: { x: 1, y: 4 }, requiredItemId: 'key' }],
      });
      useGameStore.getState().executeAction('pick_up');
      useGameStore.getState().executeAction('open_door');
      useGameStore.getState().reset();

      const state = useGameStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.inventory).toHaveLength(0);
      expect(state.doors[0].isOpen).toBe(false);
    });
  });

  describe('軌跡 (trail)', () => {
    it('移動するたびに軌跡が追加される', () => {
      useGameStore.getState().executeAction('move_forward');
      const { trail } = useGameStore.getState();
      expect(trail.length).toBe(2); // 開始点 + 移動先
    });

    it('回転しても軌跡は増えない', () => {
      const before = useGameStore.getState().trail.length;
      useGameStore.getState().executeAction('turn_right');
      const after = useGameStore.getState().trail.length;
      expect(after).toBe(before);
    });
  });

  describe('Stage 7 シナリオテスト', () => {
    const STAGE7_LEVEL: Level = {
      id: 7,
      name: 'ステージ 7',
      description: 'かぎをひろって とびらをひらこう！',
      gridSize: 5,
      start: { x: 0, y: 4, direction: 'right' },
      goal: { x: 4, y: 0 },
      obstacles: [
        { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
      ],
      items: [{ id: 'key', label: 'かぎ', position: { x: 3, y: 4 } }],
      doors: [{ id: 'door-1', position: { x: 4, y: 2 }, requiredItemId: 'key' }],
    };

    beforeEach(() => {
      useGameStore.getState().initLevel(STAGE7_LEVEL);
    });

    it('推奨コマンド通りに実行するとクリアできる', () => {
      const store = useGameStore.getState();
      store.executeAction('move_forward'); // (1,4)
      store.executeAction('move_forward'); // (2,4)
      store.executeAction('move_forward'); // (3,4)
      store.executeAction('pick_up');      // key を拾う
      store.executeAction('move_forward'); // (4,4)
      store.executeAction('turn_left');    // 上向き
      store.executeAction('move_forward'); // (4,3)
      store.executeAction('open_door');    // 扉を開ける
      store.executeAction('move_forward'); // (4,2)
      store.executeAction('move_forward'); // (4,1)
      store.executeAction('move_forward'); // (4,0) = ゴール

      expect(useGameStore.getState().isCleared).toBe(true);
    });

    it('アイテムなしでは扉をすり抜けられない', () => {
      const store = useGameStore.getState();
      store.executeAction('move_forward'); // (1,4)
      store.executeAction('move_forward'); // (2,4)
      store.executeAction('move_forward'); // (3,4) - アイテム未取得でスキップ
      store.executeAction('move_forward'); // (4,4)
      store.executeAction('turn_left');    // 上向き
      store.executeAction('move_forward'); // (4,3)
      const blocked = store.executeAction('move_forward'); // (4,2) = 扉でブロック
      expect(blocked).toBe(false);
      expect(useGameStore.getState().character.y).toBe(3);
      expect(useGameStore.getState().isCleared).toBe(false);
    });
  });
});
