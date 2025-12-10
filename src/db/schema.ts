import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";
import { sqliteTable as table, index, uniqueIndex, AnySQLiteColumn, check } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';

function generateUniqueString(length: number = 12): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters[randomIndex];
  }
  return uniqueString;
}
export const usersTable = table("users_table", {
  id: t.int("id").primaryKey({ autoIncrement: true }).notNull(),
  name: t.text("name").notNull(),
  age: t.int("age").notNull(),
  email: t.text("email").notNull().unique(),
  date_created: t.text("date_created").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = t.sqliteTable(
  "products",
  {
    productId: t.integer("product_id").primaryKey({ autoIncrement: true }),
    sku: t.text("sku").notNull(),
    title: t.text("title").notNull(),
    imageUrl: t.text("image_url"),
    category: t.text("category"),
    subcategory: t.text("subcategory"),
    isAccessory: t.integer("is_accessory", { mode: "boolean" })
      .notNull()
      .default(false),
    active: t.integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    uniqueIndex("products_sku_unique").on(t.sku),
    index("idx_products_category").on(t.category),
    index("idx_products_active").on(t.active),
  ]
);

export const productVariants = table(
  "product_variants",
  {
    variantId: t.integer("variant_id").primaryKey({ autoIncrement: true }),
    productId: t.integer("product_id")
      .notNull()
      .references(() => products.productId),
    sku: t.text("sku").notNull(),
    colorCode: t.text("color_code"),
    colorName: t.text("color_name"),
    size: t.text("size"),
    price: t.real("price").notNull(),
    active: t.integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    uniqueIndex("variants_sku_unique").on(t.sku),
    index("idx_variants_product").on(t.productId),
    index("idx_variants_color").on(t.colorCode),
    index("idx_variants_active").on(t.active),
  ]
);

export const productAccessoryMap = table(
  "product_accessory_map",
  {
    baseProductId: t.integer("base_product_id")
      .notNull()
      .references(() => products.productId),
    accessoryProductId: t.integer("accessory_product_id")
      .notNull()
      .references(() => products.productId),
    ruleType: t.text("rule_type").notNull(),
    priority: t.integer("priority").notNull().default(100),
  },
  (t) => [
    uniqueIndex("product_accessory_map_pk").on(t.baseProductId, t.accessoryProductId),
    index("idx_accessory_base").on(t.baseProductId),
    index("idx_accessory_acc").on(t.accessoryProductId),
  ]
);

export const productColorMatchMap = table(
  "product_color_match_map",
  {
    baseProductId: t.integer("base_product_id")
      .notNull()
      .references(() => products.productId),
    matchProductId: t.integer("match_product_id")
      .notNull()
      .references(() => products.productId),
    baseColorCode: t.text("base_color_code"),
    matchColorCode: t.text("match_color_code"),
    priority: t.integer("priority").notNull().default(100),
  },
  (t) => [
    uniqueIndex("product_color_match_map_pk").on(t.baseProductId, t.matchProductId, t.baseColorCode, t.matchColorCode),
    index("idx_color_match_base").on(t.baseProductId),
    index("idx_color_match_match").on(t.matchProductId),
  ]
);

// =========================
// CUSTOMERS
// =========================

export const customers = table("customers", {
  customerId: t.text("customer_id").primaryKey(),
  email: t.text("email"),
  createdTs: t.text("created_ts"),
});

// =========================
// CHECKOUT SESSIONS
// =========================

export const checkoutSessions = table(
  "checkout_sessions",
  {
    id: t.text("checkout_session_id").primaryKey(),
    shopSessionId: t.text("shop_session_id").unique().notNull(),
    customerId: t.text("customer_id").references(() => customers.customerId),
    orderId: t.integer("order_id").references((): AnySQLiteColumn => orders.orderId),
    createdTs: t.text("created_ts").notNull(),
    updatedTs: t.text("updated_ts").notNull(),
  },
  (t) => [
    index("idx_checkout_customer").on(t.customerId),
    index("idx_checkout_order").on(t.orderId),
  ]
);
export type CheckoutSession = typeof checkoutSessions.$inferSelect;

// =========================
// ORDERS
// =========================

export const orders = table(
  "orders",
  {
    orderId: t.integer("order_id").primaryKey().notNull(),
    customerId: t.text("customer_id").references(() => customers.customerId),
    checkoutSessionId: t.text("checkout_session_id").references(
      () => checkoutSessions.shopSessionId
    ),

    orderTs: t.text("order_ts").notNull(),
    currency: t.text("currency").notNull(),

    subtotal: t.real("subtotal").notNull().default(0.0),
    shipping: t.real("shipping").notNull().default(0.0),
    discountTotal: t.real("discount_total").notNull().default(0.0),
    taxTotal: t.real("tax_total").notNull().default(0.0),
    total: t.real("total").notNull().default(0.0),

    hasUpsell: t.integer("has_upsell", { mode: "boolean" }).notNull().default(false),
    upsellRevenue: t.real("upsell_revenue").notNull().default(0.0),
    upsellCount: t.integer("upsell_count").notNull().default(0),
  },
  (t) => [
    index("idx_orders_ts").on(t.orderTs),
    index("idx_orders_customer").on(t.customerId),
    index("idx_orders_has_upsell").on(t.hasUpsell),
  ]
);


// =========================
// ORDER ITEMS
// =========================

export const orderItems = table(
  "order_items",
  {
    orderItemId: t.integer("order_item_id").primaryKey({ autoIncrement: true }),
    orderId: t.integer("order_id")
      .notNull()
      .references(() => orders.orderId),

    productId: t.integer("product_id")
      .notNull()
      .references(() => products.productId),
    variantId: t.integer("variant_id").references(
      () => productVariants.variantId
    ),

    sku: t.text("sku"),
    title: t.text("title"),
    imageUrl: t.text("image_url"),

    quantity: t.integer("quantity").notNull().default(1),
    unitPrice: t.real("unit_price").notNull(),
    lineTotal: t.real("line_total").notNull(),

    isUpsellItem: t.integer("is_upsell_item", { mode: "boolean" })
      .notNull()
      .default(false),
    upsellEventId: t.integer("upsell_event_id").references(
      () => upsellEvents.upsellEventId
    ),

    addedTs: t.text("added_ts").notNull(),
  },
  (t) => [
    index("idx_order_items_order").on(t.orderId),
    index("idx_order_items_product").on(t.productId),
    index("idx_order_items_variant").on(t.variantId),
    index("idx_order_items_isupsell").on(t.isUpsellItem),
  ]
);

// =========================
// UPSELL EVENTS
// =========================

export const upsellEvents = table(
  "upsell_events",
  {
    upsellEventId: t.integer("upsell_event_id").primaryKey({
      autoIncrement: true,
    }),

    orderId: t.integer("order_id").references(() => orders.orderId),
    checkoutSessionId: t.text("checkout_session_id")
      .notNull()
      .references(() => checkoutSessions.shopSessionId),
    customerId: t.text("customer_id").references(() => customers.customerId),

    upsellVersion: t.text("upsell_version"),
    strategy: t.text("strategy"),

    offeredTs: t.text("offered_ts").notNull(),
    placement: t.text("placement").notNull(),

    triggerProductId: t.integer("trigger_product_id").references(
      () => products.productId
    ),
    offeredProductId: t.integer("offered_product_id")
      .notNull()
      .references(() => products.productId),
    offeredVariantId: t.integer("offered_variant_id").references(
      () => productVariants.variantId
    ),

    offeredSku: t.text("offered_sku"),
    offeredTitle: t.text("offered_title"),
    offeredUnitPrice: t.real("offered_unit_price").notNull(),

    decision: t.text("decision"),
    decisionTs: t.text("decision_ts"),

    // mirror your ALTER TABLE intent
    decisionCheck: t.text("decision_check"),
  },
  (t) => [
    index("idx_upsell_events_session").on(t.checkoutSessionId),
    index("idx_upsell_events_offered_product").on(t.offeredProductId),
    index("idx_upsell_events_trigger_product").on(t.triggerProductId),
    index("idx_upsell_events_offered_ts").on(t.offeredTs),
    index("idx_upsell_events_decision").on(t.decision),
    check(
      "upsell_events_decision_check",
      sql`${t.decision} IN ('accepted','rejected','ignored') OR ${t.decision} IS NULL`
    ),
  ]
);

// =========================
// UPSELL ADDITIONS
// =========================

export const upsellAdditions = table(
  "upsell_additions",
  {
    upsellAdditionId: t.integer("upsell_addition_id").primaryKey({
      autoIncrement: true,
    }),
    upsellEventId: t.integer("upsell_event_id")
      .notNull()
      .references(() => upsellEvents.upsellEventId),
    orderId: t.integer("order_id")
      .notNull()
      .references(() => orders.orderId),

    productId: t.integer("product_id")
      .notNull()
      .references(() => products.productId),
    variantId: t.integer("variant_id").references(
      () => productVariants.variantId
    ),

    sku: t.text("sku"),
    imageUrl: t.text("image_url"),

    quantity: t.integer("quantity").notNull().default(1),
    revenue: t.real("revenue").notNull(),
    addedTs: t.text("added_ts").notNull(),
  },
  (t) => [
    index("idx_upsell_additions_order").on(t.orderId),
    index("idx_upsell_additions_product").on(t.productId),
  ]
);

// =========================
// UPSELL REJECTIONS
// =========================

export const upsellRejections = table(
  "upsell_rejections",
  {
    upsellRejectionId: t.integer("upsell_rejection_id").primaryKey({
      autoIncrement: true,
    }),
    upsellEventId: t.integer("upsell_event_id")
      .notNull()
      .references(() => upsellEvents.upsellEventId),
    orderId: t.integer("order_id").references(() => orders.orderId),

    productId: t.integer("product_id")
      .notNull()
      .references(() => products.productId),
    variantId: t.integer("variant_id").references(
      () => productVariants.variantId
    ),

    sku: t.text("sku"),
    imageUrl: t.text("image_url"),

    quantity: t.integer("quantity").notNull().default(1),
    revenue: t.real("revenue").notNull(),
    rejectedTs: t.text("rejected_ts").notNull(),
  },
  (t) => [
    index("idx_upsell_rejections_order").on(t.orderId),
    index("idx_upsell_rejections_product").on(t.productId),
  ]
);

// =========================
// UPSELL VIEWS
// =========================

export const upsellViews = table(
  "upsell_views",
  {
    upsellViewId: t.integer("upsell_view_id").primaryKey({
      autoIncrement: true,
    }),
    upsellEventId: t.integer("upsell_event_id")
      .notNull()
      .references(() => upsellEvents.upsellEventId),
    orderId: t.integer("order_id").references(() => orders.orderId),

    productId: t.integer("product_id")
      .notNull()
      .references(() => products.productId),
    variantId: t.integer("variant_id").references(
      () => productVariants.variantId
    ),

    sku: t.text("sku"),
    imageUrl: t.text("image_url"),
    viewedTs: t.text("viewed_ts").notNull(),
  },
  (t) => [
    index("idx_upsell_views_event").on(t.upsellEventId),
    index("idx_upsell_views_ts").on(t.viewedTs),
  ]
);

// =========================
// OPTIONAL RELATIONS
// =========================

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.productId],
    }),
    orderItems: many(orderItems),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  checkoutSessions: many(checkoutSessions),
  upsellEvents: many(upsellEvents),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.customerId],
  }),
  checkoutSession: one(checkoutSessions, {
    fields: [orders.checkoutSessionId],
    references: [checkoutSessions.shopSessionId],
  }),
  items: many(orderItems),
  upsellEvents: many(upsellEvents),
  upsellAdditions: many(upsellAdditions),
  upsellRejections: many(upsellRejections),
  upsellViews: many(upsellViews),
}));

