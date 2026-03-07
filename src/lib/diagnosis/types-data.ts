/**
 * AZタイプデータ
 *
 * 職業タイプ（8） × オーラ（5） = 40タイプの定義
 *
 * 各タイプの情報：
 *   - typeKey: "Pioneer_挑戦" のような一意のキー
 *   - jobType: 職業タイプ名（英語）
 *   - jobNameJa: 職業タイプ名（日本語）
 *   - auraType: オーラ（日本語）
 *   - title: キャッチーな肩書き
 *   - description: 1〜2文の説明
 *   - strengths: 強み（3つ）
 *   - catchphrase: ひとことキャッチフレーズ
 *   - populationPercent: 人口割合（演出用・合計100%になるよう設定）
 *   - hpDefault: HPの傾向（1-10）
 *   - mpDefault: MPの傾向（1-10）
 *   - auraColor: このタイプのオーラカラー（hex）
 */

import type { JobType, AuraType } from "./questions";

export interface AZTypeData {
  typeKey: string;
  jobType: JobType;
  jobNameJa: string;
  auraType: AuraType;
  title: string;
  description: string;
  strengths: [string, string, string];
  catchphrase: string;
  populationPercent: number;
  hpDefault: number;
  mpDefault: number;
  auraColor: string;
  auraColorLight: string;
}

// ─── 職業タイプの基本情報 ────────────────────────────────────

export const JOB_TYPE_INFO: Record<
  JobType,
  { nameJa: string; emoji: string; baseDescription: string }
> = {
  Pioneer: {
    nameJa: "開拓者",
    emoji: "⚡",
    baseDescription: "未知の領域に踏み込み、新しい道を切り開く",
  },
  Architect: {
    nameJa: "設計者",
    emoji: "🏗",
    baseDescription: "仕組みと構造を作り、物事を確実に動かす",
  },
  Creator: {
    nameJa: "創造者",
    emoji: "✨",
    baseDescription: "感性と発想で、世界にまだないものを生み出す",
  },
  Strategist: {
    nameJa: "戦略家",
    emoji: "🎯",
    baseDescription: "状況を読み、最短で目標に到達する道を描く",
  },
  Healer: {
    nameJa: "癒し手",
    emoji: "🌿",
    baseDescription: "深い共感と温かさで、人の心を回復させる",
  },
  Connector: {
    nameJa: "つなぎ手",
    emoji: "🔗",
    baseDescription: "人と人、アイデアと現実をつなぎ、場を育てる",
  },
  Scholar: {
    nameJa: "探究者",
    emoji: "🔭",
    baseDescription: "深く掘り下げ、本質に到達しようとし続ける",
  },
  Storyteller: {
    nameJa: "語り手",
    emoji: "📖",
    baseDescription: "言葉と物語の力で、人の心を動かす",
  },
};

// ─── オーラの基本情報 ────────────────────────────────────────

export const AURA_INFO: Record<
  AuraType,
  { color: string; colorLight: string; emoji: string; description: string }
> = {
  挑戦: {
    color: "#F05252",
    colorLight: "#FEE8E8",
    emoji: "🔥",
    description: "情熱と勇気でリスクを取り、限界を超える",
  },
  安定: {
    color: "#38B2AC",
    colorLight: "#E6F7F6",
    emoji: "🏔",
    description: "着実さと確かさで、持続的な成果を積み上げる",
  },
  創造: {
    color: "#9060E0",
    colorLight: "#F0EAFC",
    emoji: "🌈",
    description: "独自の視点と表現で、新しい世界を作り出す",
  },
  探究: {
    color: "#4090E0",
    colorLight: "#E8F2FD",
    emoji: "🔭",
    description: "好奇心と洞察力で、物事の本質に迫る",
  },
  奉仕: {
    color: "#38C074",
    colorLight: "#E8F9EF",
    emoji: "🌱",
    description: "思いやりと利他心で、周りの人を支え育てる",
  },
};

// ─── 40タイプのデータ ────────────────────────────────────────
// 職業タイプ × オーラ の全組み合わせ

