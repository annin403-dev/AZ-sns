import { Hono } from 'hono';
import { z } from 'zod';
import { accessAuth, type AuthEnv } from './auth';
import { primaryKeys, schemas, tableNames, touchUpdated, type TableName } from '../shared/tables';

const app = new Hono<{ Bindings: AuthEnv }>();

app.use('/api/*', accessAuth);

app.get('/api/health', (c) => c.json({ ok: true }));

/** 全部のデータをまとめて返す（家族1軒分なので小さい） */
app.get('/api/all', async (c) => {
  const stmts = tableNames.map((t) => c.env.DB.prepare(`SELECT * FROM ${t}`));
  const results = await c.env.DB.batch(stmts);
  const data: Record<string, unknown[]> = {};
  tableNames.forEach((t, i) => (data[t] = results[i].results));
  return c.json(data);
});

/** バックアップ（JSON） */
app.get('/api/backup', async (c) => {
  const stmts = tableNames.map((t) => c.env.DB.prepare(`SELECT * FROM ${t}`));
  const results = await c.env.DB.batch(stmts);
  const data: Record<string, unknown> = { exported_at: new Date().toISOString(), version: 1 };
  tableNames.forEach((t, i) => (data[t] = results[i].results));
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="mochimono-backup.json"`,
    },
  });
});

const opSchema = z.discriminatedUnion('op', [
  z.object({ table: z.enum(tableNames as [TableName, ...TableName[]]), op: z.literal('insert'), row: z.record(z.string(), z.unknown()) }),
  z.object({ table: z.enum(tableNames as [TableName, ...TableName[]]), op: z.literal('upsert'), row: z.record(z.string(), z.unknown()) }),
  z.object({ table: z.enum(tableNames as [TableName, ...TableName[]]), op: z.literal('delete'), key: z.record(z.string(), z.unknown()) }),
]);
// 無料プランは1回の呼び出しで D1 への問い合わせ50回まで（画面側は40件ずつ送る）
const batchSchema = z.object({ ops: z.array(opSchema).min(1).max(45) });

/** 追加・更新・削除をまとめて1回で保存する（全部成功するか、全部やめるか） */
app.post('/api/batch', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: '送られた内容の形が正しくありません' }, 400);

  const stmts: D1PreparedStatement[] = [];
  const errors: string[] = [];
  parsed.data.ops.forEach((op, i) => {
    const pk = primaryKeys[op.table];
    if (op.op === 'delete') {
      const vals = pk.map((k) => op.key[k]);
      if (vals.some((v) => v === undefined || v === null || (typeof v !== 'number' && typeof v !== 'string'))) {
        errors.push(`${i + 1}件目：消す対象がわかりません`);
        return;
      }
      stmts.push(c.env.DB.prepare(`DELETE FROM ${op.table} WHERE ${pk.map((k) => `${k} = ?`).join(' AND ')}`).bind(...(vals as (string | number)[])));
      return;
    }
    const schema = schemas[op.table];
    const r = schema.safeParse(op.row);
    if (!r.success) {
      errors.push(`${i + 1}件目：${r.error.issues.map((x) => x.message).join('、')}`);
      return;
    }
    const row = { ...(r.data as Record<string, unknown>) };
    if (op.table === 'settings') {
      try {
        JSON.parse(String(row.value));
      } catch {
        errors.push(`${i + 1}件目：設定の値が正しくありません`);
        return;
      }
    }
    if (op.op === 'upsert' && pk.some((k) => row[k] === undefined || row[k] === null)) {
      errors.push(`${i + 1}件目：上書きする対象がわかりません`);
      return;
    }
    const cols = Object.keys(row).filter((k) => row[k] !== undefined);
    const allCols = touchUpdated.includes(op.table) ? [...cols, 'updated_at'] : cols;
    const placeholders = cols.map(() => '?');
    if (touchUpdated.includes(op.table)) placeholders.push(`datetime('now')`);
    let sql = `INSERT INTO ${op.table} (${allCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
    if (op.op === 'upsert') {
      const updates = allCols.filter((k) => !pk.includes(k)).map((k) => `${k} = excluded.${k}`);
      sql += updates.length
        ? ` ON CONFLICT (${pk.join(', ')}) DO UPDATE SET ${updates.join(', ')}`
        : ` ON CONFLICT (${pk.join(', ')}) DO NOTHING`;
    }
    sql += ' RETURNING *';
    stmts.push(c.env.DB.prepare(sql).bind(...cols.map((k) => row[k] as string | number | null)));
  });
  if (errors.length) return c.json({ error: errors.slice(0, 5).join('\n'), errors }, 400);

  try {
    const results = await c.env.DB.batch(stmts);
    return c.json({ results: results.map((r) => (r.results?.[0] as Record<string, unknown> | undefined) ?? null) });
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (msg.includes('FOREIGN KEY')) return c.json({ error: 'ほかのデータが使っているため保存できませんでした（置き場所などを先に移してください）' }, 409);
    return c.json({ error: '保存できませんでした' }, 500);
  }
});

app.all('/api/*', (c) => c.json({ error: '見つかりません' }, 404));

export default app;
