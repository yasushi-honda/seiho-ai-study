/**
 * プロンプトのクリップボードコピー + AIサービス遷移ロジック。
 *
 * 2026-06-24 時点の調査結果:
 * - ChatGPT: `chatgpt.com/?q=PROMPT` で URL parameter prefill が可能
 *   ([OpenAI Developer Community](https://community.openai.com/t/url-query-param-to-open-chat-with-initial-message/64167))
 * - Gemini: ネイティブには URL parameter prefill 非対応
 *   ([HN #46761567](https://news.ycombinator.com/item?id=46761567))
 *   → アプリトップを開いたうえで、参加者にクリップボードからのペーストを案内する。
 */

export type AIService = 'chatgpt' | 'gemini' | 'copy-only';

const CHATGPT_BASE = 'https://chatgpt.com/';
const GEMINI_BASE = 'https://gemini.google.com/app';

/**
 * 各 AI サービスの遷移先 URL を構築する。
 * Gemini は prefill 非対応なのでプロンプトを URL に載せない。
 */
export function buildAiUrl(service: 'chatgpt' | 'gemini', prompt: string): string {
  switch (service) {
    case 'chatgpt':
      return `${CHATGPT_BASE}?q=${encodeURIComponent(prompt)}`;
    case 'gemini':
      return GEMINI_BASE;
  }
}

/**
 * 操作後にユーザーへ見せるメッセージ。
 */
export function toastMessage(service: AIService, copySucceeded: boolean): string {
  if (!copySucceeded) {
    return 'コピーに失敗しました。プロンプトを長押しして手動コピーしてください';
  }
  switch (service) {
    case 'copy-only':
      return 'プロンプトをコピーしました';
    case 'chatgpt':
      return 'コピーしました。ChatGPTを開きます';
    case 'gemini':
      return 'コピーしました。Geminiを開きます。入力欄に長押し→ペーストしてください';
  }
}

/**
 * クリップボードコピーを試みる。HTTPS / localhost 以外では失敗する。
 * フォールバックの textarea + execCommand は廃止予定だが、現状もモバイル含めて広くサポートされる。
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallthrough to legacy
    }
  }

  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    // execCommand は deprecated だが、Clipboard API 非対応環境（古い in-app browser 等）の
    // フォールバックとして現状もモバイル含めて広くサポートされている。
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

/**
 * プロンプトをコピーし、必要なら AI サービスを新タブで開く。
 * Toast 通知は呼び出し側 (showToast) に委譲する。
 */
export async function copyAndOpen(
  prompt: string,
  service: AIService,
  showToast: (msg: string) => void
): Promise<void> {
  const copied = await copyToClipboard(prompt);
  showToast(toastMessage(service, copied));

  if (!copied || service === 'copy-only') return;

  // Toast を一瞬見せてから遷移
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.open(buildAiUrl(service, prompt), '_blank', 'noopener,noreferrer');
    }
  }, 400);
}
