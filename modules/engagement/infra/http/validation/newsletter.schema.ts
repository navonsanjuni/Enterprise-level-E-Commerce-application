import { z } from "zod";

// ── Query Schemas ─────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// ── Body Schemas ──────────────────────────────────────────────────────────────

export const subscribeNewsletterSchema = z.object({
  email: z.email(),
  source: z.string().min(1).optional(),
});

export const unsubscribeNewsletterSchema = z.object({
  subscriptionId: z.uuid().optional(),
  email: z.email().optional(),
}).refine((data) => data.subscriptionId || data.email, {
  message: "Either subscriptionId or email is required",
});

export const unsubscribeViaLinkSchema = z.object({
  email: z.email(),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SubscribeNewsletterBody = z.infer<typeof subscribeNewsletterSchema>;
export type UnsubscribeNewsletterBody = z.infer<typeof unsubscribeNewsletterSchema>;
export type UnsubscribeViaLinkQuery = z.infer<typeof unsubscribeViaLinkSchema>;
