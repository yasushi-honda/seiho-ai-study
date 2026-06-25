# seiho-ai-study 設計仕様書

- **作成日**: 2026-06-24
- **対象研修**: 2026-09-07（月）14:00-16:30
- **主催**: 大阪市生活保護施設連盟
- **会場**: なんばスカイオ会議室
- **講師**: yasushi-honda（本田氏）

---

## 1. 概要

大阪市生活保護施設連盟向けに開催されるAI活用研修（2時間30分）の参加者用Webアプリ。スマートフォン経由でQRコードからアクセスし、講師が研修中に「N番のトピックを開いてください」と誘導しながら、参加者が手元で同期して内容を確認・実践できる。研修後は同僚や他施設の方への共有資料として機能する。

### 1.1 動機

- 紙資料の配布コスト・更新コストを削減
- 研修中に参加者がプロンプトをコピー → ChatGPT/Geminiで即試せる体験
- 研修後の参照リソースとして同僚にも展開できる「持続的価値」のある資料
- 生活保護分野の現場知識とAI活用テクニックを橋渡し

### 1.2 対象ユーザー

- 大阪市生活保護施設連盟所属の施設職員
- AIを個人利用で触ったことがあるレベル（初級と中級の間）
- スマートフォン操作に慣れている世代と、シニア世代が混在
- 30〜50名規模を想定

---

## 2. 要件

### 2.1 機能要件

| 機能 | 必須 | 説明 |
|---|---|---|
| トップページ | ✓ | ヒーロー、タイムテーブル、9トピックカード、QRコード |
| 9トピック詳細ページ | ✓ | 各トピック独立ページ、章立て構成 |
| プロンプトコピー機能 | ✓ | クリップボードAPIでワンタップコピー、トースト通知 |
| ChatGPT遷移ボタン | ✓ | コピー + `chatgpt.com/?q=`遷移 |
| Gemini遷移ボタン | ✓ | コピー + `gemini.google.com/app`遷移 + 手動ペースト案内 |
| QRコード表示 | ✓ | トップページに自サイトURLのQR |
| タイムテーブル | ✓ | トップに当日進行表 |
| FAQセクション | ✓ | 独立ページ |
| フィードバックフォーム | ✓ | Googleフォームへの外部リンク（フォームURLは別途準備） |
| 参考リンク集 | ✓ | 公式ドキュメント・他事例・NotebookLM紹介リンク |
| Credits | ✓ | 免責事項・作成日・参考文献 |
| PWA対応 | ✓ | manifest.json + Service Worker、ホーム画面追加可、オフライン閲覧可 |

### 2.2 非機能要件

| 観点 | 要件 |
|---|---|
| デバイス | スマホ（375px〜）優先、デスクトップ（〜1280px）も崩れない |
| 表示速度 | 初回ロード 3秒以内（モバイル4G想定） |
| アクセシビリティ | WCAG 2.1 AA準拠を目標。タッチターゲット最低44x44px、コントラスト比4.5:1以上 |
| フォントサイズ | 本文最小16px、シニア参加者も読める行間1.7以上 |
| ブラウザ対応 | iOS Safari 16+, Android Chrome 110+, モダンデスクトップブラウザ |
| 個人情報 | アプリ内で参加者の個人情報を一切扱わない（フォームはGoogleフォーム外部委譲） |
| 静的配信 | バックエンド不要、GitHub Pagesで配信 |

### 2.3 デザイン要件

- **方向**: 案A採用（温かみ重視、ベージュ・青緑・柔らかい色面）
- **配色トークン**: モックアップ `design-mockups/option-a/` のCSS変数を踏襲
  - bg: `#F8F2E4`（ベージュ）
  - accent-1: `#5C8B89`（くすみ青緑）
  - accent-2: `#C97A4F`（テラコッタ）
- **タイポグラフィ**: 見出し Klee One、本文 Zen Maru Gothic
- **角丸**: rounded-lg / rounded-xl 多用
- **装飾**: 有機的な形状の背景装飾（円形・楕円）、手書き感アイコン

---

## 3. アーキテクチャ

### 3.1 技術スタック

| レイヤー | 採用 | 理由 |
|---|---|---|
| 静的サイトジェネレーター | **Astro 5.x** | コンテンツ重視、ゼロJS by default、MDX対応、PWA連携容易 |
| CSSフレームワーク | **Tailwind CSS 4** | 設計トークンの一元管理、レスポンシブ実装の確実性 |
| 言語 | TypeScript | 型安全 |
| パッケージマネージャ | pnpm | 高速・省ディスク |
| PWA | @vite-pwa/astro | Service Worker + manifest 自動生成 |
| QRコード生成 | qrcode（ビルド時生成） | 静的SVG出力でランタイム依存ゼロ |
| ホスティング | GitHub Pages | publicリポジトリで無料、Actionsで自動デプロイ |
| デプロイ | GitHub Actions | mainへのpushで自動デプロイ |

