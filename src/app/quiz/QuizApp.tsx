'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Axis = 'thinking' | 'action' | 'theme' | 'energy';
type JobType = 'pioneer' | 'architect' | 'creator' | 'strategist' | 'healer' | 'connector' | 'scholar' | 'storyteller';
type AuraType = 'challenge' | 'stability' | 'creation' | 'exploration' | 'service';

interface Question {
  id: number;
  axis: Axis;
  text: string;
  lowLabel: string;
  highLabel: string;
}

interface DiagnosisResult {
  jobType: JobType;
  auraType: AuraType;
  typeName: string;
  population: number;
  hp: number;
  mp: number;
}

interface AZType {
  typeName: string;
  emoji: string;
  shortDesc: string;
  strategy: string;
  suit: string;
  weakness: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const questions: Question[] = [
  { id: 1, axis: 'thinking', text: '何か新しいことに取り組むとき、まず動いてみる方だ', lowLabel: '考えてから動く', highLabel: 'まずやってみる' },
  { id: 2, axis: 'thinking', text: '物事を判断するとき、人の気持ちを優先して考える', lowLabel: 'データや論理で判断', highLabel: '感情や関係で判断' },
  { id: 3, axis: 'thinking', text: '決まったやり方より、新しい方法を試したい', lowLabel: '実績ある方法を使う', highLabel: '新しい方法を試す' },
  { id: 4, axis: 'thinking', text: '細かい作業より、全体の方向性を考える方が好きだ', lowLabel: '細部を丁寧に', highLabel: '全体像を描く' },
  { id: 5, axis: 'action', text: '未経験のことに挑戦するとき、わくわくする', lowLabel: '不安を感じる', highLabel: 'わくわくする' },
  { id: 6, axis: 'action', text: '仕組みや計画を作ることにエネルギーを感じる', lowLabel: '動きながら考える', highLabel: '仕組みを先に作る' },
  { id: 7, axis: 'action', text: '一人でやるより、人と一緒に動く方が力が出る', lowLabel: '一人の方が集中できる', highLabel: '人と動く方が力が出る' },
  { id: 8, axis: 'action', text: '自分のアイデアや感情を外に表現したい欲求が強い', lowLabel: '内に持っておく', highLabel: '外に表現したい' },
  { id: 9, axis: 'theme', text: '限界に挑戦し、成長し続けることが人生の醍醐味だ', lowLabel: 'あまりそう思わない', highLabel: 'まったくその通り' },
  { id: 10, axis: 'theme', text: '揺るがない土台や安心できる環境を作ることが大切だ', lowLabel: 'あまりそう思わない', highLabel: 'まったくその通り' },
  { id: 11, axis: 'theme', text: '世界にないものを生み出すことに人生の意味を感じる', lowLabel: 'あまりそう思わない', highLabel: 'まったくその通り' },
  { id: 12, axis: 'theme', text: '物事の本質を深く理解することに喜びを感じる', lowLabel: 'あまりそう思わない', highLabel: 'まったくその通り' },
  { id: 13, axis: 'energy', text: '体を動かしたり、行動することでエネルギーが回復する', lowLabel: '休息で回復する', highLabel: '行動で回復する' },
  { id: 14, axis: 'energy', text: '一人で深く考えたり、内省する時間が好きだ', lowLabel: 'あまり好きでない', highLabel: 'とても好き' },
  { id: 15, axis: 'energy', text: '大勢の人と過ごした後、一人の時間が必要になる', lowLabel: 'むしろ元気になる', highLabel: '疲れて一人になりたい' },
  { id: 16, axis: 'energy', text: '落ち込んだときでも、比較的早く立ち直れる方だ', lowLabel: '立ち直るのに時間がかかる', highLabel: 'すぐ立ち直れる' },
];

const axisLabels: Record<Axis, string> = {
  thinking: '思考スタイル',
  action: '行動スタイル',
  theme: '人生テーマ',
  energy: 'エネルギー',
};

const typeData: Record<string, AZType> = {
  '挑戦パイオニア': { typeName: '挑戦パイオニア', emoji: '⚡', shortDesc: '限界を突き破りながら前進し続ける開拓者。\n誰も踏み込んだことのない領域に最初の足跡を刻む存在。', strategy: '「行動で道を作り、結果で語る」', suit: '起業・新規事業・スポーツ・冒険', weakness: '計画なき突進。立ち止まる勇気も必要。' },
  '安定パイオニア': { typeName: '安定パイオニア', emoji: '🏔️', shortDesc: '確実な歩みで新しい道を切り拓く実行者。\n土台を固めながら前に進み、揺るがない存在感を放つ。', strategy: '「一歩一歩を確実に積み重ねる」', suit: 'プロジェクト管理・長期計画・チームリード', weakness: '変化への対応が遅れることがある。' },
  '創造パイオニア': { typeName: '創造パイオニア', emoji: '🚀', shortDesc: '新しい世界を形にしながら突き進む革新者。\nアイデアを持って最前線を走り、世界を変える発明を生む。', strategy: '「作りながら進め、進みながら作れ」', suit: 'プロダクト開発・テクノロジー・クリエイティブ事業', weakness: '完成前に次のアイデアへ移りがち。' },
  '探究パイオニア': { typeName: '探究パイオニア', emoji: '🔭', shortDesc: '知と行動を融合させて未踏の地へ向かう者。\n理解しながら走り、走りながら学ぶ知的冒険家。', strategy: '「理解した瞬間に動き出せ」', suit: '研究開発・フィールドワーク・探検・教育', weakness: '深掘りと行動のバランスを取るのが難しい。' },
  '奉仕パイオニア': { typeName: '奉仕パイオニア', emoji: '🛡️', shortDesc: '人のために先陣を切る献身的な開拓者。\n誰かの笑顔のために道を切り拓き、背中で仲間を守る。', strategy: '「仲間のために一番先に飛び込め」', suit: 'NGO・医療・教育支援・コミュニティリーダー', weakness: '自分のニーズを後回しにしすぎる。' },
  '挑戦アーキテクト': { typeName: '挑戦アーキテクト', emoji: '⚙️', shortDesc: '困難な挑戦の仕組みを設計する戦略家。\n複雑な問題を構造化し、勝利への青写真を描く。', strategy: '「仕組みで挑戦を制せ」', suit: '事業設計・システム構築・戦略コンサル', weakness: '完璧な設計を求めすぎて動き出せないことも。' },
  '安定アーキテクト': { typeName: '安定アーキテクト', emoji: '🏛️', shortDesc: '盤石な構造を作り上げる設計の達人。\n長期視点で物事を組み立て、時間に耐える仕組みを生む。', strategy: '「100年後も動く仕組みを作れ」', suit: 'インフラ・組織設計・制度構築・建築', weakness: '変化への柔軟性が低くなりがち。' },
  '創造アーキテクト': { typeName: '創造アーキテクト', emoji: '✨', shortDesc: '革新的な仕組みを設計する未来の建設者。\n既存の枠を超えた構造を想像し、世界を再設計する。', strategy: '「常識を疑った設計が世界を変える」', suit: 'UX設計・新サービス設計・イノベーション', weakness: '革新的すぎて周囲に理解されないことがある。' },
  '探究アーキテクト': { typeName: '探究アーキテクト', emoji: '🔬', shortDesc: '複雑な問題を整理し、本質的な構造を見つける思考家。\n深い分析から普遍的な仕組みを導き出す。', strategy: '「考えを形にして人に渡す」', suit: '研究・分析・データサイエンス・哲学', weakness: '思考が内向きになり、アウトプットが遅れる。' },
  '奉仕アーキテクト': { typeName: '奉仕アーキテクト', emoji: '🤝', shortDesc: '人のための仕組みを丁寧に作る設計者。\n誰もが使いやすい構造を設計し、社会をよりよく整える。', strategy: '「人が喜ぶ仕組みを一つずつ積み上げよ」', suit: '福祉・公共政策・教育システム・HR', weakness: '自分の設計への過信が盲点になることも。' },
  '挑戦クリエイター': { typeName: '挑戦クリエイター', emoji: '🎯', shortDesc: '限界を超えた表現を追求するアーティスト。\n誰もやらないことに挑み、創造の地平を押し広げる。', strategy: '「できないと言われたものを作れ」', suit: '前衛芸術・プロダクト・ゲーム開発・音楽', weakness: '挑戦のための挑戦になりがち。' },
  '安定クリエイター': { typeName: '安定クリエイター', emoji: '🎨', shortDesc: '確かな技術と感性で作品を生み出すクラフトマン。\n積み重ねた力で美しいものを作り続ける。', strategy: '「毎日の積み重ねが傑作を生む」', suit: 'デザイン・工芸・音楽・映像制作', weakness: '慣れた手法に頼りすぎることがある。' },
  '創造クリエイター': { typeName: '創造クリエイター', emoji: '🌊', shortDesc: '想像の海を自由に泳ぐ革新的な表現者。\n固定観念から解き放たれ、誰も見たことのない世界を生む。', strategy: '「心が動いた瞬間を形にせよ」', suit: 'アート・作家・映画監督・音楽プロデューサー', weakness: '独自性を追い求めすぎて孤立することも。' },
  '探究クリエイター': { typeName: '探究クリエイター', emoji: '🔮', shortDesc: '物事の本質を表現に昇華させる深い芸術家。\n真実を探しながら、それを美しい形に変換する。', strategy: '「真実だけが人を動かす表現になる」', suit: 'ドキュメンタリー・哲学的アート・学術的創作', weakness: '完成度を追いすぎて発表できないことも。' },
  '奉仕クリエイター': { typeName: '奉仕クリエイター', emoji: '💝', shortDesc: '人の心を動かすために創り続ける献身的な表現者。\n誰かのために作ることで最大の力を発揮する。', strategy: '「あなたのために作ったと言えるものを作れ」', suit: '教育コンテンツ・医療アート・コミュニティデザイン', weakness: '人に合わせすぎて自分の表現が薄くなる。' },
  '挑戦ストラテジスト': { typeName: '挑戦ストラテジスト', emoji: '⚔️', shortDesc: '勝利への最短経路を描く戦略の天才。\n困難な状況をゲームとして楽しみ、知略で局面を打開する。', strategy: '「最初に勝てる盤面を設計せよ」', suit: '経営・投資・競争戦略・スポーツ戦術', weakness: '計算高すぎて人間関係が希薄になることも。' },
  '安定ストラテジスト': { typeName: '安定ストラテジスト', emoji: '🛡️', shortDesc: 'リスクを最小化しながら確実な勝利を積み上げる。\n慎重な判断と緻密な計画で長期的な成功を手にする。', strategy: '「負けない戦いを続けよ」', suit: 'リスク管理・保険・法務・長期投資', weakness: '安全策を選びすぎてチャンスを逃す。' },
  '創造ストラテジスト': { typeName: '創造ストラテジスト', emoji: '💡', shortDesc: '既成の戦略を超えた革新的な突破口を開く者。\n誰も思いつかない戦い方で既存のゲームを書き換える。', strategy: '「ルールを変えることが最強の戦略だ」', suit: 'スタートアップ戦略・マーケティング・DX', weakness: '革新的すぎてチームがついてこれないことも。' },
  '探究ストラテジスト': { typeName: '探究ストラテジスト', emoji: '🧠', shortDesc: '深い分析から最適解を導く知的戦略家。\n情報を徹底的に読み解き、見えない真実から勝機を見つける。', strategy: '「データの向こうにある本質を掴め」', suit: 'データ分析・情報戦略・研究開発・コンサル', weakness: '分析過多で意思決定が遅くなる。' },
  '奉仕ストラテジスト': { typeName: '奉仕ストラテジスト', emoji: '🌟', shortDesc: 'チーム全員が勝てる戦略を設計する参謀。\n個人の利益ではなく全体最適を追求し、組織を強くする。', strategy: '「全員が勝てるゲームを設計せよ」', suit: 'チームマネジメント・NPO戦略・教育政策', weakness: '自分の意見を後回しにしすぎる。' },
  '挑戦ヒーラー': { typeName: '挑戦ヒーラー', emoji: '🔥', shortDesc: '困難な状況に飛び込んで人を癒す勇気ある共感者。\n傷ついた場所に最初に踏み込み、希望の光を灯す。', strategy: '「最も困難な人のそばに立て」', suit: '緊急支援・危機介入・戦地医療・心理士', weakness: '自分も傷つくことを忘れてしまう。' },
  '安定ヒーラー': { typeName: '安定ヒーラー', emoji: '🌿', shortDesc: '安心できる環境を作り出す穏やかな守護者。\n揺れない温かさで人々を包み、日常の安らぎを守る。', strategy: '「毎日そこにいることが最大の癒しだ」', suit: '看護・福祉・カウンセリング・家庭医', weakness: '変化を嫌い、新しい治療法を取り入れにくい。' },
  '創造ヒーラー': { typeName: '創造ヒーラー', emoji: '🎭', shortDesc: '癒しの新しい形を生み出す革新的な共感者。\n芸術・音楽・物語で人の心を解きほぐし、新しい回復の道を開く。', strategy: '「癒しには無限の形がある、それを作れ」', suit: 'アートセラピー・音楽療法・ナラティブ医療', weakness: '独自の方法論への固執が生じることも。' },
  '探究ヒーラー': { typeName: '探究ヒーラー', emoji: '🔍', shortDesc: '心の本質を理解しようとする深い共感者。\n人間の内面を探求し、根本からの癒しを実践する。', strategy: '「表面ではなく、根っこを治せ」', suit: '精神分析・哲学療法・深層心理・研究', weakness: '分析しすぎて感情的なサポートが遅れる。' },
  '奉仕ヒーラー': { typeName: '奉仕ヒーラー', emoji: '💖', shortDesc: '献身的に人を癒し続ける純粋な愛の体現者。\n自分よりも他者を優先し、誰かの回復だけを願い続ける。', strategy: '「自分を満たすことが他者を満たす源泉だ」', suit: '介護・ボランティア・宗教的支援・ホスピス', weakness: 'バーンアウトのリスクが高い。' },
  '挑戦コネクター': { typeName: '挑戦コネクター', emoji: '⚡', shortDesc: '人と人の橋渡しで世界を変える触媒者。\n異質な存在を繋ぐことで化学反応を起こし続ける。', strategy: '「出会いが世界を変える、その場を作れ」', suit: '起業家エコシステム・コミュニティ起業・イベント', weakness: '広く浅くなりすぎて深い関係が築けない。' },
  '安定コネクター': { typeName: '安定コネクター', emoji: '🔗', shortDesc: '信頼のネットワークを丁寧に築く関係の職人。\n長年かけて育てた繋がりが最も強い資産になる。', strategy: '「信頼は時間をかけてしか作れない」', suit: '外交・地域コミュニティ・老舗企業・人事', weakness: '新しいつながりを作ることへの抵抗感がある。' },
  '創造コネクター': { typeName: '創造コネクター', emoji: '🌈', shortDesc: 'つながりの新しい形を発明するソーシャルデザイナー。\n今まで出会えなかった人々を革新的な方法で繋ぐ。', strategy: '「誰も思いつかない出会いの場を作れ」', suit: 'SNS・コミュニティプラットフォーム・マッチング', weakness: 'アイデアは多いが実行力が追いつかない。' },
  '探究コネクター': { typeName: '探究コネクター', emoji: '🧭', shortDesc: '関係性の本質を探りながら繋ぐ洞察のある仲介者。\nなぜ人が繋がるのかを理解し、意味ある出会いを演出する。', strategy: '「表面ではなく、本質で繋げ」', suit: 'ネットワーク研究・人類学・組織開発', weakness: '考えすぎてシンプルな繋がりを難しくする。' },
  '奉仕コネクター': { typeName: '奉仕コネクター', emoji: '🤲', shortDesc: '人のために繋がりを紡ぐ利他的なハブ。\n見返りを求めず、誰かの縁を静かに結び続ける。', strategy: '「縁を繋ぐことがあなたの使命だ」', suit: 'NPO・地域活動・社会起業・ボランティアコーディネーター', weakness: '自分自身のネットワークが手薄になる。' },
  '挑戦スカラー': { typeName: '挑戦スカラー', emoji: '⚡', shortDesc: '知の限界に挑む情熱的な探求者。\n誰も答えを知らない問いに立ち向かい、知識の最前線を押し広げる。', strategy: '「誰もやっていない問いを追え」', suit: '学術研究・新領域開拓・哲学・理論物理', weakness: '挑戦的な問いに焦点を絞れず散漫になる。' },
  '安定スカラー': { typeName: '安定スカラー', emoji: '📚', shortDesc: '確かな知識の基盤を築く学びの守護者。\n積み重ねた知識体系を整理し、次世代に伝える。', strategy: '「知識を体系化して次世代に渡せ」', suit: '教育・図書館・記録・伝統継承・学芸員', weakness: '新しい知識への開放性が低くなりがち。' },
  '創造スカラー': { typeName: '創造スカラー', emoji: '💎', shortDesc: '新しい知の地平を切り開くイノベーティブな学者。\n既存の知識を組み合わせて誰も思いつかない理論を生む。', strategy: '「学問の境界線を越えた場所に宝がある」', suit: '学際研究・理論家・未来学・知的クリエイター', weakness: '革新的すぎて実証に時間がかかる。' },
  '探究スカラー': { typeName: '探究スカラー', emoji: '🌌', shortDesc: '真理を求めて深く潜り続ける思索者。\n一つの問いに人生を捧げ、宇宙の本質に迫ろうとする。', strategy: '「一つの問いを一生追え」', suit: '哲学・数学・理論科学・神学・文学研究', weakness: '社会との接点が薄くなり孤立しやすい。' },
  '奉仕スカラー': { typeName: '奉仕スカラー', emoji: '🎓', shortDesc: '知識を人のために活かす献身的な教育者。\n学ぶことよりも伝えることに最大の喜びを見出す。', strategy: '「知識は共有するときに最も輝く」', suit: '教師・社会教育・科学コミュニケーター・著述家', weakness: '自分の研究よりも他者支援を優先しすぎる。' },
  '挑戦ストーリーテラー': { typeName: '挑戦ストーリーテラー', emoji: '🎪', shortDesc: '限界を超えた物語を語り続ける冒険の語り部。\n誰も見たことのない場所へ行き、その真実を言葉にする。', strategy: '「経験しないと語れない、だから行け」', suit: '戦場ジャーナリスト・冒険記・ドキュメンタリー作家', weakness: '語ることよりも挑戦自体が目的になりがち。' },
  '安定ストーリーテラー': { typeName: '安定ストーリーテラー', emoji: '📖', shortDesc: '心に残る普遍的な物語を紡ぐ時代を超える語り手。\n人間の本質を丁寧に描き、何年後も読まれる作品を作る。', strategy: '「時間に耐える物語だけが真実だ」', suit: '小説家・脚本家・歴史作家・神話研究', weakness: '時代の変化に対応した新しい語り方が苦手。' },
  '創造ストーリーテラー': { typeName: '創造ストーリーテラー', emoji: '✨', shortDesc: '世界を変える物語を創る革命的な表現者。\n新しいジャンルと語り口を発明し、文化そのものを書き換える。', strategy: '「物語は世界を作る武器だ」', suit: '映画監督・ゲームクリエイター・新メディア作家', weakness: '実験的すぎて大衆に届きにくいことも。' },
  '探究ストーリーテラー': { typeName: '探究ストーリーテラー', emoji: '🔦', shortDesc: '真実を物語に乗せて伝える誠実な証言者。\n表面の美しさより深い真実を追求し、本質だけを語ろうとする。', strategy: '「真実だけが、心の奥まで届く」', suit: 'ノンフィクション・ジャーナリスト・伝記作家', weakness: '真実追求が先立ちすぎて物語性が薄れる。' },
  '奉仕ストーリーテラー': { typeName: '奉仕ストーリーテラー', emoji: '🕊️', shortDesc: '人の物語を代わりに語る声なき者の代弁者。\n語れない人の代わりに言葉を紡ぎ、世界に届ける使命を持つ。', strategy: '「あなたの物語は、語られる価値がある」', suit: '社会派ライター・支援活動記録・口述記録者', weakness: '自分自身の声を持ちにくくなることがある。' },
};

// ─── Scoring ─────────────────────────────────────────────────────────────────

function calculateResult(answers: number[]): DiagnosisResult {
  const [q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16] = answers;

  const jobScores: Record<JobType, number> = {
    pioneer:     q1*2 + q5*2 + (6-q6),
    architect:   q6*2 + q4*2 + (6-q1),
    creator:     q3*2 + q8*2 + q11,
    strategist:  (6-q1)*2 + q4*2 + q6,
    healer:      q2*2 + q7 + (6-q5),
    connector:   q7*2 + q2 + q5,
    scholar:     (6-q1)*2 + q14 + q12,
    storyteller: q8*2 + q2 + q3,
  };

  const auraScores: Record<AuraType, number> = {
    challenge:   q9*2 + q5,
    stability:   q10*2 + (6-q5),
    creation:    q11*2 + q3,
    exploration: q12*2 + q14,
    service:     q2*2 + q7 + (6-q9),
  };

  const jobType = (Object.entries(jobScores) as [JobType, number][]).sort((a,b) => b[1]-a[1])[0][0];
  const auraType = (Object.entries(auraScores) as [AuraType, number][]).sort((a,b) => b[1]-a[1])[0][0];

  const hp = Math.min(100, Math.max(40, Math.round(40 + q13*8 + q16*4)));
  const mp = Math.min(100, Math.max(40, Math.round(40 + q14*8 + (6-q15)*4)));

  const auraNames: Record<AuraType, string> = { challenge: '挑戦', stability: '安定', creation: '創造', exploration: '探究', service: '奉仕' };
  const jobNames: Record<JobType, string> = { pioneer: 'パイオニア', architect: 'アーキテクト', creator: 'クリエイター', strategist: 'ストラテジスト', healer: 'ヒーラー', connector: 'コネクター', scholar: 'スカラー', storyteller: 'ストーリーテラー' };

  const typeName = `${auraNames[auraType]}${jobNames[jobType]}`;

  const populationMap: Record<string, number> = {
    '挑戦パイオニア': 8, '安定パイオニア': 6, '創造パイオニア': 7, '探究パイオニア': 5, '奉仕パイオニア': 4,
    '挑戦アーキテクト': 7, '安定アーキテクト': 9, '創造アーキテクト': 5, '探究アーキテクト': 6, '奉仕アーキテクト': 4,
    '挑戦クリエイター': 6, '安定クリエイター': 5, '創造クリエイター': 8, '探究クリエイター': 4, '奉仕クリエイター': 5,
    '挑戦ストラテジスト': 5, '安定ストラテジスト': 7, '創造ストラテジスト': 4, '探究ストラテジスト': 6, '奉仕ストラテジスト': 3,
    '挑戦ヒーラー': 4, '安定ヒーラー': 6, '創造ヒーラー': 4, '探究ヒーラー': 3, '奉仕ヒーラー': 7,
    '挑戦コネクター': 5, '安定コネクター': 6, '創造コネクター': 4, '探究コネクター': 3, '奉仕コネクター': 5,
    '挑戦スカラー': 3, '安定スカラー': 5, '創造スカラー': 4, '探究スカラー': 6, '奉仕スカラー': 4,
    '挑戦ストーリーテラー': 4, '安定ストーリーテラー': 5, '創造ストーリーテラー': 6, '探究ストーリーテラー': 4, '奉仕ストーリーテラー': 5,
  };

  return { jobType, auraType, typeName, population: populationMap[typeName] ?? 5, hp, mp };
}

// ─── Components ──────────────────────────────────────────────────────────────

type Screen = 'welcome' | 'quiz' | 'result';

// ── Welcome ──
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0B1E 0%, #1A1635 50%, #0D0B1E 100%)' }}>
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{
              width: 2 + (i % 3) + 'px', height: 2 + (i % 3) + 'px',
              left: ((i * 53 + 17) % 100) + '%',
              top: ((i * 71 + 13) % 100) + '%',
              backgroundColor: i % 2 === 0 ? '#6B4FBB' : '#8B6FDB',
              opacity: 0.4 + (i % 4) * 0.1,
              animationDelay: (i * 0.3) + 's',
              animationDuration: (2 + (i % 3)) + 's',
            }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Logo */}
        <div className="px-8 py-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #6B4FBB, #F5A623)' }}>
          <h1 className="text-3xl font-bold text-white tracking-widest">✦  AZ  ✦</h1>
        </div>

        <p className="text-lg" style={{ color: '#A898D0' }}>自分を映す鏡のゲーム</p>

        <p className="text-center text-white text-base leading-relaxed">
          あなたの思考・行動・価値観を診断し、<br />人生の進め方を見つけよう。
        </p>

        <p style={{ color: '#A898D0' }} className="text-sm">所要時間：約2分</p>

        <button onClick={onStart}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-transform active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6B4FBB, #8B6FDB)' }}>
          診断をはじめる
        </button>

        <p className="text-xs" style={{ color: '#A898D0' }}>※ 16問のスライダー質問</p>
      </div>
    </div>
  );
}