export const AZ_TYPES: AZTypeData[] = [
  // ── Pioneer ──────────────────────────────────────────────
  {
    typeKey: "Pioneer_挑戦",
    jobType: "Pioneer",
    jobNameJa: "開拓者",
    auraType: "挑戦",
    title: "炎の開拓者",
    description:
      "誰も踏み込んでいない場所に最初に立ち、情熱の炎で道を切り開く。失敗を恐れず、むしろそれを栄養にして突き進む。",
    strengths: ["圧倒的な行動力", "逆境での底力", "ゼロからイチを作る力"],
    catchphrase: "まだ誰も行っていない、だから行く。",
    populationPercent: 5,
    hpDefault: 9,
    mpDefault: 7,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Pioneer_安定",
    jobType: "Pioneer",
    jobNameJa: "開拓者",
    auraType: "安定",
    title: "堅実な開拓者",
    description:
      "新しい道を切り開きながら、足場を固めて進む。冒険心と着実さを兼ね備え、持続的な開拓を続ける。",
    strengths: ["計画的な挑戦力", "リスク管理能力", "長期的な視野"],
    catchphrase: "確かめながら、前へ。",
    populationPercent: 4,
    hpDefault: 8,
    mpDefault: 8,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Pioneer_創造",
    jobType: "Pioneer",
    jobNameJa: "開拓者",
    auraType: "創造",
    title: "創造的開拓者",
    description:
      "アイデアの力で未知の扉を開く。常識の外側に答えを探し、誰も思いつかなかった方法で突破口を見つける。",
    strengths: ["革新的なアイデア", "既成概念を壊す力", "美的センスと行動力"],
    catchphrase: "まだない方法で、やってやる。",
    populationPercent: 4,
    hpDefault: 8,
    mpDefault: 9,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Pioneer_探究",
    jobType: "Pioneer",
    jobNameJa: "開拓者",
    auraType: "探究",
    title: "知の開拓者",
    description:
      "好奇心が羅針盤。知らない世界へ飛び込み、深く調べ、理解しながら道を作る。学びそのものが旅になる。",
    strengths: ["深い好奇心", "知識と行動の融合", "未知への耐性"],
    catchphrase: "知りたいから、進む。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Pioneer_奉仕",
    jobType: "Pioneer",
    jobNameJa: "開拓者",
    auraType: "奉仕",
    title: "先頭を走る開拓者",
    description:
      "誰かのために先頭を走る。新しい道を開くのは、自分のためだけでなく、後に続く人のため。",
    strengths: ["利他的なリーダーシップ", "仲間への影響力", "道を作る勇気"],
    catchphrase: "あなたのために、先に行く。",
    populationPercent: 3,
    hpDefault: 8,
    mpDefault: 7,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Architect ─────────────────────────────────────────────
  {
    typeKey: "Architect_挑戦",
    jobType: "Architect",
    jobNameJa: "設計者",
    auraType: "挑戦",
    title: "革命的設計者",
    description:
      "既存の仕組みを壊し、より良い構造を作る。大胆な変革と精密な設計を組み合わせ、世界を再構築する。",
    strengths: ["大胆な改革力", "システム思考", "ゼロベースで考える力"],
    catchphrase: "今ある仕組みは、最善じゃない。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Architect_安定",
    jobType: "Architect",
    jobNameJa: "設計者",
    auraType: "安定",
    title: "堅牢な設計者",
    description:
      "精密な設計で盤石な仕組みを作る。細部まで考え抜かれた構造は、長く安定して機能し続ける。",
    strengths: ["精度の高い論理力", "長期的な設計力", "安定した実行力"],
    catchphrase: "百年先を見て、今日を設計する。",
    populationPercent: 4,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Architect_創造",
    jobType: "Architect",
    jobNameJa: "設計者",
    auraType: "創造",
    title: "芸術的設計者",
    description:
      "機能だけでなく、美しさも追求する設計者。論理と感性が融合し、使う人の心まで動かす仕組みを作る。",
    strengths: ["審美的な設計力", "創造と論理の融合", "体験設計の才能"],
    catchphrase: "美しくなければ、意味がない。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Architect_探究",
    jobType: "Architect",
    jobNameJa: "設計者",
    auraType: "探究",
    title: "探究する設計者",
    description:
      "深く調べ、本質を理解した上で設計する。表面的な解決ではなく、根本から仕組みを作り直す力がある。",
    strengths: ["根本原因の分析力", "体系的な思考", "深い専門性"],
    catchphrase: "なぜ、を問い続けて設計する。",
    populationPercent: 3,
    hpDefault: 6,
    mpDefault: 9,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Architect_奉仕",
    jobType: "Architect",
    jobNameJa: "設計者",
    auraType: "奉仕",
    title: "人のための設計者",
    description:
      "人の役に立つ仕組みを作るのが使命。ユーザーの視点で設計し、多くの人の生活を楽にする。",
    strengths: ["人間中心の設計力", "課題発見力", "チームへの貢献"],
    catchphrase: "あの人が楽になる仕組みを、作る。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Creator ───────────────────────────────────────────────
  {
    typeKey: "Creator_挑戦",
    jobType: "Creator",
    jobNameJa: "創造者",
    auraType: "挑戦",
    title: "炎の創造者",
    description:
      "情熱のままに創り続ける。誰かに批判されても、ジャンルの壁を超えても、表現を止めることはない。",
    strengths: ["圧倒的な創造エネルギー", "ジャンル越境力", "批判への耐性"],
    catchphrase: "燃えているから、作れる。",
    populationPercent: 4,
    hpDefault: 8,
    mpDefault: 10,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Creator_安定",
    jobType: "Creator",
    jobNameJa: "創造者",
    auraType: "安定",
    title: "職人の創造者",
    description:
      "毎日コツコツと作り続ける職人気質の創造者。派手さより深さを追求し、長い時間をかけて傑作を生む。",
    strengths: ["継続力と完成度", "技術の熟練", "一貫した世界観"],
    catchphrase: "毎日、少しだけよくする。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Creator_創造",
    jobType: "Creator",
    jobNameJa: "創造者",
    auraType: "創造",
    title: "純粋な創造者",
    description:
      "創ることそのものが喜び。世界をひとつの大きなキャンバスと見て、独自の視点で形にし続ける。",
    strengths: ["独創的な表現力", "深い感受性", "美への純粋な追求"],
    catchphrase: "この感覚、まだ誰も形にしていない。",
    populationPercent: 5,
    hpDefault: 7,
    mpDefault: 10,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Creator_探究",
    jobType: "Creator",
    jobNameJa: "創造者",
    auraType: "探究",
    title: "研究する創造者",
    description:
      "深く調べ、理解した上で作る。知識が作品に深みを与え、表面的ではない本質的な表現になる。",
    strengths: ["知識に裏打ちされた表現", "テーマへの深い洞察", "独自の研究力"],
    catchphrase: "知れば知るほど、作れるものが増える。",
    populationPercent: 3,
    hpDefault: 6,
    mpDefault: 9,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Creator_奉仕",
    jobType: "Creator",
    jobNameJa: "創造者",
    auraType: "奉仕",
    title: "贈り物の創造者",
    description:
      "誰かを喜ばせるために創る。作品はギフト。受け取った人の笑顔が、次の創造へのエネルギーになる。",
    strengths: ["受け手への共感力", "喜びを生む創造力", "心が伝わる表現"],
    catchphrase: "誰かの心に届くものを、作りたい。",
    populationPercent: 4,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Strategist ────────────────────────────────────────────
  {
    typeKey: "Strategist_挑戦",
    jobType: "Strategist",
    jobNameJa: "戦略家",
    auraType: "挑戦",
    title: "攻めの戦略家",
    description:
      "大胆な戦略で勝機をつかむ。リスクを計算した上で果敢に攻め、誰よりも速く頂点を目指す。",
    strengths: ["大局観と決断力", "積極的な機会創出", "逆転の発想力"],
    catchphrase: "勝てる戦だけ、選んで戦う。",
    populationPercent: 3,
    hpDefault: 8,
    mpDefault: 8,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Strategist_安定",
    jobType: "Strategist",
    jobNameJa: "戦略家",
    auraType: "安定",
    title: "磐石の戦略家",
    description:
      "データと論理に基づき、着実に勝利を積み重ねる。感情に流されず、長期的な視点で最適解を選ぶ。",
    strengths: ["冷静な分析力", "一貫した戦略実行", "リスクへの対応力"],
    catchphrase: "感情ではなく、論理で勝つ。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Strategist_創造",
    jobType: "Strategist",
    jobNameJa: "戦略家",
    auraType: "創造",
    title: "革新的戦略家",
    description:
      "型にはまらない戦略で相手の想定外を突く。創造的なアプローチで、ゲームのルールごと書き換える。",
    strengths: ["非線形な思考", "独創的な問題解決", "パラダイムシフト力"],
    catchphrase: "誰もやらない方法で、勝つ。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Strategist_探究",
    jobType: "Strategist",
    jobNameJa: "戦略家",
    auraType: "探究",
    title: "知的戦略家",
    description:
      "深い洞察から戦略を立てる。表面的な情報に惑わされず、本質を掴んだ上で最良の一手を選ぶ。",
    strengths: ["深い情報収集力", "本質把握力", "長期的シナリオ設計"],
    catchphrase: "知っている量が、勝負を決める。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 10,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Strategist_奉仕",
    jobType: "Strategist",
    jobNameJa: "戦略家",
    auraType: "奉仕",
    title: "仲間のための戦略家",
    description:
      "チームが勝つための戦略を描く。個人の利益より全体の成功を優先し、みんなが輝ける道筋を作る。",
    strengths: ["チーム視点の戦略力", "メンバーの強みを生かす力", "共感的な課題解決"],
    catchphrase: "みんなが勝てる戦略を、考える。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Healer ────────────────────────────────────────────────
  {
    typeKey: "Healer_挑戦",
    jobType: "Healer",
    jobNameJa: "癒し手",
    auraType: "挑戦",
    title: "勇敢な癒し手",
    description:
      "傷ついた人がいたら、誰よりも先に駆けつける。怖くても立ち向かい、心の回復を助ける強さを持つ。",
    strengths: ["積極的なサポート力", "困難な場への対応力", "強い使命感"],
    catchphrase: "あなたのそばに、必ず行く。",
    populationPercent: 3,
    hpDefault: 8,
    mpDefault: 7,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Healer_安定",
    jobType: "Healer",
    jobNameJa: "癒し手",
    auraType: "安定",
    title: "静かな癒し手",
    description:
      "波のない深い湖のように、静かに人を支える。大きな言葉は使わないが、そこにいるだけで安心できる。",
    strengths: ["深い安心感の提供", "長期的なサポート力", "揺るぎない存在感"],
    catchphrase: "ここにいるから、大丈夫。",
    populationPercent: 4,
    hpDefault: 7,
    mpDefault: 7,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Healer_創造",
    jobType: "Healer",
    jobNameJa: "癒し手",
    auraType: "創造",
    title: "芸術的癒し手",
    description:
      "言葉や表現の力で心を癒す。音楽・絵・詩など、創造的な方法で人の痛みに寄り添い、回復を助ける。",
    strengths: ["表現による癒し", "感性的な共感力", "創造的なケア"],
    catchphrase: "この表現が、誰かの心に届く。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Healer_探究",
    jobType: "Healer",
    jobNameJa: "癒し手",
    auraType: "探究",
    title: "深い癒し手",
    description:
      "表面的な症状ではなく、根本的な原因を探る。じっくり対話し、その人だけの回復の道を一緒に見つける。",
    strengths: ["根本原因への洞察", "深い傾聴力", "個別化されたサポート"],
    catchphrase: "なぜ傷ついたか、一緒に探ろう。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 8,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Healer_奉仕",
    jobType: "Healer",
    jobNameJa: "癒し手",
    auraType: "奉仕",
    title: "純粋な癒し手",
    description:
      "ただ純粋に、誰かの力になりたい。その思いだけで動く。見返りを求めず、ひたすら与え続ける。",
    strengths: ["純粋な利他心", "疲れを知らないサポート力", "人を信頼する力"],
    catchphrase: "あなたが元気になることが、私の喜び。",
    populationPercent: 4,
    hpDefault: 7,
    mpDefault: 7,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Connector ─────────────────────────────────────────────
  {
    typeKey: "Connector_挑戦",
    jobType: "Connector",
    jobNameJa: "つなぎ手",
    auraType: "挑戦",
    title: "開拓するつなぎ手",
    description:
      "まだつながっていないものをつなぐ。異業種・異文化・価値観の異なる人たちを積極的につなぎ、化学反応を起こす。",
    strengths: ["ネットワーク構築力", "多様性への適応力", "化学反応を生む力"],
    catchphrase: "この二人が出会ったら、世界が変わる。",
    populationPercent: 3,
    hpDefault: 8,
    mpDefault: 8,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Connector_安定",
    jobType: "Connector",
    jobNameJa: "つなぎ手",
    auraType: "安定",
    title: "信頼のつなぎ手",
    description:
      "長年かけて築いた深い信頼関係が武器。安定した関係性の中でつながりを育て、コミュニティを守る。",
    strengths: ["深い信頼関係の構築", "コミュニティの維持力", "長期的な縁の醸成"],
    catchphrase: "縁は、ゆっくり深める。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 7,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Connector_創造",
    jobType: "Connector",
    jobNameJa: "つなぎ手",
    auraType: "創造",
    title: "創造的つなぎ手",
    description:
      "想像力でまだない接点を発見する。アートやアイデアを媒介に人をつなぎ、新しい場や文化を生む。",
    strengths: ["創造的なマッチング力", "場の雰囲気を作る力", "文化の架け橋"],
    catchphrase: "このアイデアが、二つの世界をつなぐ。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Connector_探究",
    jobType: "Connector",
    jobNameJa: "つなぎ手",
    auraType: "探究",
    title: "知のつなぎ手",
    description:
      "知識と人をつなぐ。誰が何を知っているかを把握し、必要な人に必要な情報と人材を届ける。",
    strengths: ["広い知識ネットワーク", "情報と人を結ぶ力", "知的好奇心によるつながり"],
    catchphrase: "あの人が知ってる。紹介する。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 8,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Connector_奉仕",
    jobType: "Connector",
    jobNameJa: "つなぎ手",
    auraType: "奉仕",
    title: "縁の守り人",
    description:
      "人のために縁をつなぐ。自分のためではなく、誰かが幸せになるために橋を架け続ける。",
    strengths: ["見返りを求めないつながり力", "コミュニティへの献身", "深い愛情"],
    catchphrase: "この縁が、あなたを救うかもしれない。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 7,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Scholar ───────────────────────────────────────────────
  {
    typeKey: "Scholar_挑戦",
    jobType: "Scholar",
    jobNameJa: "探究者",
    auraType: "挑戦",
    title: "冒険する探究者",
    description:
      "知の最前線に立つ探究者。まだ誰も答えを出していない問いに挑み、知識の地図を書き換える。",
    strengths: ["最前線への挑戦力", "難問への耐性", "知的な勇気"],
    catchphrase: "まだ誰も解いていない、だから解く。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Scholar_安定",
    jobType: "Scholar",
    jobNameJa: "探究者",
    auraType: "安定",
    title: "深淵の探究者",
    description:
      "じっくりと、しかし確実に深みへ降りていく。焦らず、一歩一歩、真実に近づく。",
    strengths: ["粘り強い探究力", "体系的な知識構築", "深い専門性"],
    catchphrase: "急がない。でも、必ず辿り着く。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 9,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Scholar_創造",
    jobType: "Scholar",
    jobNameJa: "探究者",
    auraType: "創造",
    title: "哲学的探究者",
    description:
      "知識と想像力の境界を旅する。事実から先へ、理論から向こうへ、思考実験で新しい知の地平を開く。",
    strengths: ["思考実験力", "概念の創造力", "知の融合と発展"],
    catchphrase: "もし、こうだったら？を問い続ける。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 10,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Scholar_探究",
    jobType: "Scholar",
    jobNameJa: "探究者",
    auraType: "探究",
    title: "純粋な探究者",
    description:
      "知ることそのものが喜び。答えにたどり着くより、問いを深めることに充実感を覚える。",
    strengths: ["無限の好奇心", "本質への洞察力", "知識の深化力"],
    catchphrase: "なぜ、なぜ、なぜ。問い続けることが生きること。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 10,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Scholar_奉仕",
    jobType: "Scholar",
    jobNameJa: "探究者",
    auraType: "奉仕",
    title: "伝える探究者",
    description:
      "深く知ったことを、わかりやすく伝える。知識は自分のものではなく、社会の共有財だと思っている。",
    strengths: ["知識の翻訳力", "わかりやすい説明力", "社会への還元意識"],
    catchphrase: "難しいことを、やさしく届ける。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 8,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },

  // ── Storyteller ───────────────────────────────────────────
  {
    typeKey: "Storyteller_挑戦",
    jobType: "Storyteller",
    jobNameJa: "語り手",
    auraType: "挑戦",
    title: "炎の語り手",
    description:
      "言葉を武器に、人の心に火をつける。「できる」「変えられる」という信念を、物語で証明する。",
    strengths: ["感情に火をつける力", "挑戦を鼓舞するスピーチ力", "物語で変革を起こす力"],
    catchphrase: "この話を聞いたら、動きたくなる。",
    populationPercent: 2,
    hpDefault: 8,
    mpDefault: 9,
    auraColor: "#F05252",
    auraColorLight: "#FEE8E8",
  },
  {
    typeKey: "Storyteller_安定",
    jobType: "Storyteller",
    jobNameJa: "語り手",
    auraType: "安定",
    title: "語り継ぐ人",
    description:
      "歴史と記憶を語り継ぐ。価値ある物語を丁寧に保存し、次の世代へと確実に届ける。",
    strengths: ["物語の保存と継承力", "一貫したメッセージ力", "信頼を育てる語り"],
    catchphrase: "大切なことは、消えないように語る。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#38B2AC",
    auraColorLight: "#E6F7F6",
  },
  {
    typeKey: "Storyteller_創造",
    jobType: "Storyteller",
    jobNameJa: "語り手",
    auraType: "創造",
    title: "純粋な語り手",
    description:
      "言葉そのものへの愛から語る。表現の喜びが満ちあふれ、聞く人を夢中にさせる世界を作り出す。",
    strengths: ["独自の語り口", "世界観の構築力", "言語表現の美しさ"],
    catchphrase: "この言葉で、別の世界に連れていく。",
    populationPercent: 3,
    hpDefault: 7,
    mpDefault: 9,
    auraColor: "#9060E0",
    auraColorLight: "#F0EAFC",
  },
  {
    typeKey: "Storyteller_探究",
    jobType: "Storyteller",
    jobNameJa: "語り手",
    auraType: "探究",
    title: "知を語る人",
    description:
      "深く調べた上で語る。裏付けられた物語は説得力を持ち、聞く人の認識を根底から変える。",
    strengths: ["調査に基づく語り", "説得力のある表現", "知識と物語の融合"],
    catchphrase: "事実と物語が融合すると、世界が変わる。",
    populationPercent: 2,
    hpDefault: 6,
    mpDefault: 9,
    auraColor: "#4090E0",
    auraColorLight: "#E8F2FD",
  },
  {
    typeKey: "Storyteller_奉仕",
    jobType: "Storyteller",
    jobNameJa: "語り手",
    auraType: "奉仕",
    title: "声なき人の代弁者",
    description:
      "声を上げられない人の物語を語る。誰かの痛みを言葉にし、世界が気づいていないことを伝える。",
    strengths: ["共感的な傾聴と代弁力", "社会への問題提起力", "人の物語を活かす力"],
    catchphrase: "あなたの話を、世界に届ける。",
    populationPercent: 2,
    hpDefault: 7,
    mpDefault: 8,
    auraColor: "#38C074",
    auraColorLight: "#E8F9EF",
  },
];

// ─── ユーティリティ関数 ──────────────────────────────────────

/**
 * タイプキーからタイプデータを取得
 * 例：getAZType("Pioneer", "挑戦") → { typeKey: "Pioneer_挑戦", ... }
 */
export function getAZType(
  jobType: JobType,
  auraType: AuraType
): AZTypeData | undefined {
  const key = `${jobType}_${auraType}`;
  return AZ_TYPES.find((t) => t.typeKey === key);
}
