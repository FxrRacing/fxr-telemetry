import { sqliteTable, AnySQLiteColumn, check, text, index, foreignKey, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const customers = sqliteTable("customers", {
	customerId: text("customer_id").primaryKey().notNull(),
	email: text(),
	createdTs: text("created_ts"),
},
(table) => [
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const orderItems = sqliteTable("order_items", {
	orderItemId: integer("order_item_id").primaryKey({ autoIncrement: true }).notNull(),
	orderId: integer("order_id").notNull().references(() => orders.orderId),
	productId: integer("product_id").notNull().references(() => products.productId),
	variantId: integer("variant_id").references(() => productVariants.variantId),
	sku: text(),
	title: text(),
	imageUrl: text("image_url"),
	quantity: integer().default(1).notNull(),
	unitPrice: real("unit_price").notNull(),
	lineTotal: real("line_total").notNull(),
	isUpsellItem: integer("is_upsell_item").default(false).notNull(),
	upsellEventId: integer("upsell_event_id").references(() => upsellEvents.upsellEventId),
	addedTs: text("added_ts").notNull(),
},
(table) => [
	index("idx_order_items_isupsell").on(table.isUpsellItem),
	index("idx_order_items_variant").on(table.variantId),
	index("idx_order_items_product").on(table.productId),
	index("idx_order_items_order").on(table.orderId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const orders = sqliteTable("orders", {
	orderId: integer("order_id").primaryKey().notNull(),
	customerId: text("customer_id").references(() => customers.customerId),
	checkoutSessionId: text("checkout_session_id").references((): AnySQLiteColumn => checkoutSessions.shopSessionId),
	orderTs: text("order_ts").notNull(),
	currency: text().notNull(),
	subtotal: real().notNull(),
	shipping: real().notNull(),
	discountTotal: real("discount_total").notNull(),
	taxTotal: real("tax_total").notNull(),
	total: real().notNull(),
	hasUpsell: integer("has_upsell").default(false).notNull(),
	upsellRevenue: real("upsell_revenue").notNull(),
	upsellCount: integer("upsell_count").default(0).notNull(),
},
(table) => [
	index("idx_orders_has_upsell").on(table.hasUpsell),
	index("idx_orders_customer").on(table.customerId),
	index("idx_orders_ts").on(table.orderTs),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const productAccessoryMap = sqliteTable("product_accessory_map", {
	baseProductId: integer("base_product_id").notNull().references(() => products.productId),
	accessoryProductId: integer("accessory_product_id").notNull().references(() => products.productId),
	ruleType: text("rule_type").notNull(),
	priority: integer().default(100).notNull(),
},
(table) => [
	index("idx_accessory_acc").on(table.accessoryProductId),
	index("idx_accessory_base").on(table.baseProductId),
	uniqueIndex("product_accessory_map_pk").on(table.baseProductId, table.accessoryProductId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const productColorMatchMap = sqliteTable("product_color_match_map", {
	baseProductId: integer("base_product_id").notNull().references(() => products.productId),
	matchProductId: integer("match_product_id").notNull().references(() => products.productId),
	baseColorCode: text("base_color_code"),
	matchColorCode: text("match_color_code"),
	priority: integer().default(100).notNull(),
},
(table) => [
	index("idx_color_match_match").on(table.matchProductId),
	index("idx_color_match_base").on(table.baseProductId),
	uniqueIndex("product_color_match_map_pk").on(table.baseProductId, table.matchProductId, table.baseColorCode, table.matchColorCode),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const productVariants = sqliteTable("product_variants", {
	variantId: integer("variant_id").primaryKey({ autoIncrement: true }).notNull(),
	productId: integer("product_id").notNull().references(() => products.productId),
	sku: text().notNull(),
	colorCode: text("color_code"),
	colorName: text("color_name"),
	size: text(),
	price: real().notNull(),
	active: integer().default(true).notNull(),
},
(table) => [
	index("idx_variants_active").on(table.active),
	index("idx_variants_color").on(table.colorCode),
	index("idx_variants_product").on(table.productId),
	uniqueIndex("variants_sku_unique").on(table.sku),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const products = sqliteTable("products", {
	productId: integer("product_id").primaryKey({ autoIncrement: true }).notNull(),
	sku: text().notNull(),
	title: text().notNull(),
	imageUrl: text("image_url"),
	category: text(),
	subcategory: text(),
	isAccessory: integer("is_accessory").default(false).notNull(),
	active: integer().default(true).notNull(),
},
(table) => [
	index("idx_products_active").on(table.active),
	index("idx_products_category").on(table.category),
	uniqueIndex("products_sku_unique").on(table.sku),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const upsellAdditions = sqliteTable("upsell_additions", {
	upsellAdditionId: integer("upsell_addition_id").primaryKey({ autoIncrement: true }).notNull(),
	upsellEventId: integer("upsell_event_id").notNull().references(() => upsellEvents.upsellEventId),
	orderId: integer("order_id").notNull().references(() => orders.orderId),
	productId: integer("product_id").notNull().references(() => products.productId),
	variantId: integer("variant_id").references(() => productVariants.variantId),
	sku: text(),
	imageUrl: text("image_url"),
	quantity: integer().default(1).notNull(),
	revenue: real().notNull(),
	addedTs: text("added_ts").notNull(),
},
(table) => [
	index("idx_upsell_additions_product").on(table.productId),
	index("idx_upsell_additions_order").on(table.orderId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const upsellEvents = sqliteTable("upsell_events", {
	upsellEventId: integer("upsell_event_id").primaryKey({ autoIncrement: true }).notNull(),
	orderId: integer("order_id").references(() => orders.orderId),
	checkoutSessionId: text("checkout_session_id").notNull().references(() => checkoutSessions.shopSessionId),
	customerId: text("customer_id").references(() => customers.customerId),
	upsellVersion: text("upsell_version"),
	strategy: text(),
	offeredTs: text("offered_ts").notNull(),
	placement: text().notNull(),
	triggerProductId: integer("trigger_product_id").references(() => products.productId),
	offeredProductId: integer("offered_product_id").notNull().references(() => products.productId),
	offeredVariantId: integer("offered_variant_id").references(() => productVariants.variantId),
	offeredSku: text("offered_sku"),
	offeredTitle: text("offered_title"),
	offeredUnitPrice: real("offered_unit_price").notNull(),
	decision: text(),
	decisionTs: text("decision_ts"),
	decisionCheck: text("decision_check"),
},
(table) => [
	index("idx_upsell_events_decision").on(table.decision),
	index("idx_upsell_events_offered_ts").on(table.offeredTs),
	index("idx_upsell_events_trigger_product").on(table.triggerProductId),
	index("idx_upsell_events_offered_product").on(table.offeredProductId),
	index("idx_upsell_events_session").on(table.checkoutSessionId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const upsellRejections = sqliteTable("upsell_rejections", {
	upsellRejectionId: integer("upsell_rejection_id").primaryKey({ autoIncrement: true }).notNull(),
	upsellEventId: integer("upsell_event_id").notNull().references(() => upsellEvents.upsellEventId),
	orderId: integer("order_id").references(() => orders.orderId),
	productId: integer("product_id").notNull().references(() => products.productId),
	variantId: integer("variant_id").references(() => productVariants.variantId),
	sku: text(),
	imageUrl: text("image_url"),
	quantity: integer().default(1).notNull(),
	revenue: real().notNull(),
	rejectedTs: text("rejected_ts").notNull(),
},
(table) => [
	index("idx_upsell_rejections_product").on(table.productId),
	index("idx_upsell_rejections_order").on(table.orderId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const upsellViews = sqliteTable("upsell_views", {
	upsellViewId: integer("upsell_view_id").primaryKey({ autoIncrement: true }).notNull(),
	upsellEventId: integer("upsell_event_id").notNull().references(() => upsellEvents.upsellEventId),
	orderId: integer("order_id").references(() => orders.orderId),
	productId: integer("product_id").notNull().references(() => products.productId),
	variantId: integer("variant_id").references(() => productVariants.variantId),
	sku: text(),
	imageUrl: text("image_url"),
	viewedTs: text("viewed_ts").notNull(),
},
(table) => [
	index("idx_upsell_views_ts").on(table.viewedTs),
	index("idx_upsell_views_event").on(table.upsellEventId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const usersTable = sqliteTable("users_table", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	age: integer().notNull(),
	email: text().notNull(),
	dateCreated: text("date_created").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
},
(table) => [
	uniqueIndex("users_table_email_unique").on(table.email),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

export const checkoutSessions = sqliteTable("checkout_sessions", {
	checkoutSessionId: text("checkout_session_id").primaryKey().notNull(),
	shopSessionId: text("shop_session_id").notNull(),
	customerId: text("customer_id").references(() => customers.customerId),
	orderId: integer("order_id").references((): AnySQLiteColumn => orders.orderId),
	createdTs: text("created_ts").notNull(),
	updatedTs: text("updated_ts").notNull(),
},
(table) => [
	index("idx_checkout_order").on(table.orderId),
	index("idx_checkout_customer").on(table.customerId),
	uniqueIndex("checkout_sessions_shop_session_id_unique").on(table.shopSessionId),
	check("upsell_events_decision_check", sql`"upsell_events"."decision" IN ('accepted','rejected','ignored'`),
]);

