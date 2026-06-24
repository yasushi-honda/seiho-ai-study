import { describe, expect, it } from 'vitest';
import { buildAiUrl, toastMessage } from '../copyAndOpen';

describe('buildAiUrl', () => {
  it('ChatGPT URL に q パラメータを付与する', () => {
    const url = buildAiUrl('chatgpt', 'こんにちは');
    expect(url).toBe('https://chatgpt.com/?q=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF');
  });

  it('ChatGPT URL で URLエンコードが正しく適用される（記号・改行）', () => {
    const url = buildAiUrl('chatgpt', 'a&b c\n%/?');
    // RFC 3986: 改行 → %0A、& → %26、空白 → %20、% → %25
    expect(url).toBe('https://chatgpt.com/?q=a%26b%20c%0A%25%2F%3F');
  });

  it('Gemini URL はプロンプトを含まない（prefill 非対応のため）', () => {
    const url = buildAiUrl('gemini', '機密データ');
    expect(url).toBe('https://gemini.google.com/app');
    expect(url).not.toContain('q=');
    expect(url).not.toContain('機密');
  });

  it('空文字列でも壊れない', () => {
    expect(buildAiUrl('chatgpt', '')).toBe('https://chatgpt.com/?q=');
    expect(buildAiUrl('gemini', '')).toBe('https://gemini.google.com/app');
  });

  it('長文プロンプト（5000字）もエンコードできる', () => {
    const prompt = 'あ'.repeat(5000);
    const url = buildAiUrl('chatgpt', prompt);
    expect(url.startsWith('https://chatgpt.com/?q=')).toBe(true);
    expect(url.length).toBeGreaterThan(5000);
  });
});

describe('toastMessage', () => {
  it('copy 成功時の copy-only メッセージ', () => {
    expect(toastMessage('copy-only', true)).toBe('プロンプトをコピーしました');
  });

  it('copy 成功時の ChatGPT メッセージ', () => {
    expect(toastMessage('chatgpt', true)).toContain('ChatGPT');
    expect(toastMessage('chatgpt', true)).toContain('コピーしました');
  });

  it('copy 成功時の Gemini メッセージは手動ペーストを案内する', () => {
    const msg = toastMessage('gemini', true);
    expect(msg).toContain('Gemini');
    expect(msg).toContain('ペースト');
  });

  it('copy 失敗時は service にかかわらず失敗メッセージを返す', () => {
    expect(toastMessage('chatgpt', false)).toContain('失敗');
    expect(toastMessage('gemini', false)).toContain('失敗');
    expect(toastMessage('copy-only', false)).toContain('失敗');
  });
});
