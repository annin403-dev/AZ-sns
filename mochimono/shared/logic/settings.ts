import type { SettingRow } from '../tables';

export type Settings = {
  household_size: number;
  water_l_per_person_day: number;
  include_rice_water: boolean;
  rice_go_per_day: number;
  target_days_water: number;
  target_days_food: number;
  target_days_retort_pasta: number;
  target_days_rice: number;
  toilet_uses_per_person_day: number;
  target_days_toilet: number;
  eat_alert_months: number;
  summer_months: number[];
  default_growth_cm_per_year: number;
  keep_limit_months: number;
  measure_interval_days: number;
  onboarding_done: boolean;
};

export const defaultSettings: Settings = {
  household_size: 5,
  water_l_per_person_day: 3,
  include_rice_water: true,
  rice_go_per_day: 5,
  target_days_water: 7,
  target_days_food: 7,
  target_days_retort_pasta: 3,
  target_days_rice: 7,
  toilet_uses_per_person_day: 5,
  target_days_toilet: 7,
  eat_alert_months: 2,
  summer_months: [5, 6, 7, 8, 9, 10],
  default_growth_cm_per_year: 6,
  keep_limit_months: 36,
  measure_interval_days: 90,
  onboarding_done: false,
};

export function parseSettings(rows: SettingRow[]): Settings {
  const s: Record<string, unknown> = { ...defaultSettings };
  for (const r of rows) {
    if (!(r.key in defaultSettings)) continue;
    try {
      const v = JSON.parse(r.value);
      const d = (defaultSettings as Record<string, unknown>)[r.key];
      if (typeof d === typeof v && Array.isArray(d) === Array.isArray(v)) s[r.key] = v;
    } catch {
      /* 壊れた値は初期値のまま */
    }
  }
  return s as Settings;
}
