/**
 * SNS タブ
 * v1では「Coming Soon」プレースホルダー
 * v1.5でタイムライン・応援・公開Wish Mapを実装予定
 */
export default function SNSPage() {
  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "#FAF9FF" }}>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#1C1A2E" }}>
          SNS
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7B78A0" }}>
          他者を見ることで自分を知る場所
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-24 text-center">
        <div className="text-5xl mb-6">🔗</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#1C1A2E" }}>
          準備中です
        </h2>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#7B78A0", maxWidth: "260px" }}
        >
          タイムライン・応援・ギルドなど、SNS機能はv1.5で開放予定です
        </p>
        <div
          className="w-full max-w-xs rounded-2xl p-4 text-left space-y-3"
          style={{ background: "#F3F1FC", border: "1.5px solid #C8BEF0" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#7C5CDB" }}>
            予定している機能
          </p>
          {[
            "タイムライン（仲間の投稿を見る）",
            "応援リアクション",
            "ギルド（テーマ別コミュニティ）",
            "公開Wish Map",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#C8BEF0" }}>◎</span>
              <span className="text-sm" style={{ color: "#7B78A0" }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