export const checkoutSessionsRelations = relations(
  checkoutSessions,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [checkoutSessions.customerId],
      references: [customers.customerId],
    }),
    order: one(orders, {
      fields: [checkoutSessions.orderId],
      references: [orders.orderId],
    }),
    upsellEvents: many(upsellEvents),
  })
);

export const upsellEventsRelations = relations(
  upsellEvents,
  ({ one, many }) => ({
    order: one(orders, {
      fields: [upsellEvents.orderId],
      references: [orders.orderId],
    }),
    checkoutSession: one(checkoutSessions, {
      fields: [upsellEvents.checkoutSessionId],
      references: [checkoutSessions.shopSessionId],
    }),
    customer: one(customers, {
      fields: [upsellEvents.customerId],
      references: [customers.customerId],
    }),
    triggerProduct: one(products, {
      fields: [upsellEvents.triggerProductId],
      references: [products.productId],
    }),
    offeredProduct: one(products, {
      fields: [upsellEvents.offeredProductId],
      references: [products.productId],
    }),
    offeredVariant: one(productVariants, {
      fields: [upsellEvents.offeredVariantId],
      references: [productVariants.variantId],
    }),
    additions: many(upsellAdditions),
    rejections: many(upsellRejections),
    views: many(upsellViews),
  })
);