### 3.2 ディレクトリ構造

```
seiho-ai-study/
├── astro.config.mjs           ← Astro設定（site URL, base path, integrations）
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── icon-192.png           ← PWA icon
│   ├── icon-512.png
│   └── og-image.png
├── src/
│   ├── content/
│   │   ├── config.ts          ← Content Collection スキーマ
│   │   └── topics/
│   │       ├── 01-case-studies.mdx
│   │       ├── 02-writing.mdx
│   │       ├── 03-transcription.mdx
│   │       ├── 04-report.mdx
│   │       ├── 05-legal-search.mdx
│   │       ├── 06-knowledge-base.mdx
│   │       ├── 07-privacy.mdx
│   │       ├── 08-settings.mdx
│   │       └── 09-governance.mdx
│   ├── components/
│   │   ├── Layout.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── TopicCard.astro
│   │   ├── Timetable.astro
│   │   ├── PromptCard.astro    ← コピー+遷移ボタン付き
│   │   ├── BeforeAfter.astro
│   │   ├── Steps.astro
│   │   ├── Caution.astro
│   │   ├── QRDisplay.astro     ← ビルド時SVG生成
│   │   └── Toast.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── topics/[slug].astro ← 動的ルーティング
│   │   ├── faq.astro
│   │   ├── resources.astro
│   │   └── credits.astro
│   ├── scripts/
│   │   └── copyAndOpen.ts      ← クリップボード+遷移ロジック
│   └── styles/
│       └── global.css          ← Tailwind導入 + CSS変数
├── docs/
│   ├── specs/                  ← 本仕様書を含む設計文書
│   └── adr/                    ← 設計判断記録
├── design-mockups/             ← 確定モックアップ（HTML、アーカイブ）
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Pagesデプロイ
└── README.md
```

### 3.3 ページマップ

| URL | コンテンツ |
|---|---|
| `/` | トップ（ヒーロー、タイムテーブル、9トピックカード、QR、CTAリンク） |
| `/topics/01-case-studies` | トピック1：福祉業界のAI活用先進事例 |
| `/topics/02-writing` | トピック2：わかりやすい案内文・マニュアル作成 |
| `/topics/03-transcription` | トピック3：音声から議事録を作る |
| `/topics/04-report` | トピック4：架空ケース記録→規定様式の報告書 |
| `/topics/05-legal-search` | トピック5：法令データから瞬時に検索 |
| `/topics/06-knowledge-base` | トピック6：施設内マニュアル・事例集の検索基盤 |
| `/topics/07-privacy` | トピック7：入れていいデータ／ダメなデータ |
| `/topics/08-settings` | トピック8：データ学習オフ設定と法人契約 |
| `/topics/09-governance` | トピック9：施設内ガイドラインの作り方 |
| `/faq` | よくある質問 |
| `/resources` | 参考リンク集 |
| `/credits` | 免責事項・参考文献・作成情報 |

---

## 4. データモデル

### 4.1 Content Collection スキーマ（`src/content/config.ts`）

```typescript
import { defineCollection, z } from 'astro:content';

const topics = defineCollection({
  type: 'content',
  schema: z.object({
    order: z.number().int().min(1).max(9),
    title: z.string(),
    category: z.string(),                  // "Case Studies", "Writing"等の英語ラベル
    icon: z.string(),                      // 絵文字（例: "🎙️"）
    summary: z.string(),                   // 1行説明
    lead: z.string(),                      // トピックページLead文（2-3行）
    estimatedMinutes: z.number().optional(),
  }),
});

export const collections = { topics };
```

### 4.2 各トピックMDXファイルの構造

```markdown
---
order: 3
title: "音声から議事録を作る"
category: "Transcription"
icon: "🎙️"
summary: "録音→自動文字起こし→要約までの最短ルート"
lead: "支援会議・カンファレンスの録音を、AIで「文字起こし→要約→決定事項リスト」まで一気に整える。"
estimatedMinutes: 15
---

import PromptCard from '@/components/PromptCard.astro';
import BeforeAfter from '@/components/BeforeAfter.astro';
import Steps from '@/components/Steps.astro';
import Caution from '@/components/Caution.astro';

## このトピックでわかること
（章立ての本文。Markdown）

## なぜAIで効率化できるのか
（本文）

## 使えるプロンプト集

<PromptCard
  number="01"
  title="文字起こしを議事録にまとめる"
  prompt={`あなたは福祉施設の議事録作成を補助する...`}
/>

## ビフォーアフター

<BeforeAfter
  before="..."
  after="..."
/>

## 実践ステップ

<Steps
  steps={[
    { title: "録音する", desc: "..." },
    { title: "文字起こし", desc: "..." },
    ...
  ]}
/>

## 注意点

<Caution title="個人情報を直接入力しない">
  本文
</Caution>
```

