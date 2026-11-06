import { useEffect, type ReactNode } from 'react';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export function Card({ title, children, right, tone }: { title?: ReactNode; children: ReactNode; right?: ReactNode; tone?: 'warn' }) {
  return (
    <section className={cx('rounded-2xl border bg-white p-4 shadow-sm dark:bg-stone-900', tone === 'warn' ? 'border-amber-300 dark:border-amber-700' : 'border-stone-200 dark:border-stone-800')}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'soft'; small?: boolean; className?: string; disabled?: boolean; type?: 'button' | 'submit'; ariaLabel?: string };
export function Button({ children, onClick, variant = 'soft', small, className, disabled, type = 'button', ariaLabel }: BtnProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-11 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl font-medium transition active:scale-[0.97] disabled:opacity-40',
        small ? 'px-3 text-sm' : 'px-4',
        variant === 'primary' && 'bg-accent-600 text-white hover:bg-accent-700',
        variant === 'soft' && 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
        variant === 'ghost' && 'text-accent-700 hover:bg-accent-50 dark:text-accent-100 dark:hover:bg-stone-800',
        variant === 'danger' && 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-200',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Stepper({ value, onMinus, onPlus, unit, label }: { value: number; onMinus: () => void; onPlus: () => void; unit?: string; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button aria-label={`${label}を1へらす`} onClick={onMinus} className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-xl font-bold active:scale-95 dark:bg-stone-800">−</button>
      <span className="min-w-10 text-center text-lg font-bold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-stone-500">{unit}</span>}
      </span>
      <button aria-label={`${label}を1ふやす`} onClick={onPlus} className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-100 text-xl font-bold text-accent-700 active:scale-95 dark:bg-accent-700 dark:text-white">＋</button>
    </div>
  );
}

/** 目安との比べ方：色＋アイコン＋文字 */
export function Gauge({ now, target, unit = '枚' }: { now: number; target: number | null; unit?: string }) {
  if (target == null) return <span className="text-sm text-stone-500">{now}{unit}（目安なし）</span>;
  const diff = now - target;
  if (diff < 0)
    return <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">▼ {now}/{target} {-diff}{unit}足りない</span>;
  if (diff > 0)
    return <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-sm font-medium text-sky-900 dark:bg-sky-950 dark:text-sky-200">▲ {now}/{target} {diff}{unit}多い</span>;
  return <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">● {now}/{target} ちょうど</span>;
}

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl dark:bg-stone-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2 dark:border-stone-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <button aria-label="閉じる" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">×</button>
        </div>
        <div className="overflow-y-auto px-4 py-3">{children}</div>
        {footer && <div className="flex gap-2 border-t border-stone-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-stone-800">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-stone-600 dark:text-stone-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

export const inputCls = 'min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base dark:border-stone-700 dark:bg-stone-950';

export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; ariaLabel: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex rounded-xl bg-stone-200/70 p-1 dark:bg-stone-800">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('min-h-10 flex-1 rounded-lg px-2 text-sm font-medium', value === o.value ? 'bg-white shadow-sm dark:bg-stone-950' : 'text-stone-600 dark:text-stone-300')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-stone-500">{children}</p>;
}

export function Pill({ children, tone = 'stone' }: { children: ReactNode; tone?: 'stone' | 'red' | 'amber' | 'accent' }) {
  const t = {
    stone: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    amber: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    accent: 'bg-accent-100 text-accent-700 dark:bg-accent-700 dark:text-white',
  }[tone];
  return <span className={cx('inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium', t)}>{children}</span>;
}