// ── Quiz ──
function QuizScreen({ onComplete }: { onComplete: (answers: number[]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(16).fill(3));
  const [fade, setFade] = useState(true);

  const q = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const currentAnswer = answers[currentIndex];

  const handleSlider = (v: number) => {
    const next = [...answers];
    next[currentIndex] = v;
    setAnswers(next);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        onComplete(answers);
      } else {
        setCurrentIndex(i => i + 1);
        setFade(true);
      }
    }, 150);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(i => i - 1);
        setFade(true);
      }, 150);
    }
  };

  useEffect(() => { setFade(true); }, [currentIndex]);

  return (
    <div className="min-h-screen flex flex-col px-6 py-4"
      style={{ background: '#0D0B1E' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <button onClick={handleBack} style={{ color: '#A898D0' }} className="text-base py-1 px-0">
          ← 戻る
        </button>
        <span style={{ color: '#A898D0' }} className="text-sm font-semibold">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 rounded-full mb-10" style={{ backgroundColor: '#251F4A' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, backgroundColor: '#6B4FBB' }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center gap-6"
        style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.15s ease' }}>

        <p className="text-xs font-bold tracking-widest text-center uppercase"
          style={{ color: '#6B4FBB' }}>
          {axisLabels[q.axis]}
        </p>

        <p className="text-xl font-bold text-white text-center leading-9">{q.text}</p>

        {/* Slider */}
        <div className="flex flex-col gap-3">
          <input
            type="range" min={1} max={5} step={1}
            value={currentAnswer}
            onChange={e => handleSlider(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6B4FBB ${(currentAnswer - 1) * 25}%, #3D3468 ${(currentAnswer - 1) * 25}%)`,
            }}
          />
          <div className="flex justify-between">
            <span className="text-xs max-w-[45%] text-center" style={{ color: '#A898D0' }}>{q.lowLabel}</span>
            <span className="text-xs max-w-[45%] text-center" style={{ color: '#A898D0' }}>{q.highLabel}</span>
          </div>
          {/* Dots */}
          <div className="flex justify-between px-2 mt-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentAnswer >= n ? '#6B4FBB' : '#3D3468' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Next */}
      <div className="pb-6">
        <button onClick={handleNext}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#6B4FBB' }}>
          {currentIndex === questions.length - 1 ? '結果を見る ✦' : '次へ →'}
        </button>
      </div>
    </div>
  );
}

// ── Stat Bar ──
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold w-7" style={{ color: '#A898D0' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#251F4A' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold w-8 text-right text-white">{value}</span>
    </div>
  );
}

