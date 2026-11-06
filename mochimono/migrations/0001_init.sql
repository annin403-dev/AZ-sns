-- 持ち物管理アプリ：テーブル作成
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('adult','child')),
  gender TEXT NOT NULL CHECK (gender IN ('female','male')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE growth_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  measured_on TEXT NOT NULL,
  height_cm REAL,
  weight_kg REAL,
  foot_cm REAL,
  note TEXT
);
CREATE INDEX idx_growth_member ON growth_logs(member_id, measured_on);

CREATE TABLE member_sizes (
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  size_label TEXT,
  size_num REAL,
  source TEXT NOT NULL DEFAULT 'auto' CHECK (source IN ('auto','manual')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (member_id, category_key)
);

CREATE TABLE places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL,
  spot TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clothing_categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  free INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clothing_targets (
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  target_qty INTEGER,
  PRIMARY KEY (member_id, category_key)
);

CREATE TABLE clothing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('member','stock')),
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  gender TEXT CHECK (gender IN ('female','male','unisex')),
  reserved_for_member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  category_key TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT '',
  size_label TEXT,
  size_num REAL,
  season TEXT NOT NULL DEFAULT 'all' CHECK (season IN ('summer','winter','all')),
  status TEXT NOT NULL DEFAULT 'wearing' CHECK (status IN ('wearing','next','stock','discard')),
  qty INTEGER NOT NULL DEFAULT 0,
  place_id INTEGER REFERENCES places(id),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE supply_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  owner_member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  unit TEXT NOT NULL DEFAULT '個',
  qty_unopened INTEGER NOT NULL DEFAULT 0,
  reorder_at INTEGER NOT NULL DEFAULT 0,
  refill_to INTEGER NOT NULL DEFAULT 1,
  auto_target TEXT,
  place_id INTEGER REFERENCES places(id),
  is_disaster INTEGER NOT NULL DEFAULT 0,
  expires_on TEXT,
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_key TEXT NOT NULL CHECK (group_key IN ('water','rice','pasta','retort','canned','soup','snack','other')),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '個',
  meals_per_unit REAL,
  liters_per_unit REAL,
  kg_per_unit REAL,
  default_place_id INTEGER REFERENCES places(id),
  note TEXT
);

CREATE TABLE food_lots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_item_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  best_before TEXT,
  qty REAL NOT NULL DEFAULT 0,
  place_id INTEGER REFERENCES places(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE dismissals (
  key TEXT PRIMARY KEY,
  dismissed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
