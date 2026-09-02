import type { Metadata } from "next";
import styles from "./beyond.module.css";

export const metadata: Metadata = {
  title: "ISE-SHIMA BEYOND 2027｜今までの自分を、超えていく。",
  description:
    "2027年2月5日・6日。旧暦の一年を越え、新年を伊勢で迎える1泊2日の少人数コーチングリトリート。",
};

// TODO: LINE公式アカウントのURLが確定したらここを差し替える
const LINE = "#contact";

const speakerPhotos = [
  "/beyond/speakers/nakajima.jpg",
  "/beyond/speakers/kato.jpg",
  "/beyond/speakers/shiomi.jpg",
] as const;

const programs = [
  [
    "01",
    "技",
    "中島 克紀",
    "NLP・人的資本・コーチング",
    "思考の限界を超える",
    "自分では気づきにくい思考の前提や無意識の制限を、NLPと体験型コーチングから探ります。",
    ["人的資本経営・健康経営講義", "NLP・コーチングセッション", "ブラインドウォークコーチング"],
  ],
  [
    "02",
    "心",
    "加藤 里美",
    "自己肯定感・心理・発信",
    "自分で決めた限界を超える",
    "できる・できないをいったん置き、自分との対話から「本当はどうしたいのか」を見つめます。",
    ["自己肯定感・心理講義", "自己理解コーチング", "対話セッション"],
  ],
  [
    "03",
    "体",
    "福田 しおみ",
    "ヒプノセラピー・ヨガ・身体",
    "思考を超えて、本音へ",
    "身体を緩め、呼吸と感覚を整える。頭だけでは辿り着けなかった本音や潜在意識へ静かにアクセスします。",
    ["ヒプノセラピー講義・体験", "ヨガ", "呼吸法・瞑想"],
  ],
] as const;

const voices = [
  [
    "自分は何者なのかを知る旅になった。",
    "普段は見過ごしていた自分の思考や行動を、旅の体験を通して振り返ることができました。",
  ],
  [
    "本当は一人でいたくない場面で、一人を選んでいた。",
    "言葉にできないほど大きなものが残り、新しい場所で挑戦できた自分に拍手を送りたいと思いました。",
  ],
  [
    "自分の未熟さを肌で感じ、浄化されたようでした。",
    "人との距離や完璧主義に気づき、これからどう変わりたいかを考えるきっかけになりました。",
  ],
];

const faqs = [
  [
    "経営者でなければ参加できませんか？",
    "経営者・事業主・リーダー層を中心に想定していますが、今後の人生や仕事について深く向き合いたい方もご相談ください。",
  ],
  ["一人参加でも大丈夫ですか？", "もちろんです。少人数制だからこそ、自然に関われる環境をつくります。"],
  [
    "3人全員の講座を受けられますか？",
    "はい。3名それぞれの専門講義・体験プログラムをすべて受けていただきます。",
  ],
  [
    "コーチングが初めてでも大丈夫？",
    "問題ありません。知識よりも実際に体験することを大切にしたプログラムです。",
  ],
  [
    "無料説明会だけ参加してもよいですか？",
    "はい。説明会後に参加を決める必要はありません。内容を確認し、ご自身で判断してください。",
  ],
];

function Cta({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <a className={light ? `${styles.cta} ${styles.light}` : styles.cta} href={LINE}>
      {children}
      <span>↗</span>
    </a>
  );
}

