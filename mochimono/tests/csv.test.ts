import { describe, expect, it } from 'vitest';
import { csvDefs, exportCsv, parseCsv, previewImport } from '../src/csv';
import { baseData, item } from './fixtures';

describe('CSV', () => {
  it('ダブルクォートと改行を読める', () => {
    expect(parseCsv('a,b\r\n"x,1","y""z\nw"\r\n')).toEqual([['a', 'b'], ['x,1', 'y"z\nw']]);
  });
  it('書き出し→読み込みで、id があれば変更・空なら追加・名前が違えばエラー', () => {
    const d = baseData();
    d.clothing_items = [item({ id: 1, member_id: 3, size_label: '130', size_num: 130, qty: 2 })];
    const def = csvDefs.find((x) => x.table === 'clothing_items')!;
    const csv = exportCsv(def, d);
    expect(csv).toContain('洋室B/引き出し上段');
    const text = csv.trim() + '\r\n,家族,長子,,,トップス,シャツ,140,冬,着ている,3,洋室B/引き出し上段,\r\n,家族,だれ,,,トップス,x,,夏,着ている,1,,\r\n';
    const p = previewImport(def, d, text);
    expect([p.adds, p.updates, p.errors.length]).toEqual([1, 1, 1]);
    expect(p.ops[1]).toMatchObject({ op: 'insert', row: { size_label: '140', size_num: 140, member_id: 3, season: 'winter', qty: 3, place_id: 1 } });
  });
});
