/**
 * AZ Deep 診断 — 29問 × 7軸
 *
 * Axis 1: エンジン     (Q01-Q05) → 証明/探究/貢献/創造/自由
 * Axis 2: 走行スタイル  (Q06-Q09) → スプリンター/マラソン/サーファー/マグネット
 * Axis 3: ブレーキ     (Q10-Q14) → 確定回避/評価恐怖/完璧準備/責任重圧/迷惑回避/(軽微)
 * Axis 4: 充電スタイル  (Q15-Q19) → 承認/内省/達成/交流/体感
 * Axis 5: コンパス     (Q20-Q24) → 達成/安心/自由/絆/意義
 * Axis 6: 欲求バランス  (Q25-Q29) → 生存/愛所属/力/自由/楽しみ
 * HP/MP → 軸1-6から算出
 */

export type EngineType = "証明" | "探究" | "貢献" | "創造" | "自由";
export type RunningType = "スプリンター" | "マラソン" | "サーファー" | "マグネット";
export type BrakeType = "確定回避" | "評価恐怖" | "完璧準備" | "責任重圧" | "迷惑回避" | "軽微";
export type RechargeType = "承認" | "内省" | "達成" | "交流" | "体感";
export type CompassType = "達成" | "安心" | "自由" | "絆" | "意義";
export type DesireType = "生存" | "愛所属" | "力" | "自由" | "楽しみ";

export interface DeepOption {
  id: string;
  text: string;
  axis: "engine" | "running" | "brake" | "recharge" | "compass" | "desire";
  type: EngineType | RunningType | BrakeType | RechargeType | CompassType | DesireType;
}

export interface DeepQuestion {
  id: number;
  axis: "engine" | "running" | "brake" | "recharge" | "compass" | "desire";
  axisLabel: string;
  text: string;
  subText?: string;
  options: DeepOption[];
}

