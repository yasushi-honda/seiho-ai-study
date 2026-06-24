# seiho-ai-study

**大阪市生活保護施設連盟 AI活用研修 2026/9/7（月）**
研修テーマ「生活保護受給者・生活困窮者支援の現場を支えるAI活用術 〜伴走支援の時間を作るための業務効率化〜」

会場：なんばスカイオ会議室 / 所要：2時間30分 / 形式：講師主導＋手元スマホで追従

公開URL（予定）: https://yasushi-honda.github.io/seiho-ai-study/

---

## 概要

研修当日は参加者がQRコードからアクセスし、講師の進行に合わせて9トピックの解説・プロンプト集・実践手順を手元のスマートフォンで確認します。研修後も同僚や他施設の方への共有資料として機能するよう、PWA対応でホーム画面追加・オフライン閲覧可。

### 主な機能

- 9トピックのフル教材（説明文・プロンプト集・Before/After・実践ステップ・注意点）
- プロンプトのワンタップコピー
- ChatGPT / Gemini への遷移ボタン（手動ペースト案内付き）
- QRコード表示（同僚への共有用）
- PWAインストール対応（オフライン閲覧可）

## 技術スタック

| レイヤー | 採用 |
|---|---|
| 静的サイトジェネレーター | [Astro](https://astro.build) 7.x |
| CSS | [Tailwind CSS](https://tailwindcss.com) 4.x |
| PWA | [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro) |
| MDX | [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) |
| 言語 | TypeScript（strict） |
| パッケージ管理 | pnpm |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |

## 開発

### 必要環境

- Node.js 22.12.0+
- pnpm 10+

### コマンド

| コマンド | 動作 |
|---|---|
| `pnpm install` | 依存インストール |
| `pnpm dev` | 開発サーバー起動（http://localhost:4321） |
| `pnpm build` | 本番ビルド（`dist/` に出力） |
| `pnpm preview` | ビルド結果をローカルプレビュー |
| `pnpm check` | 型チェック・Astro診断 |

## ディレクトリ構成

```
seiho-ai-study/
├── src/
│   ├── pages/             # 各ページ
│   ├── components/        # 再利用UIコンポーネント
│   ├── content/topics/    # 9トピックMDXファイル
│   ├── scripts/           # クライアントスクリプト
│   └── styles/            # global.css（Tailwind import）
├── public/                # 静的ファイル（アイコン・OG画像等）
├── docs/
│   ├── specs/             # 設計仕様書
│   └── adr/               # 設計判断記録
├── design-mockups/        # 確定モックアップ（HTML、参照用アーカイブ）
└── astro.config.mjs       # Astro設定（site/base/PWA/Tailwind/MDX）
```

## デプロイ

`main` ブランチに push されると GitHub Actions が自動で build → GitHub Pages にデプロイします。

## 設計ドキュメント

- 設計仕様書: [`docs/specs/2026-06-24-seiho-ai-study-design.md`](docs/specs/2026-06-24-seiho-ai-study-design.md)
- モックアップ（採用案A）: [`design-mockups/option-a/`](design-mockups/option-a/)

## ライセンス・免責

本資料は2026年6月時点の情報に基づいて作成しています。AIサービスの仕様は頻繁に変動するため、最新情報は各公式サイトをご確認ください。

研修運営：大阪市生活保護施設連盟 / 講師：yasushi-honda