// ── Result ──
function ResultScreen({ result, onRetry }: { result: DiagnosisResult; onRetry: () => void }) {
  const data = typeData[result.typeName];
  const isRare = result.population <= 5;
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const text = `私のAZタイプは「${result.typeName}」${data?.strategy ?? ''}  HP:${result.hp} MP:${result.mp}  #AZ診断`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen px-5 py-8 overflow-y-auto"
      style={{ background: '#0D0B1E' }}>
      <div className="max-w-md mx-auto flex flex-col gap-5">

        <h2 className="text-xl font-bold text-white text-center tracking-widest">✦ あなたのAZタイプ ✦</h2>

        {/* Main Card */}
        <div ref={cardRef} className="rounded-3xl p-6 border"
          style={{ background: 'linear-gradient(135deg, #1A1635, #251F4A)', borderColor: '#3D3468' }}>

          <div className="text-center text-5xl mb-3">{data?.emoji ?? '✦'}</div>
          <h3 className="text-3xl font-bold text-white text-center mb-3">{result.typeName}</h3>

          <div className="flex justify-center mb-4">
            <span className="px-4 py-1 rounded-full text-sm font-semibold border"
              style={{ color: '#F5A623', borderColor: '#3D3468', backgroundColor: '#251F4A' }}>
              {isRare && '✨ 超希少タイプ  '}人口 {result.population}%
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <StatBar label="HP" value={result.hp} color="#4CAF82" />
            <StatBar label="MP" value={result.mp} color="#6B4FBB" />
          </div>

          {data && (
            <>
              <p className="text-center text-sm leading-6 mb-4" style={{ color: '#A898D0' }}>
                {data.shortDesc.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
              </p>
              <div className="rounded-xl p-3 border" style={{ backgroundColor: '#251F4A', borderColor: '#3D3468' }}>
                <p className="text-xs mb-1 tracking-widest uppercase" style={{ color: '#A898D0' }}>人生攻略法</p>
                <p className="text-base font-bold text-center" style={{ color: '#F5A623' }}>{data.strategy}</p>
              </div>
            </>
          )}
        </div>

        {/* Extra Info */}
        {data && (
          <div className="flex flex-col gap-3">
            <InfoBox label="向いていること" value={data.suit} />
            <InfoBox label="注意点" value={data.weakness} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          <button onClick={handleCopy}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#6B4FBB' }}>
            {copied ? '✓ コピーしました！' : 'テキストをコピーしてシェア'}
          </button>
          <button onClick={onRetry}
            className="w-full py-4 rounded-2xl font-semibold border transition-opacity hover:opacity-70"
            style={{ color: '#A898D0', borderColor: '#3D3468', backgroundColor: '#1A1635' }}>
            もう一度診断する
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: '#1A1635', borderColor: '#3D3468' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#A898D0' }}>{label}</p>
      <p className="text-sm text-white leading-6">{value}</p>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleStart = () => setScreen('quiz');

  const handleComplete = (answers: number[]) => {
    const r = calculateResult(answers);
    setResult(r);
    if (typeof window !== 'undefined') {
      localStorage.setItem('az_result', JSON.stringify(r));
    }
    setScreen('result');
  };

  const handleRetry = () => {
    setResult(null);
    setScreen('welcome');
  };

  if (screen === 'welcome') return <WelcomeScreen onStart={handleStart} />;
  if (screen === 'quiz') return <QuizScreen onComplete={handleComplete} />;
  if (screen === 'result' && result) return <ResultScreen result={result} onRetry={handleRetry} />;
  return null;
}
