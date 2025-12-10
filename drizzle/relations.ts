import { relations } from "drizzle-orm/relations";
import { upsellEvents, orderItems, productVariants, products, orders, checkoutSessions, customers, productAccessoryMap, productColorMatchMap, upsellAdditions, upsellRejections, upsellViews } from "./schema";

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	upsellEvent: one(upsellEvents, {
		fields: [orderItems.upsellEventId],
		references: [upsellEvents.upsellEventId]
	}),
	productVariant: one(productVariants, {
		fields: [orderItems.variantId],
		references: [productVariants.variantId]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.productId]
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
}));

export const upsellEventsRelations = relations(upsellEvents, ({one, many}) => ({
	orderItems: many(orderItems),
	upsellAdditions: many(upsellAdditions),
	productVariant: one(productVariants, {
		fields: [upsellEvents.offeredVariantId],
		references: [productVariants.variantId]
	}),
	product_offeredProductId: one(products, {
		fields: [upsellEvents.offeredProductId],
		references: [products.productId],
		relationName: "upsellEvents_offeredProductId_products_productId"
	}),
	product_triggerProductId: one(products, {
		fields: [upsellEvents.triggerProductId],
		references: [products.productId],
		relationName: "upsellEvents_triggerProductId_products_productId"
	}),
	customer: one(customers, {
		fields: [upsellEvents.customerId],
		references: [customers.customerId]
	}),
	checkoutSession: one(checkoutSessions, {
		fields: [upsellEvents.checkoutSessionId],
		references: [checkoutSessions.shopSessionId]
	}),
	order: one(orders, {
		fields: [upsellEvents.orderId],
		references: [orders.orderId]
	}),
	upsellRejections: many(upsellRejections),
	upsellViews: many(upsellViews),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	orderItems: many(orderItems),
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.productId]
	}),
	upsellAdditions: many(upsellAdditions),
	upsellEvents: many(upsellEvents),
	upsellRejections: many(upsellRejections),
	upsellViews: many(upsellViews),
}));

export const productsRelations = relations(products, ({many}) => ({
	orderItems: many(orderItems),
	productAccessoryMaps_accessoryProductId: many(productAccessoryMap, {
		relationName: "productAccessoryMap_accessoryProductId_products_productId"
	}),
	productAccessoryMaps_baseProductId: many(productAccessoryMap, {
		relationName: "productAccessoryMap_baseProductId_products_productId"
	}),
	productColorMatchMaps_matchProductId: many(productColorMatchMap, {
		relationName: "productColorMatchMap_matchProductId_products_productId"
	}),
	productColorMatchMaps_baseProductId: many(productColorMatchMap, {
		relationName: "productColorMatchMap_baseProductId_products_productId"
	}),
	productVariants: many(productVariants),
	upsellAdditions: many(upsellAdditions),
	upsellEvents_offeredProductId: many(upsellEvents, {
		relationName: "upsellEvents_offeredProductId_products_productId"
	}),
	upsellEvents_triggerProductId: many(upsellEvents, {
		relationName: "upsellEvents_triggerProductId_products_productId"
	}),
	upsellRejections: many(upsellRejections),
	upsellViews: many(upsellViews),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	checkoutSession: one(checkoutSessions, {
		fields: [orders.checkoutSessionId],
		references: [checkoutSessions.shopSessionId],
		relationName: "orders_checkoutSessionId_checkoutSessions_shopSessionId"
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.customerId]
	}),
	upsellAdditions: many(upsellAdditions),
	upsellEvents: many(upsellEvents),
	upsellRejections: many(upsellRejections),
	upsellViews: many(upsellViews),
	checkoutSessions: many(checkoutSessions, {
		relationName: "checkoutSessions_orderId_orders_orderId"
	}),
}));

export const checkoutSessionsRelations = relations(checkoutSessions, ({one, many}) => ({
	orders: many(orders, {
		relationName: "orders_checkoutSessionId_checkoutSessions_shopSessionId"
	}),
	upsellEvents: many(upsellEvents),
	order: one(orders, {
		fields: [checkoutSessions.orderId],
		references: [orders.orderId],
		relationName: "checkoutSessions_orderId_orders_orderId"
	}),
	customer: one(customers, {
		fields: [checkoutSessions.customerId],
		references: [customers.customerId]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	orders: many(orders),
	upsellEvents: many(upsellEvents),
	checkoutSessions: many(checkoutSessions),
}));

export const productAccessoryMapRelations = relations(productAccessoryMap, ({one}) => ({
	product_accessoryProductId: one(products, {
		fields: [productAccessoryMap.accessoryProductId],
		references: [products.productId],
		relationName: "productAccessoryMap_accessoryProductId_products_productId"
	}),
	product_baseProductId: one(products, {
		fields: [productAccessoryMap.baseProductId],
		references: [products.productId],
		relationName: "productAccessoryMap_baseProductId_products_productId"
	}),
}));

export const productColorMatchMapRelations = relations(productColorMatchMap, ({one}) => ({
	product_matchProductId: one(products, {
		fields: [productColorMatchMap.matchProductId],
		references: [products.productId],
		relationName: "productColorMatchMap_matchProductId_products_productId"
	}),
	product_baseProductId: one(products, {
		fields: [productColorMatchMap.baseProductId],
		references: [products.productId],
		relationName: "productColorMatchMap_baseProductId_products_productId"
	}),
}));

export const upsellAdditionsRelations = relations(upsellAdditions, ({one}) => ({
	productVariant: one(productVariants, {
		fields: [upsellAdditions.variantId],
		references: [productVariants.variantId]
	}),
	product: one(products, {
		fields: [upsellAdditions.productId],
		references: [products.productId]
	}),
	order: one(orders, {
		fields: [upsellAdditions.orderId],
		references: [orders.orderId]
	}),
	upsellEvent: one(upsellEvents, {
		fields: [upsellAdditions.upsellEventId],
		references: [upsellEvents.upsellEventId]
	}),
}));

export const upsellRejectionsRelations = relations(upsellRejections, ({one}) => ({
	productVariant: one(productVariants, {
		fields: [upsellRejections.variantId],
		references: [productVariants.variantId]
	}),
	product: one(products, {
		fields: [upsellRejections.productId],
		references: [products.productId]
	}),
	order: one(orders, {
		fields: [upsellRejections.orderId],
		references: [orders.orderId]
	}),
	upsellEvent: one(upsellEvents, {
		fields: [upsellRejections.upsellEventId],
		references: [upsellEvents.upsellEventId]
	}),
}));

export const upsellViewsRelations = relations(upsellViews, ({one}) => ({
	productVariant: one(productVariants, {
		fields: [upsellViews.variantId],
		references: [productVariants.variantId]
	}),
	product: one(products, {
		fields: [upsellViews.productId],
		references: [products.productId]
	}),
	order: one(orders, {
		fields: [upsellViews.orderId],
		references: [orders.orderId]
	}),
	upsellEvent: one(upsellEvents, {
		fields: [upsellViews.upsellEventId],
		references: [upsellEvents.upsellEventId]
	}),
}));