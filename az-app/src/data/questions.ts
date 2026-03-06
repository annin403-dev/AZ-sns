export type Axis = 'thinking' | 'action' | 'theme' | 'energy';

export interface Question {
  id: number;
  axis: Axis;
  subAxis: string;
  text: string;
  lowLabel: string;
  highLabel: string;
}

export const questions: Question[] = [
  // ── 思考タイプ（4問）──
  {
    id: 1,
    axis: 'thinking',
    subAxis: 'action_vs_analysis',
    text: '何か新しいことに取り組むとき、まず動いてみる方だ',
    lowLabel: '考えてから動く',
    highLabel: 'まずやってみる',
  },
  {
    id: 2,
    axis: 'thinking',
    subAxis: 'empathy_vs_logic',
    text: '物事を判断するとき、人の気持ちを優先して考える',
    lowLabel: 'データや論理で判断',
    highLabel: '感情や関係で判断',
  },
  {
    id: 3,
    axis: 'thinking',
    subAxis: 'creative_vs_structured',
    text: '決まったやり方より、新しい方法を試したい',
    lowLabel: '実績ある方法を使う',
    highLabel: '新しい方法を試す',
  },
  {
    id: 4,
    axis: 'thinking',
    subAxis: 'big_picture',
    text: '細かい作業より、全体の方向性を考える方が好きだ',
    lowLabel: '細部を丁寧に',
    highLabel: '全体像を描く',
  },

  // ── 行動スタイル（4問）──
  {
    id: 5,
    axis: 'action',
    subAxis: 'challenge',
    text: '未経験のことに挑戦するとき、わくわくする',
    lowLabel: '不安を感じる',
    highLabel: 'わくわくする',
  },
  {
    id: 6,
    axis: 'action',
    subAxis: 'structure',
    text: '仕組みや計画を作ることにエネルギーを感じる',
    lowLabel: '動きながら考える',
    highLabel: '仕組みを先に作る',
  },
  {
    id: 7,
    axis: 'action',
    subAxis: 'relation',
    text: '一人でやるより、人と一緒に動く方が力が出る',
    lowLabel: '一人の方が集中できる',
    highLabel: '人と動く方が力が出る',
  },
  {
    id: 8,
    axis: 'action',
    subAxis: 'expression',
    text: '自分のアイデアや感情を外に表現したい欲求が強い',
    lowLabel: '内に持っておく',
    highLabel: '外に表現したい',
  },

  // ── 人生テーマ（4問）──
  {
    id: 9,
    axis: 'theme',
    subAxis: 'challenge_theme',
    text: '限界に挑戦し、成長し続けることが人生の醍醐味だ',
    lowLabel: 'あまりそう思わない',
    highLabel: 'まったくその通り',
  },
  {
    id: 10,
    axis: 'theme',
    subAxis: 'stability_theme',
    text: '揺るがない土台や安心できる環境を作ることが大切だ',
    lowLabel: 'あまりそう思わない',
    highLabel: 'まったくその通り',
  },
  {
    id: 11,
    axis: 'theme',
    subAxis: 'creation_theme',
    text: '世界にないものを生み出すことに人生の意味を感じる',
    lowLabel: 'あまりそう思わない',
    highLabel: 'まったくその通り',
  },
  {
    id: 12,
    axis: 'theme',
    subAxis: 'exploration_theme',
    text: '物事の本質を深く理解することに喜びを感じる',
    lowLabel: 'あまりそう思わない',
    highLabel: 'まったくその通り',
  },

  // ── エネルギー（4問）──
  {
    id: 13,
    axis: 'energy',
    subAxis: 'physical',
    text: '体を動かしたり、行動することでエネルギーが回復する',
    lowLabel: '休息で回復する',
    highLabel: '行動で回復する',
  },
  {
    id: 14,
    axis: 'energy',
    subAxis: 'mental',
    text: '一人で深く考えたり、内省する時間が好きだ',
    lowLabel: 'あまり好きでない',
    highLabel: 'とても好き',
  },
  {
    id: 15,
    axis: 'energy',
    subAxis: 'social_drain',
    text: '大勢の人と過ごした後、一人の時間が必要になる',
    lowLabel: 'むしろ元気になる',
    highLabel: '疲れて一人になりたい',
  },
  {
    id: 16,
    axis: 'energy',
    subAxis: 'resilience',
    text: '落ち込んだときでも、比較的早く立ち直れる方だ',
    lowLabel: '立ち直るのに時間がかかる',
    highLabel: 'すぐ立ち直れる',
  },
];
