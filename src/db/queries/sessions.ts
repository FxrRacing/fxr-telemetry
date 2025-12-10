import { type CheckoutSession, checkoutSessions } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { Db } from "../index";


export async function listCheckoutSessions(
  db: Db,
  limit: number = 20,
  offset: number = 0
): Promise<CheckoutSession[]> {
  const sessions = await db
    .select()
    .from(checkoutSessions)
    .orderBy(desc(checkoutSessions.createdTs))
    .limit(limit).offset(offset);
  return sessions;
}

export async function getCheckoutSession(
  db: Db,
  checkoutSessionId: string
): Promise<CheckoutSession | null> {
  const session = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.shopSessionId, checkoutSessionId))
    .limit(1);
  return session[0] ?? null;
}

export async function createCheckoutSession(
  db: Db,
  checkoutSession: CheckoutSession
): Promise<CheckoutSession> {
  const [session] = await db
    .insert(checkoutSessions)
    .values(checkoutSession)
    .returning();
  return session;
}

export async function updateCheckoutSession(
  db: Db,
  checkoutSession: CheckoutSession
): Promise<CheckoutSession> {
  const [session] = await db
    .update(checkoutSessions)
    .set(checkoutSession)
    .where(eq(checkoutSessions.shopSessionId, checkoutSession.shopSessionId))
    .returning();
  return session;
}

export async function deleteCheckoutSession(
  db: Db,
  checkoutSessionId: string
): Promise<void> {
  await db.delete(checkoutSessions).where(eq(checkoutSessions.shopSessionId, checkoutSessionId));
}