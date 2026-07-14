import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { 
  getAllCompanions, 
  getCompanionById, 
  getAllSubscriptionPlans, 
  getSubscriptionPlanById, 
  getUserSubscription, 
  createSubscription, 
  updateSubscriptionStatus, 
  updateUserProfile, 
  getUserActiveSubscription,
  getUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  getOrCreateConversation,
  getConversationMessages,
  addMessage,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  companions: router({
    list: publicProcedure.query(async () => {
      return getAllCompanions();
    }),
    getById: publicProcedure.input((v) => typeof v === "number" ? v : 0).query(async ({ input }) => {
      return getCompanionById(input);
    }),
  }),

  subscriptionPlans: router({
    list: publicProcedure.query(async () => {
      return getAllSubscriptionPlans();
    }),
    getById: publicProcedure.input((v) => typeof v === "number" ? v : 0).query(async ({ input }) => {
      return getSubscriptionPlanById(input);
    }),
  }),

  subscriptions: router({
    getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
      return getUserSubscription(ctx.user.id);
    }),
    create: protectedProcedure
      .input((v) => typeof v === "number" ? v : 0)
      .mutation(async ({ ctx, input: planId }) => {
        const existing = await getUserActiveSubscription(ctx.user.id);
        if (existing) {
          await updateSubscriptionStatus(existing.id, "cancelled");
        }
        await createSubscription(ctx.user.id, planId);
        return { success: true };
      }),
    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription) throw new Error("No active subscription");
      await updateSubscriptionStatus(subscription.id, "cancelled");
      return { success: true };
    }),
  }),

  profile: router({
    update: protectedProcedure
      .input((v) => (typeof v === "object" && v !== null ? v : {}) as { name?: string; email?: string })
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input.name, input.email);
        return { success: true };
      }),
  }),

  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let prefs = await getUserPreferences(ctx.user.id);
      if (!prefs) {
        await createUserPreferences(ctx.user.id);
        prefs = await getUserPreferences(ctx.user.id);
      }
      return prefs;
    }),
    update: protectedProcedure
      .input((v) => (typeof v === "object" && v !== null ? v : {}) as { ageVerified?: number; maxIntimacyLevel?: "friendly" | "flirty" | "romantic" })
      .mutation(async ({ ctx, input }) => {
        await updateUserPreferences(ctx.user.id, input.ageVerified, input.maxIntimacyLevel);
        return { success: true };
      }),
  }),

  conversations: router({
    getOrCreate: protectedProcedure
      .input((v) => (typeof v === "object" && v !== null ? v : {}) as { companionId: number; intimacyLevel?: "friendly" | "flirty" | "romantic" })
      .mutation(async ({ ctx, input }) => {
        const prefs = await getUserPreferences(ctx.user.id);
        if (!prefs || !prefs.ageVerified) {
          throw new Error("Age verification required");
        }
        const intimacy = input.intimacyLevel || "friendly";
        if (prefs.maxIntimacyLevel && intimacy > prefs.maxIntimacyLevel) {
          throw new Error("Intimacy level not allowed for your account");
        }
        return getOrCreateConversation(ctx.user.id, input.companionId, intimacy);
      }),
    getMessages: protectedProcedure
      .input((v) => typeof v === "number" ? v : 0)
      .query(async ({ input: conversationId }) => {
        return getConversationMessages(conversationId);
      }),
    sendMessage: protectedProcedure
      .input((v) => (typeof v === "object" && v !== null ? v : {}) as { conversationId: number; content: string })
      .mutation(async ({ input }) => {
        if (!input.content.trim()) throw new Error("Message cannot be empty");
        await addMessage(input.conversationId, "user", input.content);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
