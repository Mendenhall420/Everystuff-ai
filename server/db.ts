import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companions, subscriptionPlans, subscriptions, conversations, messages, userPreferences } from "../drizzle/schema";
import { and } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { and, eq: eqOp } = await import("drizzle-orm");
  const result = await db.select().from(subscriptions)
    .where(and(eqOp(subscriptions.userId, userId), eqOp(subscriptions.status, "active")))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCompanions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companions).orderBy(companions.createdAt);
}

export async function getCompanionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companions).where(eq(companions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.pricePerMonth);
}

export async function getSubscriptionPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(userId: number, planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values({
    userId,
    planId,
    status: "active",
  });
}

export async function updateSubscriptionStatus(subscriptionId: number, status: "active" | "cancelled" | "expired") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, subscriptionId));
}

export async function updateUserProfile(userId: number, name?: string, email?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (Object.keys(updates).length === 0) return;
  await db.update(users).set(updates).where(eq(users.id, userId));
}


// User Preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userPreferences).values({ userId, ageVerified: 0, maxIntimacyLevel: "friendly" });
}

export async function updateUserPreferences(userId: number, ageVerified?: number, maxIntimacyLevel?: "friendly" | "flirty" | "romantic") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, unknown> = {};
  if (ageVerified !== undefined) updates.ageVerified = ageVerified;
  if (maxIntimacyLevel !== undefined) updates.maxIntimacyLevel = maxIntimacyLevel;
  if (Object.keys(updates).length === 0) return;
  await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId));
}

// Conversations
export async function getOrCreateConversation(userId: number, companionId: number, intimacyLevel: "friendly" | "flirty" | "romantic" = "friendly") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.companionId, companionId)))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  await db.insert(conversations).values({ userId, companionId, intimacyLevel });
  const created = await db.select().from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.companionId, companionId)))
    .limit(1);
  return created.length > 0 ? created[0] : { id: 0, userId, companionId, intimacyLevel, createdAt: new Date(), updatedAt: new Date() };
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId));
}

export async function addMessage(conversationId: number, role: "user" | "companion", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(messages).values({ conversationId, role, content });
}
