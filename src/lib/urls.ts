/**
 * GitHub Pages の sub-path (`/seiho-ai-study/`) を考慮した URL ヘルパー。
 *
 * Astro 7 では `astro.config.mjs` の `base` 設定値がそのまま
 * `import.meta.env.BASE_URL` に入る（末尾スラッシュは付与されない）ため、
 * 文字列結合で「`/seiho-ai-studyfavicon.svg`」のようなバグが起きやすい。
 * このヘルパーで末尾スラッシュを必ず保証する。
 */
const RAW_BASE = import.meta.env.BASE_URL;
export const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

/**
 * base path 配下のパスを返す。
 * @example withBase('favicon.svg')  // -> '/seiho-ai-study/favicon.svg'
 * @example withBase('/topics/03')   // -> '/seiho-ai-study/topics/03'
 */
export function withBase(path: string): string {
  return BASE + path.replace(/^\//, '');
}
