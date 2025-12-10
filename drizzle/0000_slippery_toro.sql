CREATE TABLE `checkout_sessions` (
	`checkout_session_id` text PRIMARY KEY NOT NULL,
	`shop_session_id` text NOT NULL,
	`customer_id` text,
	`order_id` integer,
	`created_ts` text NOT NULL,
	`updated_ts` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkout_sessions_shop_session_id_unique` ON `checkout_sessions` (`shop_session_id`);--> statement-breakpoint
CREATE INDEX `idx_checkout_customer` ON `checkout_sessions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_checkout_order` ON `checkout_sessions` (`order_id`);--> statement-breakpoint
CREATE TABLE `customers` (
	`customer_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`created_ts` text
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_item_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`sku` text,
	`title` text,
	`image_url` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`line_total` real NOT NULL,
	`is_upsell_item` integer DEFAULT false NOT NULL,
	`upsell_event_id` integer,
	`added_ts` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`upsell_event_id`) REFERENCES `upsell_events`(`upsell_event_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_product` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_variant` ON `order_items` (`variant_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_isupsell` ON `order_items` (`is_upsell_item`);--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` integer PRIMARY KEY NOT NULL,
	`customer_id` text,
	`checkout_session_id` text,
	`order_ts` text NOT NULL,
	`currency` text NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`shipping` real DEFAULT 0 NOT NULL,
	`discount_total` real DEFAULT 0 NOT NULL,
	`tax_total` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`has_upsell` integer DEFAULT false NOT NULL,
	`upsell_revenue` real DEFAULT 0 NOT NULL,
	`upsell_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`checkout_session_id`) REFERENCES `checkout_sessions`(`shop_session_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_orders_ts` ON `orders` (`order_ts`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_has_upsell` ON `orders` (`has_upsell`);--> statement-breakpoint
CREATE TABLE `product_accessory_map` (
	`base_product_id` integer NOT NULL,
	`accessory_product_id` integer NOT NULL,
	`rule_type` text NOT NULL,
	`priority` integer DEFAULT 100 NOT NULL,
	FOREIGN KEY (`base_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`accessory_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_accessory_map_pk` ON `product_accessory_map` (`base_product_id`,`accessory_product_id`);--> statement-breakpoint
CREATE INDEX `idx_accessory_base` ON `product_accessory_map` (`base_product_id`);--> statement-breakpoint
CREATE INDEX `idx_accessory_acc` ON `product_accessory_map` (`accessory_product_id`);--> statement-breakpoint
CREATE TABLE `product_color_match_map` (
	`base_product_id` integer NOT NULL,
	`match_product_id` integer NOT NULL,
	`base_color_code` text,
	`match_color_code` text,
	`priority` integer DEFAULT 100 NOT NULL,
	FOREIGN KEY (`base_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_color_match_map_pk` ON `product_color_match_map` (`base_product_id`,`match_product_id`,`base_color_code`,`match_color_code`);--> statement-breakpoint
CREATE INDEX `idx_color_match_base` ON `product_color_match_map` (`base_product_id`);--> statement-breakpoint
CREATE INDEX `idx_color_match_match` ON `product_color_match_map` (`match_product_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`variant_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`sku` text NOT NULL,
	`color_code` text,
	`color_name` text,
	`size` text,
	`price` real NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_variants_product` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_variants_color` ON `product_variants` (`color_code`);--> statement-breakpoint
CREATE INDEX `idx_variants_active` ON `product_variants` (`active`);--> statement-breakpoint
CREATE TABLE `products` (
	`product_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`title` text NOT NULL,
	`image_url` text,
	`category` text,
	`subcategory` text,
	`is_accessory` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_products_category` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `idx_products_active` ON `products` (`active`);--> statement-breakpoint
CREATE TABLE `upsell_additions` (
	`upsell_addition_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upsell_event_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`sku` text,
	`image_url` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`revenue` real NOT NULL,
	`added_ts` text NOT NULL,
	FOREIGN KEY (`upsell_event_id`) REFERENCES `upsell_events`(`upsell_event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_upsell_additions_order` ON `upsell_additions` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_additions_product` ON `upsell_additions` (`product_id`);--> statement-breakpoint
CREATE TABLE `upsell_events` (
	`upsell_event_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer,
	`checkout_session_id` text NOT NULL,
	`customer_id` text,
	`upsell_version` text,
	`strategy` text,
	`offered_ts` text NOT NULL,
	`placement` text NOT NULL,
	`trigger_product_id` integer,
	`offered_product_id` integer NOT NULL,
	`offered_variant_id` integer,
	`offered_sku` text,
	`offered_title` text,
	`offered_unit_price` real NOT NULL,
	`decision` text,
	`decision_ts` text,
	`decision_check` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`checkout_session_id`) REFERENCES `checkout_sessions`(`shop_session_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trigger_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offered_product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`offered_variant_id`) REFERENCES `product_variants`(`variant_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "upsell_events_decision_check" CHECK("upsell_events"."decision" IN ('accepted','rejected','ignored') OR "upsell_events"."decision" IS NULL)
);
--> statement-breakpoint
CREATE INDEX `idx_upsell_events_session` ON `upsell_events` (`checkout_session_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_events_offered_product` ON `upsell_events` (`offered_product_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_events_trigger_product` ON `upsell_events` (`trigger_product_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_events_offered_ts` ON `upsell_events` (`offered_ts`);--> statement-breakpoint
CREATE INDEX `idx_upsell_events_decision` ON `upsell_events` (`decision`);--> statement-breakpoint
CREATE TABLE `upsell_rejections` (
	`upsell_rejection_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upsell_event_id` integer NOT NULL,
	`order_id` integer,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`sku` text,
	`image_url` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`revenue` real NOT NULL,
	`rejected_ts` text NOT NULL,
	FOREIGN KEY (`upsell_event_id`) REFERENCES `upsell_events`(`upsell_event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_upsell_rejections_order` ON `upsell_rejections` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_rejections_product` ON `upsell_rejections` (`product_id`);--> statement-breakpoint
CREATE TABLE `upsell_views` (
	`upsell_view_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upsell_event_id` integer NOT NULL,
	`order_id` integer,
	`product_id` integer NOT NULL,
	`variant_id` integer,
	`sku` text,
	`image_url` text,
	`viewed_ts` text NOT NULL,
	FOREIGN KEY (`upsell_event_id`) REFERENCES `upsell_events`(`upsell_event_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_upsell_views_event` ON `upsell_views` (`upsell_event_id`);--> statement-breakpoint
CREATE INDEX `idx_upsell_views_ts` ON `upsell_views` (`viewed_ts`);--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL,
	`date_created` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);