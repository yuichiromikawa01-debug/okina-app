# Okina PWA Demo

スマホ向けの Okina デモ（電子書籍 × AIチャット、Musicアプリ風UI）。

## 起動

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) — スマホ実機またはブラウザのモバイル表示で確認。デスクトップでは 390px 幅の中央カード表示になります。

## 画像の追加

`IMAGE_CHECKLIST.md` に必要なパス一覧があります。`public/collections/` と `public/works/` に画像を置くとリロードで反映されます。未配置時は紙色＋タイトルのフォールバックが表示されます。

## 画面

- `/` — ホーム（コレクション・本・チャット）
- `/collections/[id]` — コレクション詳細
- `/chat/[threadId]` — チャット
- `/library` — ライブラリ
