/**
 * AZタイプ診断 - 質問データ
 *
 * 12問 × 4択 = 48の回答
 * 各回答は「職業タイプ」と「オーラ」の2軸でスコアリング
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

export interface DiagnosisOption {
  id: string;          // "a" | "b" | "c" | "d"
  text: string;        // 選択肢テキスト
  jobType: JobType;    // 主に対応する職業タイプ
  auraType: AuraType;  // 主に対応するオーラ
}

export interface DiagnosisQuestion {
  id: number;
  text: string;              // 質問文
  subText?: string;          // 補足（任意）
  options: DiagnosisOption[];
}

// ─────────────────────────────────────────────────────────────
// 12問の質問データ
// ─────────────────────────────────────────────────────────────

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 1,
    text: "毎朝起きたとき\n「今日はこれをしたい」と思うのは？",
    options: [
      {
        id: "a",
        text: "新しいことに挑戦したい",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "計画したことを着実に進めたい",
        jobType: "Architect",
        auraType: "安定",
      },
      {
        id: "c",
        text: "好きなものを作ったり表現したい",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "誰かのために何かをしたい",
        jobType: "Healer",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 2,
    text: "チームで何かをするとき\n自然となる役割は？",
    options: [
      {
        id: "a",
        text: "みんなを引っ張る先頭",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "全体の計画を立てる人",
        jobType: "Strategist",
        auraType: "安定",
      },
      {
        id: "c",
        text: "人と人をつなぐ橋渡し役",
        jobType: "Connector",
        auraType: "奉仕",
      },
      {
        id: "d",
        text: "物語やビジョンを語る人",
        jobType: "Storyteller",
        auraType: "創造",
      },
    ],
  },
  {
    id: 3,
    text: "困っている人がいたとき\nあなたがとる行動は？",
    options: [
      {
        id: "a",
        text: "具体的な解決策をすぐ提案する",
        jobType: "Strategist",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "問題の本質を一緒に考える",
        jobType: "Scholar",
        auraType: "探究",
      },
      {
        id: "c",
        text: "ひたすら話を聞いて共感する",
        jobType: "Healer",
        auraType: "奉仕",
      },
      {
        id: "d",
        text: "助けになりそうな人や情報をつなぐ",
        jobType: "Connector",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 4,
    text: "週末の午後\n一番「自分らしい」と感じる過ごし方は？",
    options: [
      {
        id: "a",
        text: "知らない場所や体験を探索する",
        jobType: "Pioneer",
        auraType: "探究",
      },
      {
        id: "b",
        text: "本や動画で深い知識を得る",
        jobType: "Scholar",
        auraType: "探究",
      },
      {
        id: "c",
        text: "音楽・絵・文章など創作に没頭する",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "大切な人とゆっくり語り合う",
        jobType: "Connector",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 5,
    text: "何かを決めるとき\n一番重視するのは？",
    options: [
      {
        id: "a",
        text: "「やってみたら面白そう」という感覚",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "データや実績に基づく論理",
        jobType: "Strategist",
        auraType: "安定",
      },
      {
        id: "c",
        text: "「誰かの役に立つか」という軸",
        jobType: "Healer",
        auraType: "奉仕",
      },
      {
        id: "d",
        text: "「自分らしいか」という直感",
        jobType: "Creator",
        auraType: "創造",
      },
    ],
  },
  {
    id: 6,
    text: "もし自由に発信するとしたら\nどんな内容が自然？",
    options: [
      {
        id: "a",
        text: "自分が挑戦した体験記",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "役立つ知識・仕組みの解説",
        jobType: "Architect",
        auraType: "探究",
      },
      {
        id: "c",
        text: "感情や世界観を表現した作品",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "人の物語・対話・エッセイ",
        jobType: "Storyteller",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 7,
    text: "あなたが「成功した」と感じるのは\nどんなとき？",
    options: [
      {
        id: "a",
        text: "誰も挑んでいない領域を開拓したとき",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "自分の設計した仕組みがうまく動いたとき",
        jobType: "Architect",
        auraType: "安定",
      },
      {
        id: "c",
        text: "自分の言葉が誰かの心に刺さったとき",
        jobType: "Storyteller",
        auraType: "創造",
      },
      {
        id: "d",
        text: "誰かが苦しみから抜け出せたとき",
        jobType: "Healer",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 8,
    text: "新しいことを学ぶとき\n一番好きな方法は？",
    options: [
      {
        id: "a",
        text: "まず試して、失敗から学ぶ",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "全体の構造を把握してから入る",
        jobType: "Architect",
        auraType: "安定",
      },
      {
        id: "c",
        text: "深く掘り下げて本質をつかむ",
        jobType: "Scholar",
        auraType: "探究",
      },
      {
        id: "d",
        text: "人との会話の中で掴んでいく",
        jobType: "Connector",
        auraType: "探究",
      },
    ],
  },
  {
    id: 9,
    text: "周りに「あなたらしい」と言われる\n強みは？",
    options: [
      {
        id: "a",
        text: "行動力・突破力・スピード",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "段取りの良さ・論理の明確さ",
        jobType: "Architect",
        auraType: "安定",
      },
      {
        id: "c",
        text: "発想力・感受性・独自の視点",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "聞く力・共感・気配り",
        jobType: "Healer",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 10,
    text: "誰かに言われて\n一番うれしい言葉は？",
    options: [
      {
        id: "a",
        text: "「あなたを見て私も前に進めた」",
        jobType: "Storyteller",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "「あなたの計画はいつも正確だ」",
        jobType: "Strategist",
        auraType: "安定",
      },
      {
        id: "c",
        text: "「あなたの感性は本当に唯一無二だ」",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "「あなたがいると場が温かくなる」",
        jobType: "Connector",
        auraType: "奉仕",
      },
    ],
  },
  {
    id: 11,
    text: "10年後\nどんな自分でいたい？",
    subText: "一番近いものを選んでね",
    options: [
      {
        id: "a",
        text: "誰も踏み込んでいない場所で旗を立てている",
        jobType: "Pioneer",
        auraType: "挑戦",
      },
      {
        id: "b",
        text: "世界の仕組みを変えた設計者になっている",
        jobType: "Architect",
        auraType: "安定",
      },
      {
        id: "c",
        text: "自分の作品で多くの人の心を動かしている",
        jobType: "Creator",
        auraType: "創造",
      },
      {
        id: "d",
        text: "深い問いを探究し続けている",
        jobType: "Scholar",
        auraType: "探究",
      },
    ],
  },
  {
    id: 12,
    text: "「自分がいる意味」を感じるのは\nどんなとき？",
    options: [
      {
        id: "a",
        text: "誰かをつなぎ、その縁から何かが生まれたとき",
        jobType: "Connector",
        auraType: "奉仕",
      },
      {
        id: "b",
        text: "自分のストーリーが誰かの背中を押したとき",
        jobType: "Storyteller",
        auraType: "奉仕",
      },
      {
        id: "c",
        text: "誰かの心が少し軽くなったとき",
        jobType: "Healer",
        auraType: "奉仕",
      },
      {
        id: "d",
        text: "深い問いを立て、誰かが「もっと知りたい」と思ったとき",
        jobType: "Scholar",
        auraType: "探究",
      },
    ],
  },
];
