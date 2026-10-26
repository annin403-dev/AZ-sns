/**
 * ブレーキ診断（メンタルブロック診断）のデータ
 *
 * 「なぜ今動けないのか？」を4つのブレーキで可視化する
 * 結果は「あなたが悪いのではなく、脳が守ろうとしているだけ」という
 * 安全基地のメッセージとセットで返す
 */

export type BrakeType = "fear" | "perfection" | "wound" | "empty";

export interface BrakeInfo {
  type: BrakeType;
  name: string;
  nickname: string;
  emoji: string;
  color: string;
  colorLight: string;
  /** 脳科学的な説明（責めない言い方） */
  brainNote: string;
  /** AZからの安全基地メッセージ */
  safeMessage: string;
  /** このブレーキに合うマイクロステップの作り方 */
  stepStyle: string;
  /** 今日できる最初の一歩の例 */
  sampleSteps: string[];
}

export const BRAKE_INFO: Record<BrakeType, BrakeInfo> = {
  fear: {
    type: "fear",
    name: "失敗への恐怖",
    nickname: "警報装置ブレーキ",
    emoji: "🚨",
    color: "#F05252",
    colorLight: "#FEE8E8",
    brainNote:
      "新しいことを前にすると、脳の扁桃体は「未知＝危険かも」と警報を鳴らします。それは臆病さではなく、あなたを守るための正常な反応です。",
    safeMessage:
      "怖いと感じるのは、それだけ本気で大切にしている証拠だよ。警報が鳴っても、小さな一歩なら安全だと脳に教えてあげよう。",
    stepStyle: "誰にも見せない・失敗しても何も失わない「練習」サイズに分解する",
    sampleSteps: ["誰にも見せないメモに、やりたいことを1行書く", "調べたいことを検索窓に打つだけ（読まなくてOK）"],
  },
  perfection: {
    type: "perfection",
    name: "完璧主義",
    nickname: "完璧の門番ブレーキ",
    emoji: "💎",
    color: "#9060E0",
    colorLight: "#F0EAFC",
    brainNote:
      "「ちゃんとやらなきゃ」という基準が高いほど、脳は着手そのものを大きなコストと見積もり、先延ばしで負荷を避けようとします。",
    safeMessage:
      "あなたの理想が高いのは才能だよ。だから今日は、わざと60点を目指そう。完成ではなく「着手」がゴール。",
    stepStyle: "「下書き」「仮」「雑」を合言葉に、未完成のまま終える前提で設計する",
    sampleSteps: ["タイトルだけ書いて閉じる", "タイマー3分で、雑に手を動かす"],
  },
  wound: {
    type: "wound",
    name: "過去の痛み",
    nickname: "古い記憶の盾ブレーキ",
    emoji: "🛡",
    color: "#4090E0",
    colorLight: "#E8F2FD",
    brainNote:
      "過去にうまくいかなかった経験は、脳に「同じことをすると傷つく」という予測として残ります。盾は、昔のあなたを守るために必要だったものです。",
    safeMessage:
      "その盾は、これまであなたを守ってくれたもの。無理に外さなくていい。今日は盾を持ったまま、1ミリだけ前に出てみよう。",
    stepStyle: "過去と違う「新しい条件」をひとつ加えて、安全な成功体験を上書きする",
    sampleSteps: ["今日うまくいった小さなことを1つ書く", "前回と場所や時間を変えて1分だけ試す"],
  },
  empty: {
    type: "empty",
    name: "エネルギー枯渇",
    nickname: "空のバッテリーブレーキ",
    emoji: "🔋",
    color: "#38B2AC",
    colorLight: "#E6F7F6",
    brainNote:
      "睡眠・ストレス・情報過多で脳のエネルギーが減ると、前頭前野の「やる気・計画」の働きが落ちます。意志が弱いのではなく、燃料が少ないだけです。",
    safeMessage:
      "今は充電期間だよ。休むことも立派な前進。まず回復の一歩から始めよう。",
    stepStyle: "行動より先に「回復」をクエストにし、体を整える一歩から始める",
    sampleSteps: ["コップ1杯の水を飲む", "窓を開けて深呼吸を3回する"],
  },
};

export interface BrakeQuestion {
  id: string;
  text: string;
  type: BrakeType;
}

/** 8問（各ブレーキ2問ずつ） */
export const BRAKE_QUESTIONS: BrakeQuestion[] = [
  { id: "q1", text: "やろうとすると「失敗したらどうしよう」が頭に浮かぶ", type: "fear" },
  { id: "q2", text: "人にどう思われるかが気になって手が止まる", type: "perfection" },
  { id: "q3", text: "朝起きた時点で、もう疲れている感じがする", type: "empty" },
  { id: "q4", text: "前にうまくいかなかった記憶が、ふとよみがえる", type: "wound" },
  { id: "q5", text: "ちゃんと準備が整ってからじゃないと始めたくない", type: "perfection" },
  { id: "q6", text: "新しいことを考えると、胸がざわざわする", type: "fear" },
  { id: "q7", text: "好きだったことにも、最近あまり気持ちが動かない", type: "empty" },
  { id: "q8", text: "「どうせ自分は…」と思ってしまうことがある", type: "wound" },
];

export const BRAKE_SCALE = [
  { value: 0, label: "ちがう" },
  { value: 1, label: "少しある" },
  { value: 2, label: "わりとある" },
  { value: 3, label: "とてもある" },
];

export interface BrakeResult {
  primary: BrakeType;
  secondary: BrakeType | null;
  scores: Record<BrakeType, number>;
}

/** 回答（questionId → 0〜3）からブレーキを判定する */
export function scoreBrake(answers: Record<string, number>): BrakeResult {
  const scores: Record<BrakeType, number> = { fear: 0, perfection: 0, wound: 0, empty: 0 };
  for (const q of BRAKE_QUESTIONS) {
    scores[q.type] += answers[q.id] ?? 0;
  }

  // 同点の場合は、まず回復を優先する（empty → fear → perfection → wound）
  const priority: BrakeType[] = ["empty", "fear", "perfection", "wound"];
  const ranked = [...priority].sort((a, b) => scores[b] - scores[a]);

  return {
    primary: ranked[0],
    secondary: scores[ranked[1]] > 0 ? ranked[1] : null,
    scores,
  };
}
