import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Companions API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should list all companions", async () => {
    const companions = await caller.companions.list();
    expect(Array.isArray(companions)).toBe(true);
    expect(companions.length).toBeGreaterThan(0);
  });

  it("should have companion with required fields", async () => {
    const companions = await caller.companions.list();
    const companion = companions[0];
    
    expect(companion).toBeDefined();
    expect(companion.id).toBeDefined();
    expect(companion.name).toBeDefined();
    expect(typeof companion.name).toBe("string");
  });

  it("should get companion by id", async () => {
    const companions = await caller.companions.list();
    const firstCompanion = companions[0];
    
    const fetched = await caller.companions.getById(firstCompanion.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(firstCompanion.id);
    expect(fetched?.name).toBe(firstCompanion.name);
  });

  it("should return undefined for non-existent companion", async () => {
    const fetched = await caller.companions.getById(99999);
    expect(fetched).toBeUndefined();
  });
});

describe("Subscription Plans API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should list all subscription plans", async () => {
    const plans = await caller.subscriptionPlans.list();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);
  });

  it("should have Standard and Pro plans", async () => {
    const plans = await caller.subscriptionPlans.list();
    const planNames = plans.map(p => p.name);
    
    expect(planNames).toContain("Standard");
    expect(planNames).toContain("Pro");
  });

  it("should have correct pricing for Standard plan", async () => {
    const plans = await caller.subscriptionPlans.list();
    const standardPlan = plans.find(p => p.name === "Standard");
    
    expect(standardPlan).toBeDefined();
    expect(standardPlan?.pricePerMonth).toBe(999); // $9.99 in cents
  });

  it("should have correct pricing for Pro plan", async () => {
    const plans = await caller.subscriptionPlans.list();
    const proPlan = plans.find(p => p.name === "Pro");
    
    expect(proPlan).toBeDefined();
    expect(proPlan?.pricePerMonth).toBe(1999); // $19.99 in cents
  });

  it("should get plan by id", async () => {
    const plans = await caller.subscriptionPlans.list();
    const firstPlan = plans[0];
    
    const fetched = await caller.subscriptionPlans.getById(firstPlan.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(firstPlan.id);
    expect(fetched?.name).toBe(firstPlan.name);
  });
});
