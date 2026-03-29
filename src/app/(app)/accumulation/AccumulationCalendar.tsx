"use client";

/**
 * 30日カレンダーヒートマップ
 * 各日に記録があるか、何分積み上げたかを色で表示
 */
export default function AccumulationCalendar({
  records,
}: {
  records: Array<{ record_date: string; minutes_spent: number }>;
}) {
  // 過去30日分の日付リストを生成（古い順）
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  // 日付ごとに合計分数をまとめる
  const minutesByDate: Record<string, number> = {};
  for (const r of records) {
    minutesByDate[r.record_date] =
      (minutesByDate[r.record_date] || 0) + (r.minutes_spent || 0);
  }

  const today = new Date().toISOString().split("T")[0];

  function getCellColor(date: string): string {
    const mins = minutesByDate[date];
    if (mins === undefined) return "#E8F5E9"; // no record (light green bg)
    if (mins === 0) return "#A5D6A7"; // recorded, 0 min
    if (mins < 30) return "#66BB6A";
    if (mins < 60) return "#43A047";
    if (mins < 120) return "#2E7D32";
    return "#1B5E20"; // 2h+
  }

  function hasRecord(date: string): boolean {
    return minutesByDate[date] !== undefined;
  }

  // 7列グリッド（週ごと）
  const weeks: string[][] = [];
  // 30日を7列に収める：最初の行の空白分を計算
  const firstDay = new Date(days[0]);
  const dayOfWeek = firstDay.getDay(); // 0=日
  const paddedDays: (string | null)[] = [
    ...Array(dayOfWeek).fill(null),
    ...days,
  ];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7) as string[]);
  }

  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div>
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-center text-xs"
            style={{ color: "#B0ACC8" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((date, di) => {
              if (!date) {
                return <div key={di} className="aspect-square" />;
              }
              const isToday = date === today;
              const recorded = hasRecord(date);
              const mins = minutesByDate[date] || 0;

              return (
                <div
                  key={date}
                  className="aspect-square rounded-md flex items-center justify-center relative"
                  style={{
                    background: recorded ? getCellColor(date) : "#F0F4F0",
                    border: isToday
                      ? "2px solid #2E7D32"
                      : "1px solid transparent",
                  }}
                  title={
                    recorded
                      ? `${date}: ${mins > 0 ? `${mins}分` : "記録あり"}`
                      : date
                  }
                >
                  {/* 日付の数字（小） */}
                  <span
                    className="text-xs font-semibold leading-none select-none"
                    style={{
                      color: recorded ? "#FFFFFF" : "#C8C4D8",
                      fontSize: "9px",
                    }}
                  >
                    {parseInt(date.split("-")[2], 10)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-xs" style={{ color: "#B0ACC8" }}>
          少
        </span>
        {["#A5D6A7", "#66BB6A", "#43A047", "#2E7D32", "#1B5E20"].map((c) => (
          <div
            key={c}
            className="w-4 h-4 rounded-sm"
            style={{ background: c }}
          />
        ))}
        <span className="text-xs" style={{ color: "#B0ACC8" }}>
          多
        </span>
      </div>
    </div>
  );
}
