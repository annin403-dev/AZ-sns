import { useMemo, useState } from 'react';
import { useData, useStore } from '../store';
import { Button, Card, Empty, Field, Pill, Sheet, Stepper } from '../ui';
import { categoryLabel, fmtNum, fmtYm, genderLabel, memberName, placeName } from '../labels';
import { Meters } from '../components/Meters';
import { LogEditor } from './Family';
import { buyListText, clothingLabel, fmtQtyUnit, homeSummary, stockVerdictText, type DiscardCandidate, type Notice } from '../../shared/logic/home';
import { splitMove, type RowChange } from '../../shared/logic/clothing';
import type { BatchOp, ClothingItem, Member } from '../../shared/tables';
import { refillTarget } from '../../shared/logic/supplies';

export function changesToOps(ch: RowChange[]): BatchOp[] {
  return ch.map((c) =>
    c.kind === 'delete' ? { table: 'clothing_items', op: 'delete', key: { id: c.id } } : c.kind === 'update' ? { table: 'clothing_items', op: 'upsert', row: c.row } : { table: 'clothing_items', op: 'insert', row: c.row },
  );
}

type Move = { item: ClothingItem; qty: number; to: Partial<ClothingItem>; title: string };

function MoveSheet({ move, onClose }: { move: Move; onClose: () => void }) {
  const data = useData();
  const { commit } = useStore();
  const [n, setN] = useState(Math.min(move.qty, move.item.qty));
  const go = async () => {
    onClose();
    await commit(changesToOps(splitMove(data.clothing_items, move.item, n, move.to)), { undoLabel: `${n}枚移しました` });
  };
  return (
    <Sheet open onClose={onClose} title={move.title} footer={<Button variant="primary" className="flex-1" onClick={go} disabled={n <= 0}>{n}枚移す</Button>}>
      <p className="mb-3 text-sm">
        {move.item.kind || categoryLabel(data, move.item.category_key)} {move.item.size_label ?? ''}（今 {move.item.qty}枚・{placeName(data.places, move.item.place_id)}）
      </p>
      <Field label="移す数">
        <Stepper value={n} label="移す数" unit="枚" onMinus={() => setN((x) => Math.max(1, x - 1))} onPlus={() => setN((x) => Math.min(move.item.qty, x + 1))} />
      </Field>
      <p className="text-xs text-stone-500">一部だけ移すと、残りは元の行に残ります。</p>
    </Sheet>
  );
}

