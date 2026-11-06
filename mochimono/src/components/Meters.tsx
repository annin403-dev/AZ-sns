import type { Meter } from '../../shared/logic/food';
import { fmtNum } from '../labels';

export function Meters({ meters }: { meters: Meter[] }) {
  return (
    <ul className="space-y-3">
      {meters.map((m) => {
        const pct = m.target > 0 ? Math.min(100, (m.days / m.target) * 100) : 0;
        const ok = m.days >= m.target;
        return (
          <li key={m.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{m.label}</span>
              <span className="text-sm tabular-nums">
                <span className={ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}>{ok ? '● ' : '▼ '}</span>
                <b className="text-base">{fmtNum(m.days)}日分</b>／目標{m.target}日
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" role="meter" aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={m.days} aria-label={`${m.label}の備蓄`}>
              <div className={ok ? 'h-full rounded-full bg-emerald-600' : 'h-full rounded-full bg-amber-500'} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-0.5 text-xs text-stone-500">
              いま {fmtNum(m.amount)}{m.unit}
              {m.shortText && <span>・{m.shortText.replace(/^.*? あと/, 'あと')}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
