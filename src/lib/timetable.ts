/**
 * 当日の進行表（2026-09-07 14:00-16:30、2時間30分）。
 * 講師のリハーサルに合わせて時間配分を調整可能。
 */
export interface TimetableSlot {
  /** 開始時刻 "HH:MM" */
  time: string;
  /** セクション名 */
  title: string;
  /** 補足 */
  description: string;
  /** 休憩・移行などの軽い枠を示す */
  break?: boolean;
}

export const TIMETABLE: TimetableSlot[] = [
  {
    time: '14:00',
    title: 'オープニング',
    description: '研修のねらい・参加者アンケート',
  },
  {
    time: '14:15',
    title: 'Part 1：先進事例とAIの全体像',
    description: '福祉業界の活用事例、できること・できないこと',
  },
  {
    time: '14:50',
    title: 'Part 2：実践ワーク①',
    description: '案内文・マニュアル / 議事録 / ケース記録',
  },
  {
    time: '15:40',
    title: '休憩',
    description: '10分',
    break: true,
  },
  {
    time: '15:50',
    title: 'Part 3：法令・事例の検索',
    description: 'NotebookLM / RAG で「知の即時検索」',
  },
  {
    time: '16:10',
    title: 'Part 4：個人情報とセキュリティ',
    description: '入力可否の境界、匿名化、ガイドライン',
  },
  {
    time: '16:25',
    title: 'クロージング',
    description: '明日から始める3ステップ / Q&A',
  },
];
