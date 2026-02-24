# CLAUDE.md - Typinist 開発ガイドライン

このファイルは Claude Code がプロジェクトを理解・開発するための方針を定義する。

---

## プロジェクト概要

小学生（8〜9歳）向けのローマ字タイピング × プログラミング導入 Web アプリ。
グリッド上のキャラクターをローマ字コマンドで操作してゴールへ導く。
詳細は `docs/requirements.md`・`docs/technical-spec.md` を参照。

---

## 技術スタック

- **React 19 + TypeScript**（フレームワーク）
- **Vite**（ビルドツール）
- **Zustand**（状態管理）
- **CSS Modules**（スタイリング）
- **HTML5 Canvas raw**（描画。ライブラリは使わない）
- **Vitest + jsdom**（テスト）

---

## ブランチ・コミット運用

- **main に直接 push**する（PR・レビューフローなし）
- コミットメッセージは `feat:` / `fix:` / `refactor:` / `test:` / `docs:` のプレフィックスを使う
- 1コミットは1つの論理的な変更にまとめる

---

## 実装スタイル

- **大きな変更・新機能は必ずプランを提示してユーザー確認を取ってから実装する**
- 小さなバグ修正や明らかな1行変更はその限りでない
- 実装範囲は「現在の要件に必要な最小限」にとどめる（YAGNI）
- 将来のステップ（Step 2 以降）を先読みした設計はしない

---

## コーディング規約

### 全般
- `any` 型は使わない。型推論で解決できない場合のみ明示的な型を書く
- `console.log` をコミットに含めない
- コメントは「なぜそうしたか」だけ書く。「何をしているか」はコードから読める場合は書かない

### React コンポーネント
- 関数コンポーネントのみ（クラスコンポーネント禁止）
- props の型は `type Props = { ... }` としてコンポーネントの直上に定義する
- コンポーネントファイルは `ComponentName/ComponentName.tsx` + `ComponentName.module.css` のペアで作る

### 状態管理
- UI ローカルな状態は `useState`、ゲームロジックに関わる状態は Zustand store に置く
- Zustand store は `src/engine/gameState.ts` に集約する
- store の外から直接 `set` は呼ばない。必ずアクション関数を経由する

### CSS
- CSS Modules のみ使う（グローバル CSS・インラインスタイル・Tailwind 等は使わない）
- クラス名はキャメルケース（例: `styles.commandButton`）

### Canvas 描画
- 描画ロジックは `renderer.ts` に純関数として切り出す
- `GameCanvas.tsx` は Canvas 要素のマウントと `useEffect` による描画呼び出しのみ担当する
- Canvas に直接アクセスする処理をコンポーネント外に書かない

---

## テスト方針

- **できる限り広くテストを書く**
- テスト対象の優先順位:
  1. `src/engine/` 配下のゲームロジック（必須）
  2. `src/typing/` 配下のタイピングエンジン（必須）
  3. `src/components/` のインタラクション（余裕があれば）
- テストファイルは `src/test/*.test.ts` に置く
- 新機能追加・バグ修正の際は対応するテストも同時に追加・修正する
- `npm run test` が通らない状態でコミットしない

---

## ファイル構成の原則

```
src/
├── components/   # UI コンポーネント（表示責務のみ）
├── engine/       # ゲームロジック・状態管理（副作用なし or Zustand）
├── typing/       # タイピングエンジン（純ロジック）
├── data/         # 静的データ（レベル定義など）
└── types/        # 共通型定義
```

- `components/` は `engine/` や `typing/` に依存してよい
- `engine/` と `typing/` は互いに依存しない
- `types/` はどこからでも import してよい

---

## やってはいけないこと

- `node_modules` や `dist` を git に含める
- `.claude/` を git に含める（`.gitignore` で除外済み）
- UI ライブラリ（MUI・Ant Design 等）の追加（Canvas + CSS Modules で完結させる）
- Canvas 描画に外部ライブラリを使う
- 将来ステップの機能を現在のスコープで先行実装する
