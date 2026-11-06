/** 日付まわり（タイムゾーンは Asia/Tokyo） */
export type Today = { y: number; m: number; d: number; ymd: string; ym: string };

export function todayTokyo(now: Date = new Date()): Today {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const y = get('year'), m = get('month'), d = get('day');
  const ym = `${y}-${String(m).padStart(2, '0')}`;
  return { y, m, d, ym, ymd: `${ym}-${String(d).padStart(2, '0')}` };
}

export function fromYmd(ymd: string): Today {
  const [y, m, d] = ymd.split('-').map(Number);
  const ym = `${y}-${String(m).padStart(2, '0')}`;
  return { y, m, d, ym, ymd: `${ym}-${String(d).padStart(2, '0')}` };
}

/** YYYY-MM どうしの差（a − b、月数） */
export function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return ay * 12 + am - (by * 12 + bm);
}

/** YYYY-MM-DD どうしの差（a − b、日数） */
export function dayDiff(a: string, b: string): number {
  return Math.round((Date.UTC(...ymdParts(a)) - Date.UTC(...ymdParts(b))) / 86400000);
}
function ymdParts(s: string): [number, number, number] {
  const [y, m, d] = s.split('-').map(Number);
  return [y, m - 1, d];
}

export function addDays(ymd: string, days: number): string {
  const t = Date.UTC(...ymdParts(ymd)) + days * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

/** 「約1年2か月」のような言い方にする */
export function formatMonths(months: number): string {
  const m = Math.max(0, Math.round(months));
  if (m === 0) return 'もうすぐ';
  const y = Math.floor(m / 12), r = m % 12;
  if (y === 0) return `約${r}か月後`;
  if (r === 0) return `約${y}年後`;
  return `約${y}年${r}か月後`;
}
