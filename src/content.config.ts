import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

/**
 * 9 トピックのコンテンツコレクション。
 * frontmatter は厳格に型定義し、本文（MDX）は C1〜C3 で順次充実させる。
 */
const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    order: z.number().int().min(1).max(9),
    title: z.string().min(1),
    /** 英語カテゴリラベル（"Transcription" 等、デザイン上のラベル） */
    category: z.string().min(1),
    /** 1文字の絵文字アイコン */
    icon: z.string().min(1),
    /** カード一覧用の1行サマリー（30字以内目安） */
    summary: z.string().min(1),
    /** 詳細ページ冒頭のリード文（1-2文） */
    lead: z.string().min(1),
    /** 想定実践時間（分） */
    estimatedMinutes: z.number().int().positive().optional(),
    /** ドラフト中フラグ。trueの間はインデックスから除外可（実装は B5/B6 で判断） */
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { topics };
