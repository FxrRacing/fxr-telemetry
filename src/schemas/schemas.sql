PRAGMA foreign_keys = ON;

-- =========================
-- PRODUCTS
-- =========================

CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  sku          TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  image_url    TEXT,
  category     TEXT,
  subcategory  TEXT,
  is_accessory BOOLEAN NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(active);


CREATE TABLE product_variants (
  variant_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(product_id),
  sku         TEXT NOT NULL UNIQUE,
  color_code  TEXT,     -- canonical color id
  color_name  TEXT,
  size        TEXT,
  price       NUMERIC(12,2) NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_color   ON product_variants(color_code);
CREATE INDEX idx_variants_active  ON product_variants(active);


CREATE TABLE product_accessory_map (
  base_product_id      INTEGER NOT NULL REFERENCES products(product_id),
  accessory_product_id INTEGER NOT NULL REFERENCES products(product_id),
  rule_type            TEXT NOT NULL, -- "accessory", "recommended", "kit"
  priority             INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY (base_product_id, accessory_product_id)
);

CREATE INDEX idx_accessory_base ON product_accessory_map(base_product_id);
CREATE INDEX idx_accessory_acc  ON product_accessory_map(accessory_product_id);


CREATE TABLE product_color_match_map (
  base_product_id INTEGER NOT NULL REFERENCES products(product_id),
  match_product_id INTEGER NOT NULL REFERENCES products(product_id),
  base_color_code  TEXT,
  match_color_code TEXT,
  priority         INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY (base_product_id, match_product_id, base_color_code, match_color_code)
);

CREATE INDEX idx_color_match_base  ON product_color_match_map(base_product_id);
CREATE INDEX idx_color_match_match ON product_color_match_map(match_product_id);

-- =========================
-- CUSTOMERS (lightweight)
-- =========================

CREATE TABLE customers (
  customer_id TEXT PRIMARY KEY,   -- keep as TEXT if coming from platform/CRM
  email       TEXT,
  created_ts  TEXT
);

-- =========================
-- CHECKOUT SESSIONS
-- =========================

CREATE TABLE checkout_sessions (
  checkout_session_id TEXT PRIMARY KEY,      -- uuidv7 or platform session id
  customer_id         TEXT REFERENCES customers(customer_id),
  order_id            INTEGER REFERENCES orders(order_id),
  created_ts          TEXT NOT NULL,
  updated_ts          TEXT NOT NULL
);

CREATE INDEX idx_checkout_customer ON checkout_sessions(customer_id);
CREATE INDEX idx_checkout_order    ON checkout_sessions(order_id);

-- =========================
-- ORDERS
-- =========================

CREATE TABLE orders (
  order_id            INTEGER PRIMARY KEY,   -- platform order id OR internal ROWID
  customer_id         TEXT REFERENCES customers(customer_id),
  checkout_session_id TEXT REFERENCES checkout_sessions(checkout_session_id),

  order_ts            TEXT NOT NULL,         -- ISO timestamp
  currency            TEXT NOT NULL,

  subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  shipping            NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_total      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_total           NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total               NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  has_upsell          BOOLEAN NOT NULL DEFAULT 0,
  upsell_revenue      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  upsell_count        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_orders_ts          ON orders(order_ts);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_has_upsell  ON orders(has_upsell);

-- =========================
-- ORDER ITEMS
-- =========================

CREATE TABLE order_items (
  order_item_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        INTEGER NOT NULL REFERENCES orders(order_id),

  product_id      INTEGER NOT NULL REFERENCES products(product_id),
  variant_id      INTEGER REFERENCES product_variants(variant_id),

  sku             TEXT,
  title           TEXT,
  image_url       TEXT,

  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      NUMERIC(12,2) NOT NULL,
  line_total      NUMERIC(12,2) NOT NULL,

  is_upsell_item  BOOLEAN NOT NULL DEFAULT 0,
  upsell_event_id INTEGER REFERENCES upsell_events(upsell_event_id),

  added_ts        TEXT NOT NULL
);

CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);
CREATE INDEX idx_order_items_variant   ON order_items(variant_id);
CREATE INDEX idx_order_items_isupsell  ON order_items(is_upsell_item);

-- =========================
-- UPSELL EVENTS (offers shown)
-- =========================

CREATE TABLE upsell_events (
  upsell_event_id     INTEGER PRIMARY KEY AUTOINCREMENT,

  order_id            INTEGER REFERENCES orders(order_id), -- nullable until order completes
  checkout_session_id TEXT NOT NULL REFERENCES checkout_sessions(checkout_session_id),
  customer_id         TEXT REFERENCES customers(customer_id),

  upsell_version      TEXT,             -- e.g. "v1", "2025-12-01-a"
  strategy            TEXT,             -- "frequently_bought", "accessory", "color_match", etc.

  offered_ts          TEXT NOT NULL,
  placement           TEXT NOT NULL,    -- "drawer", "modal", etc.

  trigger_product_id  INTEGER REFERENCES products(product_id),
  offered_product_id  INTEGER NOT NULL REFERENCES products(product_id),
  offered_variant_id  INTEGER REFERENCES product_variants(variant_id),

  offered_sku         TEXT,
  offered_title       TEXT,
  offered_unit_price  NUMERIC(12,2) NOT NULL,

  decision            TEXT,             -- "accepted" | "rejected" | "ignored"
  decision_ts         TEXT
);

CREATE INDEX idx_upsell_events_session         ON upsell_events(checkout_session_id);
CREATE INDEX idx_upsell_events_offered_product ON upsell_events(offered_product_id);
CREATE INDEX idx_upsell_events_trigger_product ON upsell_events(trigger_product_id);
CREATE INDEX idx_upsell_events_offered_ts      ON upsell_events(offered_ts);
CREATE INDEX idx_upsell_events_decision        ON upsell_events(decision);

-- =========================
-- UPSELL ADDITIONS (accepted)
-- =========================

CREATE TABLE upsell_additions ( 
  upsell_addition_id INTEGER PRIMARY KEY AUTOINCREMENT,
  upsell_event_id    INTEGER NOT NULL REFERENCES upsell_events(upsell_event_id),
  order_id           INTEGER NOT NULL REFERENCES orders(order_id),

  product_id         INTEGER NOT NULL REFERENCES products(product_id),
  variant_id         INTEGER REFERENCES product_variants(variant_id),

  sku                TEXT,
  image_url          TEXT,

  quantity           INTEGER NOT NULL DEFAULT 1,
  revenue            NUMERIC(12,2) NOT NULL, -- quantity * accepted unit price
  added_ts           TEXT NOT NULL
);

CREATE INDEX idx_upsell_additions_order   ON upsell_additions(order_id);
CREATE INDEX idx_upsell_additions_product ON upsell_additions(product_id);


-- =========================
-- UPSELL REJECTIONS (rejected)
-- =========================

CREATE TABLE upsell_rejections(
  upsell_rejection_id INTEGER PRIMARY KEY AUTOINCREMENT,
  upsell_event_id     INTEGER NOT NULL REFERENCES upsell_events(upsell_event_id),
  order_id            INTEGER REFERENCES orders(order_id),

  product_id          INTEGER NOT NULL REFERENCES products(product_id),
  variant_id          INTEGER REFERENCES product_variants(variant_id),

  sku                 TEXT,
  image_url           TEXT,

  quantity            INTEGER NOT NULL DEFAULT 1,
  revenue             NUMERIC(12,2) NOT NULL,  -- quantity * offered unit price
  rejected_ts         TEXT NOT NULL
);

CREATE INDEX idx_upsell_rejections_order   ON upsell_rejections(order_id);
CREATE INDEX idx_upsell_rejections_product ON upsell_rejections(product_id);


-- =========================
-- UPSELL VIEWS (optional)
-- =========================

CREATE TABLE upsell_views(
  upsell_view_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  upsell_event_id INTEGER NOT NULL REFERENCES upsell_events(upsell_event_id),
  order_id        INTEGER REFERENCES orders(order_id),

  product_id      INTEGER NOT NULL REFERENCES products(product_id),
  variant_id      INTEGER REFERENCES product_variants(variant_id),

  sku             TEXT,
  image_url       TEXT,
  viewed_ts       TEXT NOT NULL
);

CREATE INDEX idx_upsell_views_event ON upsell_views(upsell_event_id);
CREATE INDEX idx_upsell_views_ts    ON upsell_views(viewed_ts);


-- decision constraint (SQLite doesn't enforce CHECK strictly for old rows but good for new)
ALTER TABLE upsell_events
  ADD COLUMN decision_check TEXT
  CHECK (decision IN ('accepted','rejected','ignored') OR decision IS NULL);
