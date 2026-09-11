#!/usr/bin/env node
// private/feedback/data/*.json を集約し、private/feedback/dashboard.html を生成する。
// 使い方: node scripts/build-feedback-dashboard.mjs
// 新しいアンケート結果を追加する場合は data/ に同じ形式の JSON を追加して再実行するだけでよい。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "private", "feedback", "data");
const outFile = path.join(root, "private", "feedback", "dashboard.html");

if (!fs.existsSync(dataDir)) {
  console.error(`データディレクトリが見つかりません: ${path.relative(root, dataDir)}`);
  process.exit(1);
}

const files = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.error(`${path.relative(root, dataDir)} にJSONファイルがありません`);
  process.exit(1);
}

const surveys = files.map((f) => {
  const raw = fs.readFileSync(path.join(dataDir, f), "utf-8");
  try {
    return { file: f, ...JSON.parse(raw) };
  } catch (e) {
    console.error(`${f} のJSONパースに失敗しました: ${e.message}`);
    process.exit(1);
  }
});

// </script> によるHTML破壊を防ぐためエスケープ
const dataScript = JSON.stringify(surveys).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>研修満足度アンケート ダッシュボード（非公開・ローカル限定）</title>
<style>
  :root {
    color-scheme: light;
    --bg: #f4f6f8;
    --card-bg: #ffffff;
    --text: #1f2937;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --accent: #2563eb;
    --accent-soft: #dbeafe;
    --warn-bg: #fff7ed;
    --warn-border: #fdba74;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
  }
  .banner {
    background: var(--warn-bg);
    border-bottom: 1px solid var(--warn-border);
    padding: 0.6rem 1.5rem;
    font-size: 0.85rem;
    text-align: center;
    color: var(--text);
  }
  header.page-head {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 1rem;
  }
  h1 { font-size: 1.4rem; margin: 0 0 0.3rem; }
  .sub { color: var(--text-muted); font-size: 0.9rem; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 3rem; }

  .survey-tabs {
    display: flex; gap: 0.5rem; flex-wrap: wrap;
    margin: 1.5rem 0 1rem;
  }
  .survey-tabs button {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text);
    cursor: pointer;
    font-size: 0.85rem;
  }
  .survey-tabs button.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  .view-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; }
  .view-tabs button {
    padding: 0.4rem 0.9rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.95rem;
  }
  .view-tabs button.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: 600;
  }

  .survey-meta {
    display: flex; gap: 1.5rem; flex-wrap: wrap;
    font-size: 0.85rem; color: var(--text-muted);
    margin-bottom: 1.2rem;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.2rem 1.4rem;
    margin-bottom: 1.2rem;
  }
  .card h2 { font-size: 1rem; margin: 0 0 1rem; }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.2rem;
  }

  .bar-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.55rem; font-size: 0.85rem; }
  .bar-label { flex: 0 0 auto; width: 9.5rem; color: var(--text); text-align: right; }
  .bar-track { flex: 1; background: var(--border); border-radius: 6px; height: 0.9rem; overflow: hidden; }
  .bar-fill { height: 100%; background: var(--accent); border-radius: 6px; }
  .bar-count { flex: 0 0 auto; width: 2.6rem; color: var(--text-muted); }

  .response-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.1rem 1.3rem;
    margin-bottom: 1rem;
  }
  .response-head {
    display: flex; justify-content: space-between; align-items: baseline;
    flex-wrap: wrap; gap: 0.5rem;
    margin-bottom: 0.6rem;
    font-size: 0.8rem; color: var(--text-muted);
  }
  .response-head .rid {
    font-weight: 700; color: var(--text); font-size: 0.9rem;
  }
  .tag {
    display: inline-block;
    background: var(--accent-soft);
    color: var(--accent);
    border-radius: 6px;
    padding: 0.15rem 0.5rem;
    font-size: 0.75rem;
    margin: 0.1rem 0.3rem 0.1rem 0;
  }
  dl.qa { margin: 0; }
  dl.qa dt { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.6rem; }
  dl.qa dd { margin: 0.15rem 0 0; white-space: pre-wrap; }
  .empty { color: var(--text-muted); font-style: italic; }

  .free-text-block { margin-bottom: 1.6rem; }
  .free-text-block h3 { font-size: 0.95rem; margin: 0 0 0.6rem; }
  .free-text-item {
    border-left: 3px solid var(--accent-soft);
    padding: 0.3rem 0 0.3rem 0.8rem;
    margin-bottom: 0.7rem;
    white-space: pre-wrap;
    font-size: 0.9rem;
  }
  .free-text-item .meta { display:block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.2rem; }

  .explainer summary { cursor: pointer; font-weight: 600; }
  .explainer table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 0.8rem; }
  .explainer th, .explainer td { border: 1px solid var(--border); padding: 0.5rem; text-align: left; vertical-align: top; }
  .explainer thead th { background: var(--bg); }
  .explainer h3 { font-size: 0.95rem; margin: 1.2rem 0 0.4rem; }
  .explainer h3:first-of-type { margin-top: 0.8rem; }
  .explainer svg { width: 100%; display: block; margin: 0 auto; }
  .explainer .diagram-caption { text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 0.4rem; }
  .explainer .footnote { color: var(--text-muted); font-size: 0.85rem; }
  .explainer + .explainer { margin-top: 1.2rem; }

  .qa-answer { margin-bottom: 1.8rem; padding-bottom: 1.6rem; border-bottom: 1px solid var(--border); }
  .qa-answer:last-of-type { border-bottom: none; margin-bottom: 0.8rem; padding-bottom: 0; }
  .qa-badge {
    display: inline-block; padding: 0.25rem 0.8rem; border-radius: 999px;
    font-size: 0.78rem; font-weight: 700; margin-bottom: 0.6rem;
  }
  .qa-badge.correct { background: #fee2e2; color: #b91c1c; }
  .qa-badge.support { background: #dcfce7; color: #15803d; }
  .qa-badge.mid { background: #fef9c3; color: #92400e; }
  .qa-question {
    background: var(--bg); border-left: 4px solid var(--text-muted);
    padding: 0.9rem 1.1rem; border-radius: 0 8px 8px 0;
    font-size: 0.9rem; margin-bottom: 0.8rem; line-height: 1.6;
  }
  .qa-answer-body p { margin: 0.5rem 0; }
  .qa-answer-body strong { color: var(--text); }
  .explainer a { color: var(--accent); text-decoration: underline; word-break: break-word; }
  .explainer a:hover { text-decoration: none; }

  .explainer-toc {
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 1.1rem 1.3rem; margin-bottom: 1.2rem;
  }
  .explainer-toc h2 { font-size: 0.95rem; margin: 0 0 0.8rem; }
  .explainer-toc ol { margin: 0; padding-left: 1.3rem; }
  .explainer-toc li { margin-bottom: 0.55rem; }
  .explainer-toc a { color: var(--text); text-decoration: none; font-weight: 600; }
  .explainer-toc a:hover { color: var(--accent); text-decoration: underline; }
  .explainer-toc .toc-desc { display: block; color: var(--text-muted); font-weight: 400; font-size: 0.82rem; margin-top: 0.15rem; }

  .explainer { scroll-margin-top: 1rem; }
  .explainer h2 { display: flex; align-items: center; font-size: 1.05rem; }
  .explainer .sec-num {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 1.7rem; height: 1.7rem; border-radius: 50%;
    background: var(--accent); color: #fff; font-size: 0.82rem; font-weight: 700;
    margin-right: 0.6rem;
  }
  .back-to-toc { display: inline-block; margin-top: 1.3rem; font-size: 0.82rem; color: var(--text-muted); text-decoration: none; }
  .back-to-toc:hover { color: var(--accent); text-decoration: underline; }

  .direct-answer {
    background: #fef2f2; border: 2px solid #dc2626; border-radius: 10px;
    padding: 1rem 1.2rem; margin-bottom: 1.2rem;
  }
  .direct-answer .da-label { font-weight: 600; color: #7f1d1d; font-size: 0.85rem; margin-bottom: 0.4rem; line-height: 1.6; }
  .direct-answer .da-text { font-size: 1.05rem; font-weight: 700; color: #991b1b; }

  footer {
    text-align: center; color: var(--text-muted); font-size: 0.78rem; padding: 1.5rem;
  }

  .material-link {
    display: inline-flex; align-items: center; gap: 0.4rem;
    margin-top: 0.6rem; padding: 0.4rem 0.9rem;
    border: 1px solid var(--accent); border-radius: 999px;
    color: var(--accent); text-decoration: none; font-size: 0.85rem;
  }
  .material-link:hover { background: var(--accent-soft); }
</style>
</head>
<body>
<div class="banner">🔒 非公開データ — このファイルはローカル限定です。git 管理対象外（private/ は .gitignore 済み）</div>
<header class="page-head">
  <h1>研修満足度アンケート ダッシュボード</h1>
  <div class="sub">大阪市生活保護施設連盟職員研修会 — 実施回ごとのフィードバックを集約表示</div>
  <a class="material-link" href="https://yasushi-honda.github.io/seiho-ai-study/" target="_blank" rel="noopener noreferrer">🔗 今回の教材サイトを開く</a>
</header>
<div class="wrap">
  <div id="surveyTabs" class="survey-tabs"></div>
  <div id="content"></div>
</div>
<footer>Generated locally by scripts/build-feedback-dashboard.mjs — このHTMLをネットに公開しないでください</footer>

<script>
window.__SURVEYS__ = ${dataScript};
</script>
<script>
(function () {
  const surveys = window.__SURVEYS__;
  const SATISFACTION_ORDER = ["非常に満足", "満足", "普通", "やや不満", "不満"];
  const DIFFICULTY_ORDER = ["難しかった", "やや難しかった", "ちょうど良かった", "やや易しかった", "易しかった"];
  const USEFULNESS_ORDER = ["すぐに活用できる・役立つ", "一部活用できそう", "あまり活用できそうにない", "わからない"];

  const EXPLAINER_HTML = \`
    <nav class="explainer-toc" id="explainer-toc">
      <h2>目次</h2>
      <ol>
        <li><a href="#sec-qa6">🗣️ 回答6でいただいたご質問にお答えします</a><span class="toc-desc">ISMAPの誤解を個別に訂正</span></li>
        <li><a href="#sec-flow">🔍 結局、どのレベルから個人情報を入れてよいのか</a><span class="toc-desc">判定フローと具体例早見表</span></li>
        <li><a href="#sec-tiers">📎 個人情報・要配慮個人情報を実名でAIに使う場合の最適構造</a><span class="toc-desc">3段階のグラデーションと推奨アーキテクチャ</span></li>
        <li><a href="#sec-action">🧭 今すぐできること・これから準備が必要なこと</a><span class="toc-desc">今日からできることと組織の宿題を分けて整理</span></li>
        <li><a href="#sec-refs">📚 参照した公式情報（一次ソース）</a><span class="toc-desc">すべてのファクトの出典リンク</span></li>
      </ol>
    </nav>

    <div class="card explainer" id="sec-qa6">
      <h2><span class="sec-num">1</span>🗣️ 回答6でいただいたご質問にお答えします</h2>
      <p class="sub">「Google Workspace + GeminiはISMAPなのか」「Google for NonprofitsのGeminiは？」というご質問に、確度を明示しながらお答えします（2026-09-09時点の公式情報に基づく）。</p>

      <div class="qa-answer">
        <span class="qa-badge mid">確度：中（状況的に妥当ですが、断定はできません）</span>
        <div class="qa-question">Q1. 「Google for nonprofitsに Gemini enterpriseをアドオンできる」は2024〜2025年頃の古い情報ではないか？</div>
        <div class="qa-answer-body">
          <p>直接の裏付けは取れていませんが、情報としては十分に妥当な見立てです。Google WorkspaceのISMAP対象範囲は実際に<strong>2025年12月〜2026年6月にかけて更新</strong>されていて、この分野は数ヶ月単位で状況が変わっています。</p>
        </div>
      </div>

      <div class="qa-answer">
        <span class="qa-badge correct">結論：認識の訂正が必要です</span>
        <div class="qa-question">Q2. 資料項目08の「Gemini Enterprise/Notebook Enterprise」には「ISMAP」の記載があるが、その前の「Google Workspace + Gemini」には記載がないため「ISMAPではない」という認識で正しいか？</div>
        <div class="qa-answer-body">
          <p><strong>いいえ、誤りの可能性が高いです。</strong>Google Workspaceは<strong>独立してISMAPに登録済み</strong>（登録番号 C21-0005-2）で、その対象範囲には「Geminiアプリ」「Gemini in Workspace」が明記されています（Google社提出の「生成AIに関する情報」開示書、2025年12月24日付）。</p>
          <p>研修資料の時点で記載が分かれていたのは、Workspace側の対象範囲の更新（2026年6月26日）より前の情報だったためと考えられます。</p>
        </div>
      </div>

      <h3>この2つのご質問の背景：ISMAP登録は「3つの別々の製品」に分かれている</h3>
      <p>Googleの生成AI関連サービスは、実は<strong>1つではなく3つの独立した登録</strong>に分かれています。「基盤が登録済みだから、その上のサービスも自動的に登録済み」にはなりません。</p>

      <div style="overflow-x:auto;">
        <svg viewBox="0 0 700 210" xmlns="http://www.w3.org/2000/svg">
          <style>
            .g3-box { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .g3-label { fill: var(--text); font-size: 13px; font-weight: 600; }
            .g3-sub { fill: var(--text-muted); font-size: 11px; }
            .g3-line { stroke: var(--text-muted); stroke-width: 1.5; }
          </style>
          <text class="g3-sub" x="350" y="18" text-anchor="middle">Googleの生成AI関連サービス（3つの独立した登録・自動継承なし）</text>
          <line class="g3-line" x1="110" y1="28" x2="590" y2="28" />
          <line class="g3-line" x1="110" y1="28" x2="110" y2="55" />
          <line class="g3-line" x1="350" y1="28" x2="350" y2="55" />
          <line class="g3-line" x1="590" y1="28" x2="590" y2="55" />

          <rect class="g3-box" x="20" y="55" width="180" height="130" rx="8" />
          <text class="g3-label" x="110" y="80" text-anchor="middle">
            <tspan x="110" dy="0">Google Cloud</tspan>
            <tspan x="110" dy="16">Platform</tspan>
          </text>
          <text class="g3-sub" x="110" y="124" text-anchor="middle">C21-0004-2</text>
          <text class="g3-sub" x="110" y="144" text-anchor="middle">
            <tspan x="110" dy="0">Vertex AI基盤を</tspan>
            <tspan x="110" dy="14">含む</tspan>
          </text>

          <rect class="g3-box" x="260" y="55" width="180" height="130" rx="8" />
          <text class="g3-label" x="350" y="88" text-anchor="middle">Google Workspace</text>
          <text class="g3-sub" x="350" y="124" text-anchor="middle">C21-0005-2</text>
          <text class="g3-sub" x="350" y="144" text-anchor="middle">
            <tspan x="350" dy="0">Geminiアプリ・Gemini</tspan>
            <tspan x="350" dy="14">in Workspaceを含む</tspan>
          </text>

          <rect class="g3-box" x="500" y="55" width="180" height="130" rx="8" />
          <text class="g3-label" x="590" y="88" text-anchor="middle">Gemini Enterprise</text>
          <text class="g3-sub" x="590" y="124" text-anchor="middle">C26-0114-2</text>
          <text class="g3-sub" x="590" y="144" text-anchor="middle">
            <tspan x="590" dy="0">エンタープライズAI</tspan>
            <tspan x="590" dy="14">エージェント基盤</tspan>
          </text>
        </svg>
        <p class="diagram-caption">3つとも独立してISMAP登録済み。ただし登録番号・対象範囲が別々なので、製品ごとの個別確認が必要</p>
      </div>

      <div class="qa-answer" style="margin-top:1.4rem;">
        <span class="qa-badge support">結論：方向性は支持されますが断定はできません</span>
        <div class="qa-question">Q3. 「Gemini アプリ」「Gemini in Workspace」がGoogle Workspaceの「コアサービス」であれば、Google for Nonprofitsで提供されているGeminiも「ISMAPである」と言えないか？</div>
        <div class="qa-answer-body">
          <p>方向性としては支持されます。ISMAPのWorkspace登録は「有料版はOK、無料版はNG」のようなエディション別の言明ではなく、<strong>製品単位</strong>の言明だからです。Google公式サポートページでも、Nonprofitsエディションが「Geminiアプリ（エンタープライズグレードのデータ保護付き）」を提供していることは確認できています。</p>
          <p>ただし「Nonprofits版は有料版と全く同一の基盤」と明記した一次資料の逐語文までは見つけられていません。<strong>実運用前にGoogle for Nonprofits窓口へ書面で確認することをおすすめします。</strong></p>
        </div>
      </div>

      <h3>もう一つ重要な点：「ISMAP登録済み」と「日本国内だけで処理される」は別の話</h3>
      <p>ここが今回のご質問より一歩踏み込んだ、実務上もっとも重要な注意点です。<strong>ISMAPに登録されていることと、データが日本国内だけで処理されることは、別の軸の話です。</strong></p>

      <div style="overflow-x:auto;">
        <svg viewBox="0 0 620 370" xmlns="http://www.w3.org/2000/svg">
          <style>
            .mx-cell { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .mx-cell.good { stroke: var(--accent); stroke-width: 2; fill: var(--accent-soft); }
            .mx-cell.flag { stroke: #b45309; stroke-width: 2; }
            .mx-label { fill: var(--text); font-size: 12px; font-weight: 600; }
            .mx-sub { fill: var(--text-muted); font-size: 10.5px; }
            .mx-axis { fill: var(--text-muted); font-size: 11px; }
            .mx-flagtext { fill: #b45309; font-size: 10.5px; font-weight: 700; }
          </style>

          <text class="mx-axis" x="360" y="16" text-anchor="middle">日本国内処理の保証</text>
          <text class="mx-axis" x="250" y="38" text-anchor="middle">なし（グローバル/米国/欧州等）</text>
          <text class="mx-axis" x="470" y="38" text-anchor="middle">あり（日本ロケーション指定可）</text>

          <text class="mx-axis" x="30" y="130" text-anchor="middle" transform="rotate(-90 30 130)">ISMAP登録済み</text>
          <text class="mx-axis" x="30" y="270" text-anchor="middle" transform="rotate(-90 30 270)">ISMAP未登録</text>

          <rect class="mx-cell flag" x="140" y="60" width="220" height="140" rx="8" />
          <text class="mx-label" x="250" y="98" text-anchor="middle">
            <tspan x="250" dy="0">Google Workspace</tspan>
            <tspan x="250" dy="16">+ Gemini in Workspace</tspan>
          </text>
          <text class="mx-flagtext" x="250" y="140" text-anchor="middle">← 回答6のご質問はここ</text>
          <text class="mx-sub" x="250" y="164" text-anchor="middle">
            <tspan x="250" dy="0">ISMAP登録済みだが、</tspan>
            <tspan x="250" dy="14">日本限定処理は選べない</tspan>
          </text>

          <rect class="mx-cell good" x="360" y="60" width="220" height="140" rx="8" />
          <text class="mx-label" x="470" y="98" text-anchor="middle">
            <tspan x="470" dy="0">Gemini Enterprise</tspan>
            <tspan x="470" dy="16">AWS Bedrock（Nova Pro）</tspan>
          </text>
          <text class="mx-sub" x="470" y="150" text-anchor="middle">
            <tspan x="470" dy="0">要配慮個人情報にも</tspan>
            <tspan x="470" dy="14">対応できる本命ゾーン</tspan>
          </text>

          <rect class="mx-cell" x="140" y="200" width="220" height="140" rx="8" />
          <text class="mx-sub" x="250" y="264" text-anchor="middle">
            <tspan x="250" dy="0">（一般的な海外AIツール等、</tspan>
            <tspan x="250" dy="14">本資料の対象外）</tspan>
          </text>

          <rect class="mx-cell" x="360" y="200" width="220" height="140" rx="8" />
          <text class="mx-label" x="470" y="260" text-anchor="middle">さくらのAI Engine単体</text>
          <text class="mx-sub" x="470" y="284" text-anchor="middle">
            <tspan x="470" dy="0">国内完結だが</tspan>
            <tspan x="470" dy="14">ISMAP未登録</tspan>
          </text>
        </svg>
        <p class="diagram-caption">縦軸＝ISMAP登録の有無、横軸＝日本国内処理の保証の有無。この2つは独立した別の軸</p>
      </div>

      <p>Google Workspace + Geminiは<strong>ISMAP登録済みですが、データの処理場所は「グローバル」「米国」「ヨーロッパ」からしか選べず、日本限定の選択肢がありません。</strong>要配慮個人情報（医療・福祉記録等）を扱う場合は、日本ロケーション指定が可能な「Gemini Enterprise」（Workspaceとは別製品）を検討する必要があります。</p>
      <a class="back-to-toc" href="#explainer-toc">↑ 目次へ戻る</a>
    </div>

    <div class="card explainer" id="sec-flow">
      <h2><span class="sec-num">2</span>🔍 結局、どのレベルから個人情報を入れてよいのか</h2>
      <p class="sub">「Gemini in Workspaceに要配慮個人情報を入れてよいか」という核心の疑問に、判定フローと具体例で直接お答えします。</p>

      <div class="direct-answer">
        <div class="da-label">Q. Gemini in Workspace（通常のGeminiアプリ）に、利用者の病歴や障害の状況などの要配慮個人情報を入れてよいか？</div>
        <div class="da-text">A. 推奨しません。</div>
      </div>

      <h3>なぜ非推奨なのか（見落とされがちなもう一つの法的論点）</h3>
      <p>ここまでの「ISMAP登録の有無」とは別に、もう一つ重要な論点があります。<strong>個人情報保護法24条「外国にある第三者への提供」（越境移転規制）</strong>です。</p>
      <p>Gemini in Workspaceはデータの処理地を「グローバル」「米国」「ヨーロッパ」からしか選べず、日本国内に固定できません。要配慮個人情報を、処理地を特定できないまま海外（特に米国）で処理させることは、法24条が定める<strong>越境移転規制の対象になり得ます</strong>。この場合、通常の利用同意とは別に<strong>越境移転そのものへの本人の同意</strong>や、移転先の保護水準についての契約上の手当てが必要になります。</p>
      <p>ISMAP登録は「安全に守れているか」（法23条・安全管理措置）を担保するものであり、「そもそも海外で処理してよいか」（法24条・越境移転）とは別の話です。Gemini in WorkspaceはISMAP登録済みでも、この24条の論点をクリアできていません。</p>

      <h3>判定フロー</h3>
      <div style="overflow-x:auto;">
        <svg viewBox="0 0 830 560" xmlns="http://www.w3.org/2000/svg">
          <style>
            .fc-diamond { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .fc-box { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .fc-box.good { stroke: var(--accent); stroke-width: 2; fill: var(--accent-soft); }
            .fc-box.bad { stroke: #dc2626; stroke-width: 2; fill: #fee2e2; }
            .fc-label { fill: var(--text); font-size: 12px; font-weight: 600; }
            .fc-sub { fill: var(--text-muted); font-size: 10.5px; }
            .fc-edge { fill: var(--text-muted); font-size: 11px; font-weight: 700; }
            .fc-arrow { stroke: var(--text-muted); stroke-width: 1.5; fill: none; marker-end: url(#fc-arrowhead); }
          </style>
          <defs>
            <marker id="fc-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-muted)" />
            </marker>
          </defs>

          <rect class="fc-box" x="290" y="10" width="200" height="40" rx="6" />
          <text class="fc-label" x="390" y="34" text-anchor="middle">入力しようとしているデータ</text>
          <line class="fc-arrow" x1="390" y1="50" x2="390" y2="58" />

          <polygon class="fc-diamond" points="390,58 520,102 390,146 260,102" />
          <text class="fc-label" x="390" y="98" text-anchor="middle">
            <tspan x="390" dy="0">個人を特定できる</tspan>
            <tspan x="390" dy="15">情報を含むか？</tspan>
          </text>

          <line class="fc-arrow" x1="520" y1="102" x2="600" y2="102" />
          <text class="fc-edge" x="558" y="94" text-anchor="middle">いいえ</text>
          <line class="fc-arrow" x1="600" y1="102" x2="600" y2="128" />
          <rect class="fc-box good" x="500" y="128" width="220" height="55" rx="6" />
          <text class="fc-label" x="610" y="150" text-anchor="middle">匿名化データ・統計情報</text>
          <text class="fc-sub" x="610" y="168" text-anchor="middle">制限なく利用可</text>

          <line class="fc-arrow" x1="390" y1="146" x2="390" y2="184" />
          <text class="fc-edge" x="410" y="168" text-anchor="start">はい</text>

          <polygon class="fc-diamond" points="390,184 550,238 390,292 230,238" />
          <text class="fc-label" x="390" y="222" text-anchor="middle">
            <tspan x="390" dy="0">要配慮個人情報</tspan>
            <tspan x="390" dy="15">（病歴・障害・犯罪歴等）</tspan>
            <tspan x="390" dy="15">を含むか？</tspan>
          </text>

          <line class="fc-arrow" x1="550" y1="238" x2="630" y2="238" />
          <text class="fc-edge" x="588" y="230" text-anchor="middle">いいえ</text>
          <line class="fc-arrow" x1="630" y1="238" x2="630" y2="264" />
          <rect class="fc-box" x="520" y="264" width="290" height="70" rx="6" />
          <text class="fc-label" x="665" y="288" text-anchor="middle">通常の個人情報（氏名・所属等）</text>
          <text class="fc-sub" x="665" y="306" text-anchor="middle">
            <tspan x="665" dy="0">ISMAP登録＋DPA＋同意があれば利用可</tspan>
            <tspan x="665" dy="14">（Gemini in Workspaceも可、越境移転に注意）</tspan>
          </text>

          <line class="fc-arrow" x1="390" y1="292" x2="390" y2="330" />
          <text class="fc-edge" x="410" y="314" text-anchor="start">はい</text>

          <polygon class="fc-diamond" points="390,330 570,384 390,438 210,384" />
          <text class="fc-label" x="390" y="368" text-anchor="middle">
            <tspan x="390" dy="0">日本国内処理保証＋</tspan>
            <tspan x="390" dy="15">3省2ガイドライン対応済み</tspan>
            <tspan x="390" dy="15">のツールか？</tspan>
          </text>

          <line class="fc-arrow" x1="300" y1="411" x2="230" y2="465" />
          <text class="fc-edge" x="250" y="450" text-anchor="middle">いいえ</text>
          <rect class="fc-box bad" x="90" y="465" width="280" height="70" rx="6" />
          <text class="fc-label" x="230" y="490" text-anchor="middle">利用不可</text>
          <text class="fc-sub" x="230" y="508" text-anchor="middle">
            <tspan x="230" dy="0">Gemini in Workspace等</tspan>
            <tspan x="230" dy="14">（日本ロケーション非対応）は非推奨</tspan>
          </text>

          <line class="fc-arrow" x1="480" y1="411" x2="550" y2="465" />
          <text class="fc-edge" x="535" y="450" text-anchor="middle">はい</text>
          <rect class="fc-box good" x="440" y="465" width="300" height="70" rx="6" />
          <text class="fc-label" x="590" y="488" text-anchor="middle">利用可</text>
          <text class="fc-sub" x="590" y="506" text-anchor="middle">
            <tspan x="590" dy="0">Gemini Enterprise（日本ロケーション）／</tspan>
            <tspan x="590" dy="14">AWS Bedrock等＋組織的措置</tspan>
          </text>
        </svg>
        <p class="diagram-caption">「はい」を辿るほど要件が厳しくなる。要配慮個人情報は必ず最下段の判定まで確認する</p>
      </div>

      <h3>具体例早見表</h3>
      <table>
        <thead>
          <tr>
            <th>入力しようとしている内容の例</th>
            <th>分類</th>
            <th>Gemini in Workspaceで入力してよいか</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>一般的な案内文・チラシのひな形（個人名なし）</td>
            <td>匿名化情報</td>
            <td>✅ 問題なし</td>
          </tr>
          <tr>
            <td>研修資料・マニュアルの下書き</td>
            <td>匿名化情報</td>
            <td>✅ 問題なし</td>
          </tr>
          <tr>
            <td>施設名・職員の氏名</td>
            <td>通常の個人情報</td>
            <td>⚠️ 条件付きで可（DPA・同意が前提）</td>
          </tr>
          <tr>
            <td>利用者の氏名・住所・連絡先のみ</td>
            <td>通常の個人情報</td>
            <td>⚠️ 条件付きで可（DPA・同意が前提）</td>
          </tr>
          <tr>
            <td>利用者の病歴・障害の状況</td>
            <td>要配慮個人情報</td>
            <td>❌ 非推奨</td>
          </tr>
          <tr>
            <td>逮捕歴・犯罪の経歴</td>
            <td>要配慮個人情報</td>
            <td>❌ 非推奨</td>
          </tr>
          <tr>
            <td>ケース記録全般（病歴・生活歴等を含む）</td>
            <td>要配慮個人情報を含む可能性大</td>
            <td>❌ 非推奨（個別に要配慮情報の有無を確認）</td>
          </tr>
        </tbody>
      </table>
      <p class="footnote">※「生活保護の受給歴」そのものは個人情報保護法が列挙する要配慮個人情報の定義に直接該当するとは限りませんが、ケース記録には病歴・障害等の要配慮個人情報が併記されることが多く、実務上は要配慮情報に準じた慎重な取扱いが妥当です。個別の該当性判断は専門家にご確認ください。</p>
      <a class="back-to-toc" href="#explainer-toc">↑ 目次へ戻る</a>
    </div>

    <div class="card explainer" id="sec-tiers">
      <h2><span class="sec-num">3</span>📎 個人情報・要配慮個人情報を実名でAIに使う場合の最適構造（2026-09-09時点）</h2>
      <p class="sub">研修アンケートで複数の方からいただいた「個人情報・要配慮個人情報をAIに入力してよいか」「ISMAPとは何か」というご質問について、2026-09-09時点の公式一次情報に基づき技術的に整理したものです。専門的な内容を含みます。</p>

      <h3>大原則：「安全に守る」と「そもそも使ってよいか」は別問題</h3>
      <p>個人情報保護法は大きく2つの独立した義務を課しています。片方を満たしても、もう片方の違反は消えません。</p>
      <ul>
        <li><strong>安全管理措置（法23条）</strong>：データを守る仕組み。リージョン指定・認証方式・監査ログなど、<strong>アーキテクチャ（技術）で解決できる</strong></li>
        <li><strong>取得・利用目的の適法性（法17条・18条・20条2項）</strong>：そもそも扱ってよいか。同意書・委託契約・利用目的の公表など、<strong>法務・組織対応でしか解決できない</strong></li>
      </ul>
      <p>「システムを固めたから要配慮個人情報も安全」という考え方は成立しません。以下は主に前者（技術面）の整理です。</p>

      <h3>3段階のグラデーション</h3>
      <div style="overflow-x:auto;">
        <svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg">
          <style>
            .tier-box { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .tier-box.c { stroke: var(--accent); stroke-width: 2; }
            .tier-label { fill: var(--text); font-size: 13px; }
            .tier-sub { fill: var(--text-muted); font-size: 11px; }
            .tier-arrow { stroke: var(--text-muted); stroke-width: 1.5; fill: none; marker-end: url(#fb-arrowhead); }
          </style>
          <defs>
            <marker id="fb-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-muted)" />
            </marker>
          </defs>

          <rect class="tier-box" x="20" y="70" width="180" height="70" rx="8" />
          <text class="tier-label" x="110" y="98" text-anchor="middle">Tier A</text>
          <text class="tier-sub" x="110" y="116" text-anchor="middle">
            <tspan x="110" dy="0">匿名化・非識別化</tspan>
            <tspan x="110" dy="14">（実名を入れない）</tspan>
          </text>

          <rect class="tier-box" x="270" y="50" width="180" height="110" rx="8" />
          <text class="tier-label" x="360" y="88" text-anchor="middle">Tier B</text>
          <text class="tier-sub" x="360" y="106" text-anchor="middle">
            <tspan x="360" dy="0">通常の個人情報</tspan>
            <tspan x="360" dy="14">（実名・非要配慮）</tspan>
          </text>

          <rect class="tier-box c" x="520" y="20" width="180" height="150" rx="8" />
          <text class="tier-label" x="610" y="58" text-anchor="middle">Tier C</text>
          <text class="tier-sub" x="610" y="76" text-anchor="middle">
            <tspan x="610" dy="0">要配慮個人情報</tspan>
            <tspan x="610" dy="14">（実名・医療/福祉記録等）</tspan>
          </text>

          <line class="tier-arrow" x1="20" y1="200" x2="700" y2="200" />
          <text class="tier-sub" x="360" y="220" text-anchor="middle">必要な安全管理措置・組織対応の水準（右にいくほど高度）</text>
        </svg>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tier</th>
            <th>代表的な用途</th>
            <th>必要な技術要件</th>
            <th>利用可能な製品例（2026-09時点）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A 匿名化</td>
            <td>個人が特定されない一般的な文章生成・要約・案内文作成</td>
            <td>特別な要件なし</td>
            <td>Gemini in Workspace、Google for Nonprofits版Gemini等、一般的なクラウドAIで可</td>
          </tr>
          <tr>
            <td>B 通常個人情報（実名）</td>
            <td>施設名・担当者名等を含む議事録・案内文</td>
            <td>ISMAP登録済みクラウド＋DPA締結＋同意取得（日本リージョン限定は必須ではないが推奨）</td>
            <td>
              <ul>
                <li>Google Workspaceに標準搭載の「Geminiアプリ/Gemini in Workspace」（ISMAP登録済み、日本限定の選択肢はないがTier Bでは許容範囲）</li>
                <li>より安全に倒すなら<strong>Gemini Enterprise</strong>（Workspaceとは別契約の独立した製品、日本ロケーション指定可）</li>
                <li><strong>Vertex AI（Gemini Enterprise Agent Platform）のAPI</strong>をGCPプロジェクト＋課金アカウント経由で使う方法も可（ISMAP登録済み、リージョン問わずTier Bなら利用可）</li>
                <li>❌ <strong>Google AI Studio（ai.google.dev）で発行する素のAPIキー</strong>はNG。ISMAP対象外の別製品で、データが「世界中どこでも」保存されうるため、Gemini in Workspaceより条件が悪い</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>C 要配慮個人情報（実名）</td>
            <td>
              <ul>
                <li>ケースワーク記録・支援経過記録の要約や下書き作成</li>
                <li>相談面談の音声からの議事録作成（生活歴・病歴に触れる内容を含む）</li>
                <li>生活歴・病歴・診断書等の書類のAI OCR化</li>
                <li>自立支援計画書・支援プログラムの下書き作成</li>
                <li>医療機関・福祉事務所等への紹介状・報告書の下書き作成</li>
                <li>利用者の状況に関するケース会議の議事録作成</li>
              </ul>
            </td>
            <td>Bの要件に加え、データの保存＋AI処理（MLP）が日本国内に完全に閉じること、APIキーレス認証、3省2ガイドライン相当の組織的措置</td>
            <td>
              <ul>
                <li>GCP（Cloud Run・Firestore、インフラ）＋AWS Bedrock（Amazon Nova Pro、テキスト生成・要約・音声）のハイブリッド構成（下記参照）</li>
                <li>❗<strong>AI OCRだけは例外</strong>：AWS Bedrock（Claude/Nova系）は日本語OCRの精度に実証済みの弱点があるため、自前ホスティングの<strong>PaddleOCR</strong>（Cloud Run CPU・東京リージョン、低コスト）に切り出すことを推奨</li>
                <li>GoogleのGemini Enterprise / Gemini Enterprise Agent Platformは、日本リージョンで従量課金が使えずコスト面で不利なため、この構成には含めていない</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="footnote">※Gemini Enterpriseは、Business版であればIT部門のセットアップや営業への問い合わせなしで<strong>30日間の無料トライアルをセルフサーブで開始</strong>できます（<a href="https://cloud.google.com/gemini-enterprise/faq" target="_blank" rel="noopener noreferrer">Google Cloud公式FAQ</a>、2026-09-09時点確認）。したがって「管理コンソールでGemini Enterpriseのトグルがオンになっている」＝「正式に契約済み」とは限りません。無料トライアル中の可能性もあるため、実際の契約状況は別途確認が必要です。</p>
      <p class="footnote">※「日本リージョン限定は必須ではない」の意味：Vertex AI（Gemini Enterprise Agent Platform）自体はGoogle Cloud Platform（C21-0004-2）としてISMAP登録済みなので、リージョンに関わらずISMAP要件は満たします。日本リージョン以外を使う場合に論点になるのは個人情報保護法24条（外国にある第三者への提供＝越境移転規制）で、通常の個人情報であればプライバシーポリシー等での同意取得により越境移転規制はクリアできます。要配慮個人情報（Tier C）ほど慎重を期す必要がないため、Tier Bでは同意ベースの処理で足りるという判断です。移転先が米国の場合は同意が実質的に必須（米国はAPPIの十分性認定国に含まれない）である点に留意してください。</p>

      <h3>Tier C（最も厳しい要件）での具体的な最適構造</h3>
      <p>要配慮個人情報を実名で扱う場合、2026-09-09時点で最も現実的なのは「既存のGoogle Cloudインフラは維持しつつ、テキスト生成・要約・音声文字起こしはAWS Bedrockに任せる」ハイブリッド構成です。<strong>ただしAI OCRだけは例外</strong>です。実機検証の結果、AWS Bedrock（Claude/Nova系）は日本語OCRの精度に弱点があることが分かったため、OCR用途に限ってはGCP側で自前ホスティングするPaddleOCRを使う構成を推奨します（根拠は次項）。</p>

      <div style="overflow-x:auto;">
        <svg viewBox="0 0 680 270" xmlns="http://www.w3.org/2000/svg">
          <style>
            .arch-box2 { fill: var(--card-bg); stroke: var(--border); stroke-width: 1.5; }
            .arch-box2.accent { stroke: var(--accent); stroke-width: 2; }
            .arch-box2.highlight { stroke: #15803d; stroke-width: 2; }
            .arch-label2 { fill: var(--text); font-size: 12px; }
            .arch-arrow2 { stroke: var(--text-muted); stroke-width: 1.5; fill: none; marker-end: url(#fb-arrowhead2); }
            .arch-edge2 { fill: var(--text-muted); font-size: 11px; }
          </style>
          <defs>
            <marker id="fb-arrowhead2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-muted)" />
            </marker>
          </defs>

          <rect class="arch-box2" x="300" y="10" width="180" height="44" rx="6" />
          <text class="arch-label2" x="390" y="37" text-anchor="middle">利用者</text>

          <line class="arch-arrow2" x1="390" y1="54" x2="390" y2="90" />

          <rect class="arch-box2 accent" x="300" y="90" width="180" height="54" rx="6" />
          <text class="arch-label2" x="390" y="112" text-anchor="middle">
            <tspan x="390" dy="0">Cloud Run</tspan>
            <tspan x="390" dy="16">(GCP・日本リージョン)</tspan>
          </text>

          <line class="arch-arrow2" x1="330" y1="144" x2="105" y2="190" />
          <line class="arch-arrow2" x1="370" y1="144" x2="310" y2="190" />
          <line class="arch-arrow2" x1="430" y1="144" x2="530" y2="190" />
          <text class="arch-edge2" x="190" y="172" text-anchor="middle">保存</text>
          <text class="arch-edge2" x="330" y="172" text-anchor="middle">AI OCR</text>
          <text class="arch-edge2" x="470" y="172" text-anchor="middle">キーレス認証</text>

          <rect class="arch-box2" x="20" y="190" width="170" height="60" rx="6" />
          <text class="arch-label2" x="105" y="214" text-anchor="middle">
            <tspan x="105" dy="0">Firestore</tspan>
            <tspan x="105" dy="16">(GCP・データ保存)</tspan>
          </text>

          <rect class="arch-box2 highlight" x="210" y="190" width="200" height="60" rx="6" />
          <text class="arch-label2" x="310" y="214" text-anchor="middle">
            <tspan x="310" dy="0">PaddleOCR（自前）</tspan>
            <tspan x="310" dy="16">(Cloud Run CPU・OCR専用)</tspan>
          </text>

          <rect class="arch-box2" x="430" y="190" width="200" height="60" rx="6" />
          <text class="arch-label2" x="530" y="214" text-anchor="middle">
            <tspan x="530" dy="0">AWS Bedrock/Transcribe</tspan>
            <tspan x="530" dy="16">(テキスト生成・要約・音声)</tspan>
          </text>
        </svg>
        <p class="diagram-caption">データの保存・AI処理とも常に日本国内。AI OCRだけは精度上の理由でGCP内の自前ホスティングに切り出し、それ以外の生成AI処理はAWS Bedrockへ。クラウド間の認証は固定パスワード不要（キーレス）方式</p>
      </div>

      <h3>なぜこの構成が今のところ最適と言えるのか（根拠）</h3>
      <ul>
        <li><strong>ISMAP（政府のセキュリティ認証制度）の登録構造</strong>：Google関連は「Google Cloud本体」「Google Workspace」「Gemini Enterprise」の3つが別々の登録番号を持ち、基盤が登録済みでも上位のサービスは自動的には登録されません。「Google Workspace + Gemini」だけでは日本限定の処理は保証されない一方、「Gemini Enterprise」（別製品）は日本ロケーション指定が可能です。AWSはBedrock・Transcribeを含む単一登録（<a href="https://www.ismap.go.jp/csm?id=cloud_service_list" target="_blank" rel="noopener noreferrer">C21-0008-2</a>）で構造がシンプルです。</li>
        <li><strong>個別のAIモデルは別途登録不要（2026年1月確認）</strong>：<a href="https://www.ismap.go.jp/csm?id=kb_article_view&sysparm_article=KB0011070" target="_blank" rel="noopener noreferrer">ISMAP運営主体自身の公式見解（ポータルKB0011070）</a>により、クラウド事業者が自社の生成AI開発基盤（PaaS）をISMAP登録範囲に含めていれば、そこで動く個々のモデル（Gemini・Nova Pro等）は別途登録不要と確認されています。</li>
        <li><strong>コスト構造</strong>：<a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash" target="_blank" rel="noopener noreferrer">Google Cloud公式ドキュメント</a>によれば、Gemini 3.5 Flash以降を日本リージョン（asia-northeast1）で使う場合、通常の従量課金（Standard PayGo）が使えず、<a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/provisioned-throughput/purchase-provisioned-throughput" target="_blank" rel="noopener noreferrer">シングルゾーンのProvisioned Throughput（Google Cloudアカウント担当者への問い合わせが必須）</a>のみ対応です。<a href="https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing" target="_blank" rel="noopener noreferrer">料金ページの計算例</a>では月額$2,700×GSU数という試算が示されています。小規模な組織には現実的ではありません。AWS Bedrock（Nova Pro）は固定費なしの従量課金のままです。</li>
        <li><strong>性能（一般的なDocVQAベンチマーク）</strong>：文書の読み取り精度（DocVQA、英語中心の一般的な文書QAベンチマーク）は、<a href="https://arxiv.org/abs/2506.12103" target="_blank" rel="noopener noreferrer">Amazon Nova Family Technical Report（arXiv 2506.12103）</a>によればAmazon Nova Proが93.5%。Gemini 3.5 Flashの94%という数値は前回セッションで確認したものですが、今回の見直しでは同じ精度でGoogle公式の一次ソースに再度たどり着けませんでした（要再検証、下記参照した公式情報も参照）。いずれにせよ両者はほぼ同水準で、この一般的なベンチマークだけを見ると大きな差はなさそうに見えます。</li>
        <li><strong>性能（日本語OCRに限定した実機検証、非公開ベンチマーク）</strong>：上記の一般的なDocVQAとは別に、実際の日本語書類（旧字体異体字・簡体字類似漢字・事業所名の紛らわしいペア等）を使った実機検証では、<strong>AWS Bedrock（Claude Haiku 4.5・Sonnet 4.5、Amazon Nova 2 Lite）は特定の漢字を再現性ある形で誤読する</strong>弱点が確認されました（例：「擬」の字を毎回異なる誤字に読み違える）。画像前処理やプロンプト工夫では解消しませんでした。一方、<strong>自前ホスティングのPaddleOCR（PP-OCRv6、Apache 2.0、CPU推論のみ）は、東京リージョンのCloud Run（CPUのみ・低コスト）上でGemini 3.5 Flashとほぼ同水準の精度</strong>を達成できることも確認されています。そのためTier Cの構成では、<strong>AI OCR専用の処理だけはAWS Bedrockではなく自前ホスティングのPaddleOCRに切り出す</strong>ことを推奨します（テキスト生成・要約・音声はAWS Bedrockのままで問題ありません）。この項目は社内の実機ベンチマークに基づくもので、公開されている一次情報へのリンクはありません。</li>
      </ul>

      <h3>技術を固めても残る法務・組織対応（必須）</h3>
      <ul>
        <li>利用者への同意取得・プライバシーポリシーの改定（AI処理を行う旨の明記）</li>
        <li>クラウド事業者とのDPA（データ処理契約）締結</li>
        <li>委託先（システム開発事業者）とのNDA・業務委託契約</li>
        <li>要配慮個人情報を扱う場合は、3省2ガイドライン（厚労省・総務省・経産省）相当の組織的措置</li>
      </ul>
      <p class="footnote">※本セクションは2026-09-09時点の公式一次情報（ISMAPポータル・AWS/Google公式ドキュメント）に基づく技術的整理であり、法的な最終判断は専門家にご確認ください。</p>
      <a class="back-to-toc" href="#explainer-toc">↑ 目次へ戻る</a>
    </div>

    <div class="card explainer" id="sec-action">
      <h2><span class="sec-num">4</span>🧭 今すぐできること・これから準備が必要なこと</h2>
      <p class="sub">「要配慮個人情報に使えないのは困る」というお気持ちはもっともです。「できない」で終わらせず、今日からできることと、組織として計画的に準備すべきことを分けて整理します。</p>

      <h3>✅ 今日からできること</h3>
      <ul>
        <li>案内文・マニュアル・一般的な文章生成など、<strong>個人が特定される情報を含まない用途</strong>では、今お使いのGemini in Workspaceをそのまま使い続けて問題ありません。</li>
        <li>相談メモの下書き等、<strong>病歴・生活歴・障害の状況等の要配慮個人情報を含まない</strong>場合に限り、氏名・住所・生年月日等を仮名（A様、B様等）に置き換えてから入力すれば、現状のツールのまま活用できます。「困ったら、まず匿名化してから」を職場のルールにするだけで、使える範囲はかなり広がります。</li>
        <li>⚠️ <strong>ただしケース記録・支援経過記録のように病歴・生活歴等を含む文書は対象外です。</strong>氏名を仮名に置き換えても、生活歴・病歴・状況の組み合わせから本人が推測できてしまう場合があり、要配慮個人情報のままである可能性が残ります（下記「📎 個人情報・要配慮個人情報を実名でAIに使う場合の最適構造」のTier Cに該当）。</li>
      </ul>

      <h3>❌ 正直に：今はまだできないこと</h3>
      <ul>
        <li>利用者の実名と病歴・生活歴等を<strong>そのまま</strong>Gemini in Workspaceやその他の一般的なAIツールに入力すること。</li>
        <li>「今の契約・今のツールのまま」でこれを安全にクリアする方法は、2026-09-09時点では存在しません。ここは期待を持たせすぎないよう、はっきりお伝えします。</li>
      </ul>

      <h3>🏗️ 組織として計画的に準備すべきこと</h3>
      <p>要配慮個人情報を実名で扱えるようにするには、個人のスマホ設定のように「その場で解決すること」ではなく、<strong>システム構築と契約整理を伴う一定規模のプロジェクト</strong>として進める必要があります。具体的には：</p>
      <ul>
        <li>Tier C対応の技術基盤の構築（Gemini Enterprise日本ロケーション、またはAWS Bedrock等を用いたハイブリッド構成）</li>
        <li>費用感の見積もりと予算確保（固定費が発生する構成もあるため、事前の比較検討が必要）</li>
        <li>ISMAP登録範囲の個別確認、クラウド事業者とのDPA締結</li>
        <li>3省2ガイドライン相当の組織的措置の整備（要配慮個人情報を扱う場合）</li>
        <li>利用者への同意取得・プライバシーポリシーの改定</li>
      </ul>
      <p>これらは技術・法務の両面にまたがる専門的な整理が必要で、片手間で進めるのは現実的ではありません。次のアクションとして、まずは<strong>「誰が意思決定者で、いつまでにどの範囲を実現したいか」を組織内で確認する</strong>ところから始めることをおすすめします。</p>
      <a class="back-to-toc" href="#explainer-toc">↑ 目次へ戻る</a>
    </div>

    <div class="card explainer" id="sec-refs">
      <h2><span class="sec-num">5</span>📚 参照した公式情報（一次ソース）</h2>
      <p class="sub">このページの各種ファクトの根拠となる公式ページです。すべて2026-09時点で内容を直接確認しています。</p>
      <ul>
        <li><a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash" target="_blank" rel="noopener noreferrer">Gemini 3.5 Flash モデルページ（Google Cloud公式）</a> — asia-northeast1では標準PayGo非対応・Provisioned Throughputのみ対応という表の出典（2026-09-10確認時点でも同内容）</li>
        <li><a href="https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing" target="_blank" rel="noopener noreferrer">Agent Platform の料金（Google Cloud公式）</a> — 「月額 $2,700 × GSU数」という計算例の出典</li>
        <li><a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/provisioned-throughput/purchase-provisioned-throughput" target="_blank" rel="noopener noreferrer">プロビジョンド スループットを購入する（Google Cloud公式）</a> — 「シングルゾーン プロビジョンド スループットを購入する場合は、Google Cloud アカウント担当者にお問い合わせください」の出典</li>
        <li><a href="https://www.ismap.go.jp/csm?id=cloud_service_list" target="_blank" rel="noopener noreferrer">ISMAPクラウドサービスリスト（ISMAPポータル公式）</a> — 各社の登録番号・登録単位の出典</li>
        <li><a href="https://www.ismap.go.jp/csm?id=kb_article_view&sysparm_article=KB0011070" target="_blank" rel="noopener noreferrer">ISMAPポータル公式KB0011070「生成AIサービスに関する留意点について」</a> — 個々の生成AIモデルは別途登録不要というベンダー非依存ルールの出典</li>
        <li><a href="https://cloud.google.com/gemini-enterprise/faq" target="_blank" rel="noopener noreferrer">Gemini Enterprise app FAQ（Google Cloud公式）</a> — Business版の30日間無料トライアルに関する出典</li>
        <li><a href="https://knowledge.workspace.google.com/admin/generative-ai/gemini-enterprise/turn-gemini-enterprise-on-or-off-for-users" target="_blank" rel="noopener noreferrer">Gemini Enterpriseのオン/オフ設定（Google Workspace管理者ヘルプ公式）</a> — 「Gemini EnterpriseはGoogle Workspaceのサブスクリプションに含まれない」の出典</li>
        <li><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Gemini API利用規約（Google AI for Developers公式）</a> — Google AI Studio経由のAPIキーはデータが「あらゆる国」で保存されうるという出典</li>
        <li><a href="https://aws.amazon.com/jp/blogs/news/amazon-bedrock-ismap/" target="_blank" rel="noopener noreferrer">Amazon Bedrock は ISMAP の言明対象であることについての考え方（AWS公式ブログ）</a> — Bedrock上の個別モデルはISMAP別途登録不要という見解の出典</li>
        <li><a href="https://arxiv.org/abs/2506.12103" target="_blank" rel="noopener noreferrer">The Amazon Nova Family of Models: Technical Report and Model Card（arXiv 2506.12103）</a> — Amazon Nova ProのDocVQA 93.5%の出典</li>
      </ul>
      <p class="footnote">※上記はいずれも一次情報（ベンダー公式ドキュメント）です。第三者の集計サイトやまとめ記事は根拠として使用していません。<strong>例外</strong>：本文中の「Gemini 3.5 FlashのDocVQA 94%」という数値は、今回の見直しでGoogle公式の一次ソースに再度たどり着けず、未検証のまま記載しています。数値の正確性が重要な場面では、この点を踏まえて別途確認してください。</p>
      <a class="back-to-toc" href="#explainer-toc">↑ 目次へ戻る</a>
    </div>
  \`;

  let activeSurveyIdx = 0;
  let activeView = "summary";

  function countByOrder(responses, field, order) {
    const counts = new Map();
    for (const r of responses) {
      const v = r[field];
      if (v === undefined || v === null || v === "") continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    const result = [];
    for (const label of order) {
      result.push({ label, count: counts.get(label) || 0 });
      counts.delete(label);
    }
    for (const [label, count] of counts) {
      result.push({ label, count });
    }
    return result;
  }

  function countFreeform(responses, field) {
    const counts = new Map();
    for (const r of responses) {
      const v = r[field];
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }

  function countTopics(responses) {
    const counts = new Map();
    for (const r of responses) {
      for (const t of r.topics || []) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }

  function barChart(title, rows, total) {
    const max = Math.max(1, ...rows.map((r) => r.count));
    const bars = rows
      .map(
        (r) => \`
      <div class="bar-row">
        <div class="bar-label">\${escapeHtml(r.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:\${(r.count / max) * 100}%"></div></div>
        <div class="bar-count">\${r.count}\${total ? \` (\${Math.round((r.count / total) * 100)}%)\` : ""}</div>
      </div>\`
      )
      .join("");
    return \`<div class="card"><h2>\${escapeHtml(title)}</h2>\${bars || '<p class="empty">データなし</p>'}</div>\`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderSummary(survey) {
    const total = survey.responses.length;
    const satisfaction = countByOrder(survey.responses, "satisfaction", SATISFACTION_ORDER);
    const difficulty = countByOrder(survey.responses, "difficulty", DIFFICULTY_ORDER);
    const usefulness = countByOrder(survey.responses, "usefulness", USEFULNESS_ORDER);
    const affiliation = countFreeform(survey.responses, "affiliation");
    const topics = countTopics(survey.responses);

    let html = '<div class="grid-2">';
    html += barChart("満足度", satisfaction, total);
    html += barChart("難易度", difficulty, total);
    html += barChart("業務への活用見込み", usefulness, total);
    html += barChart("所属", affiliation, total);
    html += "</div>";
    html += barChart("参考になった項目（複数選択）", topics, total);

    html += renderFreeTextSection(survey.responses, "tryAtWork", "職場に持ち帰って試してみたいこと・取り組みたい課題");
    html += renderFreeTextSection(survey.responses, "impression", "研修全体の感想・改善してほしい点");
    html += renderFreeTextSection(survey.responses, "futureTopic", "今後希望するテーマ");

    return html;
  }

  function renderFreeTextSection(responses, field, title) {
    const items = responses.filter((r) => r[field]);
    if (items.length === 0) return "";
    const body = items
      .map(
        (r) => \`<div class="free-text-item"><span class="meta">回答\${escapeHtml(r.id)} ・ \${escapeHtml(r.submittedAt || "")}</span>\${escapeHtml(r[field])}</div>\`
      )
      .join("");
    return \`<div class="card free-text-block"><h3>\${escapeHtml(title)}（\${items.length}件）</h3>\${body}</div>\`;
  }

  function renderIndividual(survey) {
    return survey.responses
      .map((r) => {
        const topics = (r.topics || []).map((t) => \`<span class="tag">\${escapeHtml(t)}</span>\`).join("");
        const row = (label, value) =>
          value ? \`<dt>\${escapeHtml(label)}</dt><dd>\${escapeHtml(value)}</dd>\` : "";
        return \`
        <div class="response-card">
          <div class="response-head">
            <span class="rid">回答 #\${escapeHtml(r.id)}</span>
            <span>\${escapeHtml(r.submittedAt || "")} / \${escapeHtml(r.affiliation || "")}</span>
          </div>
          <dl class="qa">
            \${row("満足度", r.satisfaction)}
            \${row("難易度", r.difficulty)}
            <dt>参考になった項目</dt><dd>\${topics || '<span class="empty">なし</span>'}</dd>
            \${row("業務への活用見込み", r.usefulness)}
            \${row("試してみたいこと", r.tryAtWork)}
            \${row("感想・改善点", r.impression)}
            \${row("今後希望するテーマ", r.futureTopic)}
          </dl>
        </div>\`;
      })
      .join("");
  }

  function render() {
    const survey = surveys[activeSurveyIdx];
    const tabsEl = document.getElementById("surveyTabs");
    tabsEl.innerHTML = surveys
      .map(
        (s, i) =>
          \`<button data-idx="\${i}" class="\${i === activeSurveyIdx ? "active" : ""}">\${escapeHtml(s.meta?.fetchedAt || s.file)} ・ \${s.responses.length}件</button>\`
      )
      .join("");
    tabsEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSurveyIdx = Number(btn.dataset.idx);
        render();
      });
    });

    const content = document.getElementById("content");
    const meta = survey.meta || {};
    content.innerHTML = \`
      <div class="survey-meta">
        <span>📋 \${escapeHtml(meta.title || "")}</span>
        <span>回答数: \${survey.responses.length}件</span>
        <span>取得日: \${escapeHtml(meta.fetchedAt || "")}</span>
      </div>
      <div class="view-tabs">
        <button data-view="summary" class="\${activeView === "summary" ? "active" : ""}">集計</button>
        <button data-view="individual" class="\${activeView === "individual" ? "active" : ""}">個別回答</button>
        <button data-view="explainer" class="\${activeView === "explainer" ? "active" : ""}">📎 個人情報×AI活用の解説</button>
      </div>
      <div id="viewBody"></div>
    \`;
    content.querySelectorAll(".view-tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeView = btn.dataset.view;
        render();
      });
    });
    document.getElementById("viewBody").innerHTML =
      activeView === "summary" ? renderSummary(survey)
      : activeView === "individual" ? renderIndividual(survey)
      : EXPLAINER_HTML;
  }

  render();
})();
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, "utf-8");
console.log(`生成しました: ${path.relative(root, outFile)}（${surveys.length}件のアンケート、${files.join(", ")}）`);
