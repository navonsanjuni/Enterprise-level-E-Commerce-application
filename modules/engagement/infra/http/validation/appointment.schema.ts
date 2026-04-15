import { z } from "zod";

// ── Params Schemas ────────────────────────────────────────────────────────────

export const appointmentIdParamsSchema = z.object({
  appointmentId: z.uuid(),
});

export const userIdParamsSchema = z.object({
  userId: z.uuid(),
});

export const locationIdParamsSchema = z.object({
  locationId: z.uuid(),
});

// ── Query Schemas ─────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// ── Body Schemas ──────────────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  userId: z.uuid(),
  type: z.string().min(1),
  locationId: z.uuid().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  notes: z.string().max(2000).optional(),
}).refine((data) => data.endAt > data.startAt, {
  message: "endAt must be after startAt",
  path: ["endAt"],
});

export const updateAppointmentSchema = z.object({
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
  locationId: z.uuid().optional(),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type AppointmentIdParams = z.infer<typeof appointmentIdParamsSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type LocationIdParams = z.infer<typeof locationIdParamsSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentSchema>;