export const AZ_DEEP_QUESTIONS: DeepQuestion[] = [
  // ── Axis 1: エンジン（Q01-Q05）──────────────────────────────
  {
    id: 1, axis: "engine", axisLabel: "🔥 エンジン",
    text: "一番やる気が出るのはどんな時？",
    options: [
      { id: "a", text: "自分の実力を証明できそうな時", axis: "engine", type: "証明" },
      { id: "b", text: "面白い謎や知らないことに出会った時", axis: "engine", type: "探究" },
      { id: "c", text: "誰かが困っていて、力になれると気づいた時", axis: "engine", type: "貢献" },
      { id: "d", text: "新しいものを生み出せそうだと感じた時", axis: "engine", type: "創造" },
      { id: "e", text: "自分のやり方で自由に動けると思った時", axis: "engine", type: "自由" },
    ],
  },
  {
    id: 2, axis: "engine", axisLabel: "🔥 エンジン",
    text: "「頑張ろう」と思う\n一番大きな理由は？",
    options: [
      { id: "a", text: "認められたい、実力を示したい", axis: "engine", type: "証明" },
      { id: "b", text: "もっと深く知りたい、理解したい", axis: "engine", type: "探究" },
      { id: "c", text: "誰かの笑顔や「ありがとう」が見たい", axis: "engine", type: "貢献" },
      { id: "d", text: "まだ世界にないものを形にしたい", axis: "engine", type: "創造" },
      { id: "e", text: "自分の人生を自分でデザインしたい", axis: "engine", type: "自由" },
    ],
  },
  {
    id: 3, axis: "engine", axisLabel: "🔥 エンジン",
    text: "振り返ると、自然と\n打ち込んでいたことは？",
    options: [
      { id: "a", text: "競争に勝つこと、上位を目指すこと", axis: "engine", type: "証明" },
      { id: "b", text: "気になることを徹底的に調べること", axis: "engine", type: "探究" },
      { id: "c", text: "人のサポートや、誰かを助けること", axis: "engine", type: "貢献" },
      { id: "d", text: "作品作りや、アイデアを形にすること", axis: "engine", type: "創造" },
      { id: "e", text: "自分でルールを作って進むこと", axis: "engine", type: "自由" },
    ],
  },
  {
    id: 4, axis: "engine", axisLabel: "🔥 エンジン",
    text: "「なぜ自分はこれをしているんだろう」\n一番しっくりくる答えは？",
    options: [
      { id: "a", text: "自分が有能だと感じたいから", axis: "engine", type: "証明" },
      { id: "b", text: "真実や本質を知りたいから", axis: "engine", type: "探究" },
      { id: "c", text: "大切な人や社会の役に立ちたいから", axis: "engine", type: "貢献" },
      { id: "d", text: "自分だけにしかできない表現をしたいから", axis: "engine", type: "創造" },
      { id: "e", text: "誰にも縛られず、自由でいたいから", axis: "engine", type: "自由" },
    ],
  },
  {
    id: 5, axis: "engine", axisLabel: "🔥 エンジン",
    text: "10年後、どんな自分でいたい？",
    options: [
      { id: "a", text: "圧倒的な成果で、誰もが認める実力者", axis: "engine", type: "証明" },
      { id: "b", text: "その分野を知り尽くした本物の専門家", axis: "engine", type: "探究" },
      { id: "c", text: "多くの人の力になってきた、信頼される人", axis: "engine", type: "貢献" },
      { id: "d", text: "自分の作品や表現で、世界を動かした人", axis: "engine", type: "創造" },
      { id: "e", text: "誰にも依存せず、自分の人生を歩んでいる人", axis: "engine", type: "自由" },
    ],
  },

  // ── Axis 2: 走行スタイル（Q06-Q09）──────────────────────────
  {
    id: 6, axis: "running", axisLabel: "🏃 走行スタイル",
    text: "一番「乗れてる」と感じるのは？",
    options: [
      { id: "a", text: "締め切り直前の追い込み期間", axis: "running", type: "スプリンター" },
      { id: "b", text: "毎日同じ時間に同じことを続けている時", axis: "running", type: "マラソン" },
      { id: "c", text: "面白い流れに偶然乗った時", axis: "running", type: "サーファー" },
      { id: "d", text: "「あなたじゃないとダメ」と頼られた時", axis: "running", type: "マグネット" },
    ],
  },
  {
    id: 7, axis: "running", axisLabel: "🏃 走行スタイル",
    text: "仕事や勉強を進める時、\n自然とそうなっている姿は？",
    options: [
      { id: "a", text: "短い期間に集中して一気に終わらせる", axis: "running", type: "スプリンター" },
      { id: "b", text: "毎日少しずつ、コツコツ積み上げる", axis: "running", type: "マラソン" },
      { id: "c", text: "その日の気分や流れでやることを変える", axis: "running", type: "サーファー" },
      { id: "d", text: "誰かと連携しながら、求めに応じて進める", axis: "running", type: "マグネット" },
    ],
  },
  {
    id: 8, axis: "running", axisLabel: "🏃 走行スタイル",
    text: "スランプや行き詰まりを\n感じる時は？",
    options: [
      { id: "a", text: "やることが多すぎて、集中できない時", axis: "running", type: "スプリンター" },
      { id: "b", text: "ルーティンが乱れてペースを崩した時", axis: "running", type: "マラソン" },
      { id: "c", text: "面白みがなく、直感が動かない時", axis: "running", type: "サーファー" },
      { id: "d", text: "誰にも必要とされていないと感じる時", axis: "running", type: "マグネット" },
    ],
  },
  {
    id: 9, axis: "running", axisLabel: "🏃 走行スタイル",
    text: "理想の「1日の使い方」は？",
    options: [
      { id: "a", text: "やることをリストアップして一気に片付ける", axis: "running", type: "スプリンター" },
      { id: "b", text: "朝から夜まで決まったスケジュールで動く", axis: "running", type: "マラソン" },
      { id: "c", text: "その日の気分で、やることを決める", axis: "running", type: "サーファー" },
      { id: "d", text: "誰かと一緒に過ごしながら、自然に進める", axis: "running", type: "マグネット" },
    ],
  },

  // ── Axis 3: ブレーキ（Q10-Q14）──────────────────────────────
  {
    id: 10, axis: "brake", axisLabel: "🛑 ブレーキ",
    text: "行動をためらう\n一番の理由は？",
    options: [
      { id: "a", text: "失敗が確定することへの恐れ", axis: "brake", type: "確定回避" },
      { id: "b", text: "人にどう見られるかへの不安", axis: "brake", type: "評価恐怖" },
      { id: "c", text: "まだ準備が十分でないという感覚", axis: "brake", type: "完璧準備" },
      { id: "d", text: "失敗した時に負う責任への怖さ", axis: "brake", type: "責任重圧" },
      { id: "e", text: "人に迷惑をかけてしまいそうな気持ち", axis: "brake", type: "迷惑回避" },
    ],
  },
  {
    id: 11, axis: "brake", axisLabel: "🛑 ブレーキ",
    text: "新しいことに挑戦する前に\n一番多く頭をよぎるのは？",
    options: [
      { id: "a", text: "「もし失敗したら、終わりだ」", axis: "brake", type: "確定回避" },
      { id: "b", text: "「変だと思われたら、どうしよう」", axis: "brake", type: "評価恐怖" },
      { id: "c", text: "「もっと準備してからにしよう」", axis: "brake", type: "完璧準備" },
      { id: "d", text: "「自分の判断で失敗したら取り返しがつかない」", axis: "brake", type: "責任重圧" },
      { id: "e", text: "「周りに負担をかけたくない」", axis: "brake", type: "迷惑回避" },
    ],
  },
  {
    id: 12, axis: "brake", axisLabel: "🛑 ブレーキ",
    text: "途中でやめてしまう時、\n自分の中にある一番の声は？",
    options: [
      { id: "a", text: "「失敗して、ダメだったと証明されたくない」", axis: "brake", type: "確定回避" },
      { id: "b", text: "「批判されたら、立ち直れないかも」", axis: "brake", type: "評価恐怖" },
      { id: "c", text: "「完璧にできないなら、やらない方がいい」", axis: "brake", type: "完璧準備" },
      { id: "d", text: "「自分のせいで他の人に迷惑がかかる」", axis: "brake", type: "責任重圧" },
      { id: "e", text: "「頑張ると、周りが気を使うかもしれない」", axis: "brake", type: "迷惑回避" },
    ],
  },
  {
    id: 13, axis: "brake", axisLabel: "🛑 ブレーキ",
    text: "「もう少しで行動できる」という時\n何が最後のブレーキになる？",
    options: [
      { id: "a", text: "結果が出てしまうことへの怖さ", axis: "brake", type: "確定回避" },
      { id: "b", text: "周りからの評価や反応", axis: "brake", type: "評価恐怖" },
      { id: "c", text: "準備や情報が足りないという感覚", axis: "brake", type: "完璧準備" },
      { id: "d", text: "「自分がやっていいのか」という迷い", axis: "brake", type: "責任重圧" },
      { id: "e", text: "「お願いしてもいいのか」という遠慮", axis: "brake", type: "迷惑回避" },
    ],
  },
  {
    id: 14, axis: "brake", axisLabel: "🛑 ブレーキ",
    text: "行動した後、後悔するとしたら\n一番多いのは？",
    options: [
      { id: "a", text: "「やっぱり、うまくいかなかった」という失望", axis: "brake", type: "確定回避" },
      { id: "b", text: "「あの人にどう見られたんだろう」という不安", axis: "brake", type: "評価恐怖" },
      { id: "c", text: "「もっと準備すればよかった」という後悔", axis: "brake", type: "完璧準備" },
      { id: "d", text: "「自分の判断は正しかったのか」という迷い", axis: "brake", type: "責任重圧" },
      { id: "e", text: "「あの人に迷惑をかけてしまった」という罪悪感", axis: "brake", type: "迷惑回避" },
    ],
  },

  // ── Axis 4: 充電スタイル（Q15-Q19）──────────────────────────
  {
    id: 15, axis: "recharge", axisLabel: "⚡ 充電スタイル",
    text: "疲れた時、一番回復するのは？",
    options: [
      { id: "a", text: "「ありがとう」や「すごいね」と言われること", axis: "recharge", type: "承認" },
      { id: "b", text: "一人でゆっくり過ごすこと", axis: "recharge", type: "内省" },
      { id: "c", text: "何かを一つ完成させること", axis: "recharge", type: "達成" },
      { id: "d", text: "友人や家族と話すこと", axis: "recharge", type: "交流" },
      { id: "e", text: "外に出て体を動かすこと", axis: "recharge", type: "体感" },
    ],
  },
  {
    id: 16, axis: "recharge", axisLabel: "⚡ 充電スタイル",
    text: "「また頑張ろう」と思えるのは\nどんな時？",
    options: [
      { id: "a", text: "自分のことを誰かに認めてもらえた時", axis: "recharge", type: "承認" },
      { id: "b", text: "自分の気持ちを整理できた時", axis: "recharge", type: "内省" },
      { id: "c", text: "積み上げてきたものが形になった時", axis: "recharge", type: "達成" },
      { id: "d", text: "仲間と笑い合えた時", axis: "recharge", type: "交流" },
      { id: "e", text: "自然の中にいたり、体を動かした後", axis: "recharge", type: "体感" },
    ],
  },
  {
    id: 17, axis: "recharge", axisLabel: "⚡ 充電スタイル",
    text: "週末の後、月曜日に元気でいるために\n一番必要なのは？",
    options: [
      { id: "a", text: "誰かに褒められたり、必要とされる体験", axis: "recharge", type: "承認" },
      { id: "b", text: "一人でゆっくり内省する時間", axis: "recharge", type: "内省" },
      { id: "c", text: "何か一つ、やり切った達成感", axis: "recharge", type: "達成" },
      { id: "d", text: "人と話して、笑える時間", axis: "recharge", type: "交流" },
      { id: "e", text: "体を動かしたり、外の空気に触れること", axis: "recharge", type: "体感" },
    ],
  },
  {
    id: 18, axis: "recharge", axisLabel: "⚡ 充電スタイル",
    text: "この1ヶ月で一番元気が\n回復したのは、どんな瞬間？",
    options: [
      { id: "a", text: "感謝や評価をもらった瞬間", axis: "recharge", type: "承認" },
      { id: "b", text: "一人でカフェや部屋でゆっくりできた瞬間", axis: "recharge", type: "内省" },
      { id: "c", text: "積み上げていたものを完成させた瞬間", axis: "recharge", type: "達成" },
      { id: "d", text: "友人や家族と話して盛り上がった瞬間", axis: "recharge", type: "交流" },
      { id: "e", text: "運動後や自然の中にいる瞬間", axis: "recharge", type: "体感" },
    ],
  },
  {
    id: 19, axis: "recharge", axisLabel: "⚡ 充電スタイル",
    text: "エネルギーが切れた状態から\n最速で回復するには？",
    options: [
      { id: "a", text: "誰かに話を聞いてもらい、肯定してもらう", axis: "recharge", type: "承認" },
      { id: "b", text: "電話やSNSを切って、一人の時間を作る", axis: "recharge", type: "内省" },
      { id: "c", text: "小さくてもいいから、何か1つ完了させる", axis: "recharge", type: "達成" },
      { id: "d", text: "信頼できる人と食事や会話をする", axis: "recharge", type: "交流" },
      { id: "e", text: "散歩・運動・入浴など、体に働きかける", axis: "recharge", type: "体感" },
    ],
  },

  // ── Axis 5: コンパス（Q20-Q24）──────────────────────────────
  {
    id: 20, axis: "compass", axisLabel: "🧭 コンパス",
    text: "人生で一番大切にしたいのは？",
    options: [
      { id: "a", text: "成長し続け、成果を出すこと", axis: "compass", type: "達成" },
      { id: "b", text: "家族や大切な人と、安心して暮らすこと", axis: "compass", type: "安心" },
      { id: "c", text: "誰にも縛られず、自由に生きること", axis: "compass", type: "自由" },
      { id: "d", text: "信頼できる仲間と深くつながること", axis: "compass", type: "絆" },
      { id: "e", text: "社会や世界に意味のある貢献をすること", axis: "compass", type: "意義" },
    ],
  },
  {
    id: 21, axis: "compass", axisLabel: "🧭 コンパス",
    text: "仕事を選ぶ基準で\n一番外せないのは？",
    options: [
      { id: "a", text: "成長できるか、成果を出せるか", axis: "compass", type: "達成" },
      { id: "b", text: "安定していて、生活が守られるか", axis: "compass", type: "安心" },
      { id: "c", text: "自分のペースで動けるか", axis: "compass", type: "自由" },
      { id: "d", text: "信頼できるチームや人間関係があるか", axis: "compass", type: "絆" },
      { id: "e", text: "社会的に意義のある仕事か", axis: "compass", type: "意義" },
    ],
  },
  {
    id: 22, axis: "compass", axisLabel: "🧭 コンパス",
    text: "「成功した」と感じる状態とは？",
    options: [
      { id: "a", text: "目標を達成して、周囲に認められている", axis: "compass", type: "達成" },
      { id: "b", text: "家族や大切な人が健康で幸せでいる", axis: "compass", type: "安心" },
      { id: "c", text: "自分の意思で、どこでも自由に生きている", axis: "compass", type: "自由" },
      { id: "d", text: "深い信頼関係の中で、仲間と生きている", axis: "compass", type: "絆" },
      { id: "e", text: "自分の行動が、世界を少し良くしている", axis: "compass", type: "意義" },
    ],
  },
  {
    id: 23, axis: "compass", axisLabel: "🧭 コンパス",
    text: "将来への不安として\n最も大きいのは？",
    options: [
      { id: "a", text: "目標が達成できず、成長が止まること", axis: "compass", type: "達成" },
      { id: "b", text: "生活が不安定になること", axis: "compass", type: "安心" },
      { id: "c", text: "自由を失い、束縛される生活", axis: "compass", type: "自由" },
      { id: "d", text: "大切な人との関係が壊れること", axis: "compass", type: "絆" },
      { id: "e", text: "何も残せずに終わること", axis: "compass", type: "意義" },
    ],
  },
  {
    id: 24, axis: "compass", axisLabel: "🧭 コンパス",
    text: "今のあなたが\n「これだけは守りたい」と思うことは？",
    options: [
      { id: "a", text: "向上心を持ち続けること", axis: "compass", type: "達成" },
      { id: "b", text: "安心できる基盤を維持すること", axis: "compass", type: "安心" },
      { id: "c", text: "自分の選択肢を手放さないこと", axis: "compass", type: "自由" },
      { id: "d", text: "大切な人との絆を大切にすること", axis: "compass", type: "絆" },
      { id: "e", text: "自分の存在意義を持ち続けること", axis: "compass", type: "意義" },
    ],
  },

  // ── Axis 6: 欲求バランス（Q25-Q29）──────────────────────────
  {
    id: 25, axis: "desire", axisLabel: "💎 欲求バランス",
    text: "一番「安心する」のは\nどんな状況？",
    options: [
      { id: "a", text: "健康で、安全な生活が守られている時", axis: "desire", type: "生存" },
      { id: "b", text: "大切な人に愛されていると感じる時", axis: "desire", type: "愛所属" },
      { id: "c", text: "自分の能力が発揮でき、成果が出ている時", axis: "desire", type: "力" },
      { id: "d", text: "誰にも制限されず、自由に動ける時", axis: "desire", type: "自由" },
      { id: "e", text: "好奇心が満たされ、楽しいことに没頭している時", axis: "desire", type: "楽しみ" },
    ],
  },
  {
    id: 26, axis: "desire", axisLabel: "💎 欲求バランス",
    text: "一番「満たされない」と\n感じるのは？",
    options: [
      { id: "a", text: "体調が悪い時や、将来への不安がある時", axis: "desire", type: "生存" },
      { id: "b", text: "孤独で、誰ともつながれない時", axis: "desire", type: "愛所属" },
      { id: "c", text: "自分が無能だと感じたり、評価されない時", axis: "desire", type: "力" },
      { id: "d", text: "やりたいことができず、制限される時", axis: "desire", type: "自由" },
      { id: "e", text: "毎日が退屈で、面白いことが何もない時", axis: "desire", type: "楽しみ" },
    ],
  },
  {
    id: 27, axis: "desire", axisLabel: "💎 欲求バランス",
    text: "もっと手に入れたいと\n思うものは？",
    options: [
      { id: "a", text: "健康・安全・安定した生活基盤", axis: "desire", type: "生存" },
      { id: "b", text: "愛し愛される深い関係", axis: "desire", type: "愛所属" },
      { id: "c", text: "認められる成果と自信", axis: "desire", type: "力" },
      { id: "d", text: "選択肢と行動の自由", axis: "desire", type: "自由" },
      { id: "e", text: "ワクワクする体験と好奇心を満たす日々", axis: "desire", type: "楽しみ" },
    ],
  },
  {
    id: 28, axis: "desire", axisLabel: "💎 欲求バランス",
    text: "人生で絶対に\n失いたくないものは？",
    options: [
      { id: "a", text: "健康と、生活の安定", axis: "desire", type: "生存" },
      { id: "b", text: "大切な人との関係性", axis: "desire", type: "愛所属" },
      { id: "c", text: "自分の能力と成し遂げた成果", axis: "desire", type: "力" },
      { id: "d", text: "自分の意思で行動できる自由", axis: "desire", type: "自由" },
      { id: "e", text: "好奇心とユーモアを持ち続けること", axis: "desire", type: "楽しみ" },
    ],
  },
  {
    id: 29, axis: "desire", axisLabel: "💎 欲求バランス",
    text: "理想の毎日に\n欠かせないのは？",
    options: [
      { id: "a", text: "規則正しく、体も心も安定していること", axis: "desire", type: "生存" },
      { id: "b", text: "誰かと笑い合い、温かい時間を持てること", axis: "desire", type: "愛所属" },
      { id: "c", text: "何かを成し遂げ、自分の成長を感じること", axis: "desire", type: "力" },
      { id: "d", text: "予定に縛られず、好きなことを選べること", axis: "desire", type: "自由" },
      { id: "e", text: "新しい発見や楽しいことが、少しでもあること", axis: "desire", type: "楽しみ" },
    ],
  },
];
