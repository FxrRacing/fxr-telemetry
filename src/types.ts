import type { Context } from "hono";

export interface Env {
  DB: D1Database;
}

export type AppContext = Context<{ Bindings: Env }>;
export type HandleArgs = [AppContext];
