import { z } from "zod";

export const createBnplTransactionSchema = z.object({
  intentId: z.uuid(),
  provider: z.string().min(1),
  plan: z.record(z.string(), z.unknown()),
});

export const bnplParamsSchema = z.object({
  bnplId: z.uuid(),
  action: z.enum(["approve", "reject", "activate", "complete", "cancel"]),
});

export const listBnplQuerySchema = z.object({
  bnplId: z.uuid().optional(),
  intentId: z.uuid().optional(),
  orderId: z.uuid().optional(),
});