export default function Home() {
  const data = useData();
  const { today, settings, commit, bump, toast } = useStore();
  const h = useMemo(() => homeSummary(data, today), [data, today]);
  const [move, setMove] = useState<Move | null>(null);
  const [measure, setMeasure] = useState<Member | null>(null);

  const dismiss = (key: string) => commit([{ table: 'dismissals', op: 'upsert', row: { key } }], { undoLabel: 'お知らせを消しました' });
  const copy = async () => {
    const text = buyListText(h);
    try {
      await navigator.clipboard.writeText(text);
      toast('コピーしました。LINEなどに貼りつけられます');
    } catch {
      window.prompt('この文章をコピーしてください', text);
    }
  };
  const toWearing = (it: ClothingItem, member: Member, use: number) =>
    setMove({ item: it, qty: use, to: { owner_type: 'member', member_id: member.id, status: 'wearing' }, title: `${member.name}の「着ている」に移す` });
  const discardRow = (it: ClothingItem) => commit([{ table: 'clothing_items', op: 'upsert', row: { ...it, status: 'discard' } }], { undoLabel: '手放す予定にしました' });

  const buyCount = h.buySupplies.length + h.buyClothes.length + h.buyFood.length;
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 6;
  const sup = showAll ? h.buySupplies : h.buySupplies.slice(0, LIMIT);
  const clo = showAll ? h.buyClothes : h.buyClothes.slice(0, LIMIT);
  const hidden = h.buySupplies.length - sup.length + h.buyClothes.length - clo.length;

  return (
    <div className="space-y-3 pt-3">
      {/* 1. 買うもの */}
      <Card title={<>買うもの {buyCount > 0 && <Pill tone="amber">{buyCount}</Pill>}</>} right={<Button small variant="ghost" onClick={copy}>コピー</Button>}>
        {buyCount === 0 && <Empty>今は買うものはありません。</Empty>}
        {h.buySupplies.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-stone-500">消耗品</h3>
            <ul className="mb-2">
              {sup.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">
                  <span>{item.name}{item.owner_member_id ? `（${memberName(data, item.owner_member_id)}）` : ''}</span>
                  <span className="text-sm tabular-nums">
                    <b>{fmtQtyUnit(qty, item.unit)}</b>
                    <span className="text-xs text-stone-500"> （今{item.qty_unopened}→{refillTarget(item, settings)}）</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {h.buyClothes.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-stone-500">服</h3>
            <ul className="mb-2">
              {clo.map((r) => (
                <li key={`${r.member.id}${r.category.key}`} className="flex items-center justify-between border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">
                  <span>{clothingLabel(r)}</span>
                  <b className="text-sm">あと{r.remaining}枚</b>
                </li>
              ))}
            </ul>
          </>
        )}
        {h.buyFood.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-stone-500">備蓄</h3>
            <ul>
              {h.buyFood.map((m) => (
                <li key={m.key} className="border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">{m.shortText}</li>
              ))}
            </ul>
          </>
        )}
        {(hidden > 0 || showAll) && (
          <Button small variant="ghost" className="mt-1 w-full" onClick={() => setShowAll((v) => !v)}>
            {showAll ? '少なく表示' : `ほか${hidden}件を見る`}
          </Button>
        )}
      </Card>

      {/* 2. 食べるもの */}
      <Card title="食べるもの">
        {h.eat.length === 0 ? (
          <Empty>期限が近い物はありません。</Empty>
        ) : (
          <ul>
            {h.eat.map(({ lot, item, expired, monthsLeft }) => (
              <li key={lot.id} className="flex items-center gap-2 border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    {item.name}
                    {expired ? <Pill tone="red">✕ 期限切れ</Pill> : <Pill tone="amber">{monthsLeft === 0 ? '今月まで' : `あと${monthsLeft}か月`}</Pill>}
                  </div>
                  <div className={expired ? 'text-xs text-red-700 dark:text-red-300' : 'text-xs text-stone-500'}>
                    期限 {fmtYm(lot.best_before)}・{fmtNum(lot.qty)}{item.unit}・{placeName(data.places, lot.place_id)}
                  </div>
                </div>
                <Button small onClick={() => bump('food_lots', lot.id, 'qty', -1, item.name)}>食べた −1</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 3. お知らせ */}
      <Card title="お知らせ">
        {h.notices.length === 0 ? <Empty>お知らせはありません。</Empty> : (
          <ul className="space-y-3">
            {h.notices.map((n) => (
              <NoticeView key={n.key} n={n} onDismiss={() => dismiss(n.key)} toWearing={toWearing} onMeasure={setMeasure} onMoveToStock={(it, kid) => setMove({ item: it, qty: it.qty, to: { owner_type: 'stock', status: 'stock', gender: kid.gender, member_id: null }, title: 'お下がり在庫へ移す' })} onDiscard={discardRow} />
            ))}
          </ul>
        )}
      </Card>

      {/* 4. 手放す候補 */}
      <Card title="手放す候補">
        {h.discards.length === 0 ? <Empty>今はありません。</Empty> : (
          <ul className="space-y-2">
            {h.discards.map((d) => <DiscardView key={d.key} d={d} onDismiss={() => dismiss(d.key)} onDiscard={discardRow} />)}
          </ul>
        )}
      </Card>

      {/* 5. 備蓄のメーター */}
      <Card title="備蓄のメーター">
        <Meters meters={h.meters} />
      </Card>

      {move && <MoveSheet move={move} onClose={() => setMove(null)} />}
      {measure && <LogEditor member={measure} log={null} onClose={() => setMeasure(null)} />}
    </div>
  );
}

function NoticeView({ n, onDismiss, toWearing, onMeasure, onMoveToStock, onDiscard }: {
  n: Notice; onDismiss: () => void; toWearing: (it: ClothingItem, m: Member, use: number) => void; onMeasure: (m: Member) => void;
  onMoveToStock: (it: ClothingItem, kid: Member) => void; onDiscard: (it: ClothingItem) => void;
}) {
  const data = useData();
  const close = <Button small variant="ghost" onClick={onDismiss}>消す</Button>;
  const wrap = (body: React.ReactNode) => <li className="rounded-xl bg-stone-50 p-3 dark:bg-stone-950"><div className="flex items-start justify-between gap-2"><div className="flex-1">{body}</div>{close}</div></li>;
  if (n.type === 'sizeup') {
    const u = n.data;
    return wrap(
      <>
        <p className="font-bold">📏 {u.member.name}が{u.category.label} {u.sizeNum}になりました</p>
        {[...u.newNext, ...u.newStock].length > 0 && (
          <div className="mt-2">
            <p className="text-sm">新しいサイズで使える服：</p>
            <ul>
              {[...u.newNext, ...u.newStock].map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-2 py-1 text-sm">
                  <span>{it.owner_type === 'stock' ? `お下がり（${genderLabel[it.gender ?? 'unisex']}）` : '来年用'} {it.kind} {it.qty}枚</span>
                  <Button small onClick={() => toWearing(it, u.member, it.qty)}>着ているに移す</Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2">
          <p className="text-sm">前のサイズで着ていた服：</p>
          <ul>
            {u.oldItems.map(({ item, verdict }) => (
              <li key={item.id} className="py-1 text-sm">
                <div>{item.kind || u.category.label} {item.size_label} {item.qty}枚 <span className="text-xs text-stone-500">（{stockVerdictText(verdict)}）</span></div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Button small variant={verdict.kind === 'none' ? 'soft' : 'primary'} onClick={() => onMoveToStock(item, u.member)}>
                    お下がり在庫へ{verdict.assignee ? `（${verdict.assignee.name}が着る予定）` : ''}
                  </Button>
                  <Button small variant={verdict.kind === 'none' ? 'primary' : 'danger'} onClick={() => onDiscard(item)}>手放す{verdict.kind === 'none' ? '（おすすめ）' : ''}</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>,
    );
  }
  if (n.type === 'cover') {
    const r = n.data;
    const st = r.fromStock.reduce((a, c) => a + c.use, 0), nx = r.fromNext.reduce((a, c) => a + c.use, 0);
    const parts = [st && `お下がりに${st}枚`, nx && `来年用に${nx}枚`].filter(Boolean).join('／');
    return wrap(
      <>
        <p className="font-bold">👍 {clothingLabel(r)}：{r.remaining === 0 ? '買わなくてOK' : `${r.shortage - r.remaining}枚は買わなくてOK`}</p>
        <p className="text-sm">{parts}あります。</p>
        <ul className="mt-1">
          {[...r.fromNext, ...r.fromStock].map((c) => (
            <li key={c.item.id} className="flex items-center justify-between gap-2 py-1 text-sm">
              <span>{c.item.owner_type === 'stock' ? 'お下がり' : '来年用'} {c.item.kind} {c.item.size_label ?? ''}（{placeName(data.places, c.item.place_id)}）</span>
              <Button small onClick={() => toWearing(c.item, r.member, c.use)}>着ているに移す</Button>
            </li>
          ))}
        </ul>
      </>,
    );
  }
  if (n.type === 'supply_expiry') {
    const s = n.data;
    return wrap(<p>⏰ <b>{s.name}</b>の使用期限は {fmtYm(s.expires_on)} です。</p>);
  }
  const m = n.data;
  return wrap(
    <>
      <p>📐 <b>{m.member.name}</b>の身長を測る時期です{m.days != null ? `（前回から${m.days}日）` : '（まだ記録がありません）'}。</p>
      <Button small className="mt-1" onClick={() => onMeasure(m.member)}>記録する</Button>
    </>,
  );
}

function DiscardView({ d, onDismiss, onDiscard }: { d: DiscardCandidate; onDismiss: () => void; onDiscard: (it: ClothingItem) => void }) {
  const data = useData();
  const { commit } = useStore();
  const row = (title: React.ReactNode, sub: React.ReactNode, actions: React.ReactNode) => (
    <li className="flex items-center gap-2 border-t border-stone-100 py-2 first:border-t-0 dark:border-stone-800">
      <div className="flex-1"><div className="font-medium">{title}</div><div className="text-xs text-stone-500">{sub}</div></div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">{actions}</div>
    </li>
  );
  if (d.type === 'over') {
    const r = d.data;
    return row(<>{clothingLabel(r)} <Pill tone="accent">▲ +{r.over}枚</Pill></>, `着ている${r.wearing}枚／目安${r.target}枚`, <Button small variant="ghost" onClick={onDismiss}>消す</Button>);
  }
  if (d.type === 'marked') {
    const it = d.data;
    const del = () => commit([{ table: 'clothing_items', op: 'delete', key: { id: it.id } }], { undoLabel: '手放しました' });
    const owner = it.owner_type === 'stock' ? 'お下がり' : memberName(data, it.member_id);
    return row(`${owner} ${it.kind || categoryLabel(data, it.category_key)} ${it.size_label ?? ''} ${it.qty}枚`, `手放す予定・${placeName(data.places, it.place_id)}`, <Button small variant="primary" onClick={del}>手放した</Button>);
  }
  const v = d.data;
  const it = v.item;
  return row(
    <>お下がり（{genderLabel[it.gender ?? 'unisex']}） {it.kind || categoryLabel(data, it.category_key)} {it.size_label ?? ''} {it.qty}枚</>,
    d.type === 'no_kid' ? '着る子がいません' : `保管が長い：${stockVerdictText(v)}`,
    <>
      <Button small variant="danger" onClick={() => onDiscard(it)}>手放す予定に</Button>
      <Button small variant="ghost" onClick={onDismiss}>消す</Button>
    </>,
  );
}