export default function Beyond() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.shade} />
        <div className={styles.heroIn}>
          <p className={styles.eyebrow}>1 NIGHT, 2 DAYS · EXECUTIVE RETREAT</p>
          <h1>
            <small>ISE-SHIMA</small>BEYOND <em>2027</em>
          </h1>
          <p className={styles.catch}>
            今までの自分を、
            <br />
            超えていく。
          </p>
          <p className={styles.date}>
            2027. 2/5 <small>FRI</small> — 2/6 <small>SAT</small>
            <br />
            <span>三重県・伊勢志摩</span>
          </p>
          <Cta light>BEYONDの詳細をLINEで見る</Cta>
        </div>
      </section>

      <section className={`${styles.section} ${styles.center}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>THE QUESTION</p>
        <h2>
          「このまま」でも、
          <br />
          きっと悪くない。
        </h2>
        <div className={`${styles.narrow} ${styles.prose}`}>
          <p>
            仕事もある。守りたい人もいる。
            <br />
            これまで積み重ねてきたものもある。
          </p>
          <p>けれど、ときどき思う。</p>
          <strong>
            私は、このまま同じ場所に
            <br />
            いたいんだろうか？
          </strong>
          <p>
            もっとできる気がする。もっと違う生き方がある気がする。けれど日常に戻れば、またいつもの毎日が始まっていく。
          </p>
        </div>
        <div className={styles.checks}>
          <p>次のステージへ進みたい</p>
          <p>頭では分かっているのに動けない</p>
          <p>本当の望みを確かめたい</p>
          <p>日常を離れ、人生を考えたい</p>
        </div>
        <Cta>参加についてLINEで相談する</Cta>
      </section>

      <section className={`${styles.section} ${styles.dark} ${styles.center}`}>
        <p className={styles.eyebrow}>WHY THIS DATE</p>
        <h2>
          一年を越える瞬間に、
          <br />
          自分自身の境界も越える。
        </h2>
        <p className={styles.lead}>
          2月5日は旧暦の一年の最後の日。
          <br />
          翌2月6日は、旧暦の新年「元日」。
        </p>
        <div className={styles.timeline}>
          <div>
            <small>2/5</small>
            <b>BEFORE</b>
            <span>これまでの自分と向き合う</span>
          </div>
          <i>BEYOND</i>
          <div>
            <small>2/6</small>
            <b>AFTER</b>
            <span>新しい一年、その先へ</span>
          </div>
        </div>
        <p className={`${styles.narrow} ${styles.prose}`}>
          古い一年に感謝し、一晩を越え、新しい一年の最初の日に伊勢を歩く。日程そのものが「境界を越える」というBEYONDの物語です。
        </p>
      </section>

      <section className={`${styles.section} ${styles.ise}`}>
        <div>
          <p className={`${styles.eyebrow} ${styles.gold}`}>ISE-SHIMA</p>
          <h2>
            教室は、
            <br />
            伊勢志摩全体です。
          </h2>
          <p>歩きながら話す。身体を動かす。食卓を囲む。一人になる。誰かの話を聞き、また自分と向き合う。</p>
          <p>日本を代表する祈りの地で迎える新年。その旅すべてを、変化のためのプログラムにします。</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.center}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>3 PROFESSIONALS · 3 APPROACHES</p>
        <h2>技 × 心 × 体</h2>
        <p className={styles.lead}>3つの角度から、自分を立体的に見つめる。</p>
        <div className={styles.badge}>参加者全員が、3名すべての講義・体験を受けられます</div>
        <div className={styles.cards}>
          {programs.map((p, i) => (
            <article key={p[0]}>
              <header>
                <span>{p[0]}</span>
                <b>{p[1]}</b>
              </header>
              <img className={styles.speakerPhoto} src={speakerPhotos[i]} alt={`${p[2]} 講師`} />
              <p className={styles.gold}>{p[4]}</p>
              <h3>{p[2]}</h3>
              <small>{p[3]}</small>
              <p>{p[5]}</p>
              <ul>
                {p[6].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Cta>3人のプログラムを体験する</Cta>
      </section>

      <section className={`${styles.section} ${styles.dark} ${styles.center}`}>
        <p className={styles.eyebrow}>BEYOND JOURNEY</p>
        <h2>
          一泊二日が、
          <br />
          ひとつのコーチングになる。
        </h2>
        <div className={styles.days}>
          <article>
            <div>
              DAY 1 <span>2/5 FRI</span>
            </div>
            <h3>「これまで」を超える日</h3>
            <ul>
              <li>VISON集合・オリエンテーション</li>
              <li>技・心・体の講義／体験</li>
              <li>体験型コーチング・参加者対話</li>
              <li>ディナーコーチング</li>
              <li>一人で自分と向き合う時間</li>
            </ul>
            <strong>旧暦最後の夜を伊勢志摩で迎える。</strong>
          </article>
          <article>
            <div>
              DAY 2 <span>2/6 SAT</span>
            </div>
            <h3>「その先」へ進む日</h3>
            <ul>
              <li>ヨガ・呼吸・瞑想</li>
              <li>朝食コーチング</li>
              <li>伊勢神宮 外宮・内宮参拝</li>
              <li>ウォーキング／ランチコーチング</li>
              <li>BEYOND振り返りセッション</li>
            </ul>
            <strong>新年最初の日に、新しい一歩を決める。</strong>
          </article>
        </div>
        <p className={styles.note}>※時間・プログラムは確定後に一部変更となる場合があります。</p>
      </section>

      <section className={`${styles.section} ${styles.center}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>VOICES FROM THE LAST RETREAT</p>
        <h2>
          前回の伊勢志摩リトリートで
          <br />
          生まれた気づき。
        </h2>
        <div className={styles.voices}>
          {voices.map((v, i) => (
            <blockquote key={i}>
              <span>&ldquo;</span>
              <h3>{v[0]}</h3>
              <p>{v[1]}</p>
            </blockquote>
          ))}
        </div>
        <p className={styles.bridge}>
          昨年のテーマは「Reborn」。
          <br />
          そして2027年は、その先へ。
          <b>BEYOND.</b>
        </p>
      </section>

      <section className={`${styles.section} ${styles.foryou}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>FOR YOU</p>
        <h2>
          こんな方に
          <br />
          来てほしいです。
        </h2>
        <div className={styles.twocol}>
          <p>経営者・事業主・リーダーなど、日頃「誰かのために」考えることの多い方へ。</p>
          <ul>
            <li>仕事や人生の次のステージを考えている</li>
            <li>自分の軸を改めて見つめたい</li>
            <li>同じ立場の人と深く話したい</li>
            <li>知識ではなく体験を通して変わりたい</li>
            <li>2027年を大きな転換点にしたい</li>
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark} ${styles.center}`}>
        <p className={styles.eyebrow}>INFORMATION</p>
        <h2>開催概要</h2>
        <div className={styles.info}>
          <dl>
            <dt>名称</dt>
            <dd>ISE-SHIMA BEYOND 2027</dd>
            <dt>日程</dt>
            <dd>2027年2月5日（金）〜6日（土）</dd>
            <dt>場所</dt>
            <dd>
              三重県・伊勢志摩
              <br />
              VISON／伊勢神宮周辺
            </dd>
            <dt>形式</dt>
            <dd>1泊2日・少人数コーチングリトリート</dd>
            <dt>講師</dt>
            <dd>中島克紀｜加藤里美｜福田しおみ</dd>
          </dl>
          <div className={styles.price}>
            <small>参加費</small>
            <strong>
              詳細はLINEで
              <br />
              ご案内します
            </strong>
            {/* TODO: 正式な参加費が確定したら差し替える */}
            <p>3名すべての講義・体験プログラムを含みます。宿泊・食事・交通費等は正式決定後に明記します。</p>
            <Cta light>LINEから参加について確認する</Cta>
          </div>
        </div>
      </section>

      <section id="contact" className={`${styles.section} ${styles.center}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>TAKE YOUR TIME</p>
        <h2>
          この場で、
          <br />
          決めなくても大丈夫です。
        </h2>
        <p className={styles.lead}>
          高額なリトリートだからこそ、
          <br />
          納得してから決めてください。
        </p>
        <div className={styles.choices}>
          <article>
            <span>01</span>
            <h3>参加を考えている方</h3>
            <p>内容を理解したうえで、参加の相談・お申込みへ。</p>
            {/* TODO: LINE公式アカウントのURL確定後に差し替える */}
            <a href="#">LINEから参加を申し込む ↗</a>
          </article>
          <article>
            <span>02</span>
            <h3>もう少し知りたい方</h3>
            <p>講師・内容・宿泊・移動・費用を、無料オンライン説明会でご案内します。</p>
            {/* TODO: LINE公式アカウントのURL確定後に差し替える */}
            <a href="#">説明会の日程をLINEで受け取る ↗</a>
          </article>
        </div>
        <p className={styles.note}>※公式LINEのURL確定後、すべてのボタンを同じLINEへ接続します。</p>
      </section>

      <section className={`${styles.section} ${styles.faq}`}>
        <p className={`${styles.eyebrow} ${styles.gold}`}>FAQ</p>
        <h2>よくあるご質問</h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>＋</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className={styles.final}>
        <div>
          <p className={styles.eyebrow}>LAST MESSAGE</p>
          <h2>
            あなたは、
            <br />
            どこまで行けるだろう。
          </h2>
          <p>
            何かが足りない自分を、変えに来る必要はありません。
            <br />
            今の自分の中にある可能性を、まだ自分自身が全部見ていないだけかもしれない。
          </p>
          <h3>
            昨日までの自分の、
            <br />
            その先へ。
          </h3>
          <b>BEYOND.</b>
          <p className={styles.date}>2027. 2/5 — 2/6　ISE-SHIMA</p>
          <Cta light>BEYONDの詳細をLINEで見る</Cta>
        </div>
      </section>

      <footer>
        <span>ISE-SHIMA BEYOND 2027</span>
        <small>© 2027 BEYOND.</small>
      </footer>
      <a className={styles.fixed} href={LINE}>
        LINEで詳細を見る <span>↗</span>
      </a>
    </main>
  );
}
