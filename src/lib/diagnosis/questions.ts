/**
 * AZタイプ診断 - 質問データ（スライダー式）
 *
 * 15問 × 5段階スペクトラム
 * 各問は「左極」と「右極」の2タイプ軸を持つバイポーラ設計
 *
 * 職業タイプ（8種）：
 *   Pioneer / Architect / Creator / Strategist /
 *   Healer / Connector / Scholar / Storyteller
 *
 * オーラ（5種）：
 *   挑戦 / 安定 / 創造 / 探究 / 奉仕
 */

export type JobType =
  | "Pioneer"
  | "Architect"
  | "Creator"
  | "Strategist"
  | "Healer"
  | "Connector"
  | "Scholar"
  | "Storyteller";

export type AuraType = "挑戦" | "安定" | "創造" | "探究" | "奉仕";

export interface SliderPole {
  jobType: JobType;
  auraType: AuraType;
}

export interface SliderQuestion {
  id: number;
  text: string;        // 質問文
  leftLabel: string;   // 左端のラベル（2〜6文字）
  rightLabel: string;  // 右端のラベル（2〜6文字）
  leftPole: SliderPole;
  rightPole: SliderPole;
}

// ─────────────────────────────────────────────────────────────
// 15問のスライダー質問
// ─────────────────────────────────────────────────────────────

export const SLIDER_QUESTIONS: SliderQuestion[] = [
  {
    id: 1,
    text: "前に進むとき、あなたは？",
    leftLabel: "まず動く",
    rightLabel: "準備してから",
    leftPole: { jobType: "Pioneer", auraType: "挑戦" },
    rightPole: { jobType: "Architect", auraType: "安定" },
  },
  {
    id: 2,
    text: "力を一番発揮できるのは？",
    leftLabel: "何かを作るとき",
    rightLabel: "深く知るとき",
    leftPole: { jobType: "Creator", auraType: "創造" },
    rightPole: { jobType: "Scholar", auraType: "探究" },
  },
  {
    id: 3,
    text: "困ったとき、まず？",
    leftLabel: "誰かに話す",
    rightLabel: "自分で分析",
    leftPole: { jobType: "Connector", auraType: "奉仕" },
    rightPole: { jobType: "Strategist", auraType: "安定" },
  },
  {
    id: 4,
    text: "心に火がつくのは？",
    leftLabel: "新しい挑戦",
    rightLabel: "人の役に立つ",
    leftPole: { jobType: "Pioneer", auraType: "挑戦" },
    rightPole: { jobType: "Healer", auraType: "奉仕" },
  },
  {
    id: 5,
    text: "人に伝えたいのは？",
    leftLabel: "体験・物語",
    rightLabel: "知識・仕組み",
    leftPole: { jobType: "Storyteller", auraType: "創造" },
    rightPole: { jobType: "Scholar", auraType: "探究" },
  },
  {
    id: 6,
    text: "学ぶとき、スタイルは？",
    leftLabel: "試して感覚で",
    rightLabel: "理論から体系的",
    leftPole: { jobType: "Creator", auraType: "創造" },
    rightPole: { jobType: "Architect", auraType: "安定" },
  },
  {
    id: 7,
    text: "「自分らしい」成果とは？",
    leftLabel: "誰も行かない場所",
    rightLabel: "誰かが楽になった",
    leftPole: { jobType: "Pioneer", auraType: "挑戦" },
    rightPole: { jobType: "Healer", auraType: "奉仕" },
  },
  {
    id: 8,
    text: "チームでの自分は？",
    leftLabel: "全体を設計",
    rightLabel: "人をつなぐ",
    leftPole: { jobType: "Architect", auraType: "安定" },
    rightPole: { jobType: "Connector", auraType: "奉仕" },
  },
  {
    id: 9,
    text: "決断の最後の決め手は？",
    leftLabel: "「これだ」の直感",
    rightLabel: "比べて検証した結論",
    leftPole: { jobType: "Creator", auraType: "創造" },
    rightPole: { jobType: "Strategist", auraType: "安定" },
  },
  {
    id: 10,
    text: "深く心が動くのは？",
    leftLabel: "誰かの物語",
    rightLabel: "問いの答え",
    leftPole: { jobType: "Storyteller", auraType: "創造" },
    rightPole: { jobType: "Scholar", auraType: "探究" },
  },
  {
    id: 11,
    text: "充実した一日は？",
    leftLabel: "人と深く語った",
    rightLabel: "一つを調べ尽くした",
    leftPole: { jobType: "Connector", auraType: "奉仕" },
    rightPole: { jobType: "Scholar", auraType: "探究" },
  },
  {
    id: 12,
    text: "グループの中でのあなたは？",
    leftLabel: "先頭を走る",
    rightLabel: "言葉でビジョンを語る",
    leftPole: { jobType: "Pioneer", auraType: "挑戦" },
    rightPole: { jobType: "Storyteller", auraType: "創造" },
  },
  {
    id: 13,
    text: "判断のよりどころは？",
    leftLabel: "感情・関係性",
    rightLabel: "効率・合理性",
    leftPole: { jobType: "Healer", auraType: "奉仕" },
    rightPole: { jobType: "Strategist", auraType: "安定" },
  },
  {
    id: 14,
    text: "理想の仕事環境は？",
    leftLabel: "自由で余白がある",
    rightLabel: "整理されて明確",
    leftPole: { jobType: "Creator", auraType: "創造" },
    rightPole: { jobType: "Architect", auraType: "安定" },
  },
  {
    id: 15,
    text: "人との関わり方は？",
    leftLabel: "言葉で刺激する",
    rightLabel: "そばで支え続ける",
    leftPole: { jobType: "Storyteller", auraType: "創造" },
    rightPole: { jobType: "Healer", auraType: "奉仕" },
  },
];