---

## 5. インターフェース仕様

### 5.1 PromptCard コンポーネント

**Props**:
```typescript
interface PromptCardProps {
  number: string;        // "01", "02"等
  title: string;         // プロンプトのタイトル
  prompt: string;        // 実際のプロンプト本文
  recommendedAI?: 'chatgpt' | 'gemini' | 'either';  // 推奨先（デフォルト: 'either'）
}
```

**動作**:
1. プロンプト本文を整形表示（等幅フォント、改行保持）
2. 3つのCTAボタン:
   - **コピー**: クリップボードに本文を書き込み、トースト「プロンプトをコピーしました」
   - **ChatGPTで開く**: コピー → `https://chatgpt.com/?q=ENCODED_PROMPT` で新タブを開く
   - **Geminiで開く**: コピー → `https://gemini.google.com/app` で新タブを開く、トースト「コピーしました。入力欄に長押し→ペーストしてください」

### 5.2 クリップボード+遷移ロジック（`src/scripts/copyAndOpen.ts`）

```typescript
export type AIService = 'chatgpt' | 'gemini' | 'copy-only';

const URLS: Record<Exclude<AIService, 'copy-only'>, (prompt: string) => string> = {
  chatgpt: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  gemini: () => `https://gemini.google.com/app`,  // Geminiはprefill非対応のため引数無視
};

