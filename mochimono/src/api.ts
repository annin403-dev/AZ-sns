import type { AllData, BatchOp } from '../shared/tables';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type SlowListener = (slow: boolean) => void;
let pending = 0;
let slowTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<SlowListener>();
export function onSlow(fn: SlowListener) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
function begin() {
  pending++;
  if (!slowTimer) slowTimer = setTimeout(() => listeners.forEach((f) => f(true)), 10_000);
}
function end() {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    if (slowTimer) clearTimeout(slowTimer);
    slowTimer = null;
    listeners.forEach((f) => f(false));
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  begin();
  try {
    const res = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError((body as { error?: string } | null)?.error ?? 'うまくいきませんでした', res.status);
    return body as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('つながりませんでした。電波のよいところでもう一度ためしてください', 0);
  } finally {
    end();
  }
}

export const BATCH_SIZE = 40;

export const api = {
  all: () => request<AllData>('/api/all'),
  /** 無料プランは1回の呼び出しで問い合わせ50回までなので、40件ずつに分けて送る */
  batch: async (ops: BatchOp[]) => {
    const results: (Record<string, unknown> | null)[] = [];
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
      const r = await request<{ results: (Record<string, unknown> | null)[] }>('/api/batch', { method: 'POST', body: JSON.stringify({ ops: ops.slice(i, i + BATCH_SIZE) }) });
      results.push(...r.results);
    }
    return { results };
  },
};
