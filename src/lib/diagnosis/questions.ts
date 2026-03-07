/**
 * AZタイプ診断 - 質問データ（3フォーマット混合・16問）
 *
 * Part 1（Q1〜Q6）   バイポーラスライダー：動き方・思考スタイルを連続軸で測る
 * Part 2（Q7〜Q11）  シナリオ4択：具体的な場面で自分に近い行動を選ぶ
 * Part 3（Q12〜Q16） 共感度スライダー：1文への当てはまり度を5段階で答える
 *
 * 設計原則
 *   - Part1 の左右軸に「良い/悪い」を作らない（どちらも等価な個性）
 *   - Part2 の4択はどれもそれなりに自分っぽく見える選択肢にする
 *   - Part3 の文章は具体的かつ人によって刺さり方が分かれる表現にする
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

// ─── Part 1: バイポーラスライダー ────────────────────────────

export interface BipolarQuestion {
  id: number;
  part: 1;
  type: "bipolar";
  text: string;
  leftLabel: string;   // 左極の短いラベル
  rightLabel: string;  // 右極の短いラベル
  leftPole: { jobType: JobType; auraType: AuraType };
  rightPole: { jobType: JobType; auraType: AuraType };
}

// ─── Part 2: シナリオ4択 ─────────────────────────────────────

export interface ScenarioOption {
  id: "a" | "b" | "c" | "d";
  text: string;
  jobType: JobType;
  auraType: AuraType;
}

export interface ScenarioQuestion {
  id: number;
  part: 2;
  type: "scenario";
  text: string;        // \n で改行可
  options: ScenarioOption[];
}

// ─── Part 3: 共感度スライダー ─────────────────────────────────

export interface AgreementQuestion {
  id: number;
  part: 3;
  type: "agreement";
  statement: string;   // 「〜」形式の短い文
  targetJobType: JobType;
  targetAuraType: AuraType;
}

// ─── ユニオン型 ───────────────────────────────────────────────

export type DiagnosisQuestion =
  | BipolarQuestion
  | ScenarioQuestion
  | AgreementQuestion;

// ─────────────────────────────────────────────────────────────
// 16問の質問データ
// ─────────────────────────────────────────────────────────────

export const MIXED_QUESTIONS: DiagnosisQuestion[] = [

  // ── Part 1: バイポーラスライダー（Q1〜Q6） ──────────────────

  {
    id: 1, part: 1, type: "bipolar",
    text: "動き出すとき、エネルギーが湧くのは？",
    leftLabel: "未開の道を歩くとき",
    rightLabel: "誰かの顔が変わるとき",
    leftPole:  { jobType: "Pioneer",  auraType: "挑戦" },
    rightPole: { jobType: "Healer",   auraType: "奉仕" },
  },
  {
    id: 2, part: 1, type: "bipolar",
    text: "ものごとを進める感覚は？",
    leftLabel: "感覚と直感で動く",
    rightLabel: "情報を集めて論理で進む",
    leftPole:  { jobType: "Creator",    auraType: "創造" },
    rightPole: { jobType: "Strategist", auraType: "安定" },
  },
  {
    id: 3, part: 1, type: "bipolar",
    text: "新しいことを始めるとき",
    leftLabel: "動きながら形にする",
    rightLabel: "準備が整ってから進む",
    leftPole:  { jobType: "Pioneer",   auraType: "挑戦" },
    rightPole: { jobType: "Architect", auraType: "安定" },
  },
  {
    id: 4, part: 1, type: "bipolar",
    text: "考えが整理されるのは？",
    leftLabel: "一人で深く考えるとき",
    rightLabel: "誰かと話しているとき",
    leftPole:  { jobType: "Scholar",    auraType: "探究" },
    rightPole: { jobType: "Connector",  auraType: "奉仕" },
  },
  {
    id: 5, part: 1, type: "bipolar",
    text: "人に届けたいのは？",
    leftLabel: "体験や感情の物語",
    rightLabel: "役立つ知識や仕組み",
    leftPole:  { jobType: "Storyteller", auraType: "創造" },
    rightPole: { jobType: "Architect",   auraType: "探究" },
  },
  {
    id: 6, part: 1, type: "bipolar",
    text: "新しいことと向き合うとき",
    leftLabel: "試しながら体でつかむ",
    rightLabel: "なぜかを理解してから",
    leftPole:  { jobType: "Creator", auraType: "創造" },
    rightPole: { jobType: "Scholar", auraType: "探究" },
  },

  // ── Part 2: シナリオ4択（Q7〜Q11） ───────────────────────────

  {
    id: 7, part: 2, type: "scenario",
    text: "チームプロジェクトがスタートした。\nあなたが自然になるのは？",
    options: [
      { id: "a", text: "方向を決めて、先頭を走る",        jobType: "Pioneer",     auraType: "挑戦" },
      { id: "b", text: "全体を設計して整理する",          jobType: "Architect",   auraType: "安定" },
      { id: "c", text: "人と人をつなぎ、場を作る",        jobType: "Connector",   auraType: "奉仕" },
      { id: "d", text: "ビジョンを言葉にして伝える",      jobType: "Storyteller", auraType: "創造" },
    ],
  },
  {
    id: 8, part: 2, type: "scenario",
    text: "なにも予定のない休日。\n一番充実しそうな過ごし方は？",
    options: [
      { id: "a", text: "知らない場所や体験を探しに行く",            jobType: "Pioneer",   auraType: "探究" },
      { id: "b", text: "ずっと気になっていたことを調べ尽くす",      jobType: "Scholar",   auraType: "探究" },
      { id: "c", text: "何かを作ったり、表現することに没頭する",    jobType: "Creator",   auraType: "創造" },
      { id: "d", text: "大切な人とゆっくり深く話し込む",            jobType: "Connector", auraType: "奉仕" },
    ],
  },
  {
    id: 9, part: 2, type: "scenario",
    text: "友人がうまくいかないことを話してくれた。\nあなたがとる行動は？",
    options: [
      { id: "a", text: "解決策をいくつか整理して提案する",        jobType: "Strategist", auraType: "挑戦" },
      { id: "b", text: "なぜそうなったのか、一緒に掘り下げる",    jobType: "Scholar",    auraType: "探究" },
      { id: "c", text: "ただひたすら話を聞いて、気持ちに寄り添う", jobType: "Healer",     auraType: "奉仕" },
      { id: "d", text: "助けになりそうな人や情報をつなぐ",        jobType: "Connector",  auraType: "奉仕" },
    ],
  },
  {
    id: 10, part: 2, type: "scenario",
    text: "何かを決めるとき、\n最後の決め手になるのは？",
    options: [
      { id: "a", text: "「やってみたい」という感覚",          jobType: "Pioneer",    auraType: "挑戦" },
      { id: "b", text: "データや過去の実績から見た確度",      jobType: "Strategist", auraType: "安定" },
      { id: "c", text: "「自分らしいか」という直感",          jobType: "Creator",    auraType: "創造" },
      { id: "d", text: "「誰かの役に立つか」という軸",        jobType: "Healer",     auraType: "奉仕" },
    ],
  },
  {
    id: 11, part: 2, type: "scenario",
    text: "「ああ、うまくいった」と感じる瞬間。\nどれが一番近い？",
    options: [
      { id: "a", text: "自分の計画通りに、きれいに動いた",      jobType: "Architect",   auraType: "安定" },
      { id: "b", text: "自分の言葉が、誰かの心に刺さった",      jobType: "Storyteller", auraType: "創造" },
      { id: "c", text: "バラバラだったチームがひとつになった",  jobType: "Connector",   auraType: "奉仕" },
      { id: "d", text: "誰かが抱えていた重さが、少し軽くなった", jobType: "Healer",      auraType: "奉仕" },
    ],
  },

  // ── Part 3: 共感度スライダー（Q12〜Q16） ──────────────────────
  // 設計方針：1タイプだけが反応する問いにせず、
  //           複数タイプがそれぞれの理由で共感できる文を混ぜる

  {
    id: 12, part: 3, type: "agreement",
    // Pioneer が強く反応するが、Scholar・Creator も「まだ誰も気づいていない」文脈で共感できる
    statement: "まだ誰も気にしていないことに、いち早く気づいて動きたい",
    targetJobType:  "Pioneer",
    targetAuraType: "挑戦",
  },
  {
    id: 13, part: 3, type: "agreement",
    // Healer が一番共感するが、Connector・Storyteller も「場の変化を感じる」で共感できる
    statement: "自分がそこにいることで、場が少し柔らかくなる感じが好きだ",
    targetJobType:  "Healer",
    targetAuraType: "奉仕",
  },
  {
    id: 14, part: 3, type: "agreement",
    // Storyteller メインだが、Creator・Connector も「感じたことを伝えたい」で共感できる
    statement: "自分の感じたことや見えた景色を、誰かと共有せずにはいられない",
    targetJobType:  "Storyteller",
    targetAuraType: "創造",
  },
  {
    id: 15, part: 3, type: "agreement",
    // Strategist メインだが、Architect・Scholar も「整理されてスッキリ」で共感できる
    statement: "複雑に見えることが整理されて、スッキリ見えてくると気持ちいい",
    targetJobType:  "Strategist",
    targetAuraType: "安定",
  },
  {
    id: 16, part: 3, type: "agreement",
    // Scholar メインだが、Strategist・Pioneer も「表面でなく本質を知りたい」で共感できる
    statement: "表面的な答えより、その裏にある本当の理由を知りたくなる",
    targetJobType:  "Scholar",
    targetAuraType: "探究",
  },
];

// ─── パート区切り情報 ─────────────────────────────────────────

export const PART_INFO = {
  1: { label: "あなたの動き方",       range: [1, 6]  as const },
  2: { label: "あなたが大切にするもの", range: [7, 11] as const },
  3: { label: "あなた自身への問い",    range: [12, 16] as const },
} as const;
