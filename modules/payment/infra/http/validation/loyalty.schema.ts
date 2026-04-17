import { z } from "zod";

export const createLoyaltyProgramSchema = z.object({
  name: z.string().min(1).max(100),
  earnRules: z.array(z.record(z.string(), z.unknown())),
  burnRules: z.array(z.record(z.string(), z.unknown())),
  tiers: z.array(z.record(z.string(), z.unknown())),
});

export const awardPointsSchema = z.object({
  userId: z.uuid(),
  points: z.number().int().positive(),
  reason: z.string().min(1),
  orderId: z.uuid().optional(),
  description: z.string().max(255).optional(),
});

export const redeemPointsSchema = z.object({
  userId: z.uuid(),
  points: z.number().int().positive(),
  orderId: z.uuid(),
  reason: z.string().optional(),
});

export const getLoyaltyAccountQuerySchema = z.object({
  userId: z.uuid(),
});

export const listLoyaltyTransactionsQuerySchema = z.object({
  accountId: z.uuid().optional(),
  orderId: z.uuid().optional(),
});