export async function copyAndOpen(
  prompt: string,
  service: AIService,
  showToast: (msg: string) => void
): Promise<void> {
  // Step 1: クリップボードコピー（失敗してもサービス遷移は続行）
  try {
    await navigator.clipboard.writeText(prompt);
  } catch (e) {
    showToast('コピーに失敗しました。手動でコピーしてください');
    return;
  }

  if (service === 'copy-only') {
    showToast('プロンプトをコピーしました');
    return;
  }

  // Step 2: トースト + 遷移
  const message = service === 'chatgpt'
    ? 'コピーしました。ChatGPTを開きます'
    : 'コピーしました。Geminiを開きます。入力欄に長押し→ペーストしてください';
  showToast(message);

  setTimeout(() => {
    window.open(URLS[service](prompt), '_blank', 'noopener,noreferrer');
  }, 400);
}
```

### 5.3 ChatGPT/Gemini URL仕様（2026-06-24時点）

| サービス | URL | Prefill | 自動送信 | 出典 |
|---|---|---|---|---|
| ChatGPT | `https://chatgpt.com/?q=ENCODED_PROMPT` | ✓ 動作報告あり | △ 実装変動 | [OpenAI Developer Community](https://community.openai.com/t/url-query-param-to-open-chat-with-initial-message/64167) |
| Gemini | `https://gemini.google.com/app` | ✗ ネイティブ非対応 | ✗ | [Hacker News #46761567](https://news.ycombinator.com/item?id=46761567) |
| Gemini AI Studio | `https://aistudio.google.com/` | ✗ 同上 | ✗ | 同上 |

**運用方針**:
- ChatGPTは `?q=` でprefill試行、動かなくても害がない
- Geminiはトップを開き、クリップボードからの手動ペーストを案内
- 実装後 `/verify` で iOS Safari / Android Chrome 双方で実機確認

### 5.4 PWA仕様

**manifest.json**:
```json
{
  "name": "生保AIスタディ",
  "short_name": "生保AI",
  "description": "大阪市生活保護施設連盟 AI活用研修 2026/9/7",
  "start_url": "/seiho-ai-study/",
  "display": "standalone",
  "background_color": "#F8F2E4",
  "theme_color": "#5C8B89",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker戦略**:
- 全静的アセット（HTML/CSS/JS/font/image）を precache
- 外部CDN（Google Fonts）は runtime cache（StaleWhileRevalidate）
- オフラインでも全ページ閲覧可

---

## 6. エラー処理

| 状況 | 挙動 |
|---|---|
| Clipboard API未対応 | フォールバック: `document.execCommand('copy')`、ダメならアラート「お使いのブラウザは自動コピー非対応です。テキストを手動選択してください」 |
| QRコード描画失敗 | URLテキスト（`yasushi-honda.github.io/seiho-ai-study`）を代替表示 |
| 外部リンク（Googleフォーム）アクセス失敗 | `target="_blank"` + `rel="noopener noreferrer"`、相手側障害は許容 |
| PWAインストール非対応ブラウザ | 通常Webサイトとしてアクセス可能、ヒント表示は出さない |
| ネットワーク切断（PWA未インストール状態） | Service Workerで初回訪問キャッシュを利用、未訪問ページのみ表示不可 |

---

## 7. テスト戦略

### 7.1 受け入れ基準（Acceptance Criteria）

**MUST**:
1. ✅ トップページからすべての9トピック詳細ページに遷移できる
2. ✅ 各プロンプトカードの「コピー」ボタンでクリップボードに本文が書き込まれる
3. ✅ 「ChatGPTで開く」ボタンで新タブが開く（prefill成否は別）
4. ✅ 「Geminiで開く」ボタンで新タブが開き、手動ペースト案内トーストが出る
5. ✅ QRコードがトップページに表示され、スマホで読み取ると本サイトURLが開ける
6. ✅ iPhone Safari 16+ / Android Chrome 110+ で全ページの表示・操作に破綻がない
7. ✅ Lighthouseスコア: Performance 80+, Accessibility 95+, Best Practices 95+, PWA installable
8. ✅ オフラインでも全ページ閲覧可（PWAインストール後）
9. ✅ タッチターゲット最低44x44px、テキストコントラスト比4.5:1以上
10. ✅ GitHub Pagesで公開URLが `https://yasushi-honda.github.io/seiho-ai-study/` で動く

**SHOULD**:
- フィードバックフォームから本田氏宛にメッセージが届く（Googleフォーム連携）
- 各トピックページがSNS埋め込み時にOG画像表示
- `prefers-reduced-motion: reduce` 時にアニメーション抑制

### 7.2 テスト方法

| カテゴリ | テスト |
|---|---|
| 単体 | Vitest（コンポーネント単位、純関数のみ） |
| E2E | Playwright（iPhone 13 / Pixel 7 viewport、コピー・遷移・QRの動作） |
| 表示 | Playwright screenshot 比較（モックアップとの一致確認） |
| 性能 | Lighthouse CI（毎PR） |
| アクセシビリティ | axe-core（Playwrightに統合） |
| PWA | Chrome DevTools Application パネル + 実機オフライン確認 |

---

## 8. スコープ外

以下は本リリースに含めない:

- ユーザー認証・ログイン機能
- 参加者のメモ・お気に入りプロンプト保存（localStorage含む）
- アンケート集計画面（フォーム送信先のGoogleフォーム側で完結）
- 多言語対応（日本語のみ）
- ダークモード（落ち着いた福祉トーンの基本色のみ）
- AI APIを直接叩く機能（あくまで外部AIサービスへの誘導アプリ）
- 法令データベース連携・RAG実装（紹介のみ）
- 講師用管理画面・進行状況同期
- 動画・音声コンテンツの埋め込み（リンク参照のみ）

---

## 9. Open Questions

- **Googleフォーム**: フィードバックフォームのURLは本田様にて準備（または研修当日に空欄でリリースし、後日埋める）
- **トピック数の最終確定**: 9トピック全てフル教材レベルで実装するか、コンテンツ作成負荷を見て一部簡素化する可能性
- **架空ケース記録のサンプル**: トピック4で使う架空ケースの内容（本田様の専門知見が必要）
- **施設内ガイドライン雛形**: トピック9で配布する雛形の最終内容
- **ロゴ**: 連盟ロゴを使うのか、独自シンボル（モックアップでは「福」マーク）で行くのか

---

## 10. リリーススケジュール（概算）

| マイルストーン | 目安 |
|---|---|
| プロジェクト初期化（Astro + Tailwind + GH Pages配信） | 2026-06末 |
| トピック1-3のフル実装（モデルケース） | 2026-07第1週 |
| 残り6トピックの実装 | 2026-07第3週 |
| 本田様コンテンツレビュー反映 | 2026-08第1週 |
| 実機検証・Lighthouse調整・PWA確認 | 2026-08第2週 |
| 関係者プレビュー・フィードバック反映 | 2026-08第3-4週 |
| 本番リリースタグ・最終動作確認 | 2026-09第1週（研修1週間前） |

---

## 11. 参考資料

- モックアップ（採用案A）: `design-mockups/option-a/`
- Astro公式: https://docs.astro.build
- @vite-pwa/astro: https://vite-pwa-org.netlify.app/frameworks/astro
- ChatGPT URL parameter: [OpenAI Developer Community](https://community.openai.com/t/url-query-param-to-open-chat-with-initial-message/64167)
- Gemini URL parameter状況: [Hacker News #46761567](https://news.ycombinator.com/item?id=46761567)
- 福祉現場のAI活用事例（要追加調査・本田様収集）

---

*本設計書は2026-06-24時点の情報に基づいて作成しています。AIサービスの仕様変更があれば適宜更新します。*
