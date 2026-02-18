import { z } from "zod";

export const addPaymentMethodSchema = z.object({
  type: z.enum(["credit_card", "debit_card", "paypal", "bank_transfer"]),
  provider: z.string().min(1, "Provider is required").max(50),
  last4: z.string().length(4, "Last 4 digits required").optional(),
  brand: z.string().max(50).optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(new Date().getFullYear()).optional(),
  billingName: z.string().min(1, "Billing name is required").max(200),
  isDefault: z.boolean().optional().default(false),
});

export const updatePaymentMethodSchema = addPaymentMethodSchema.partial();

export const paymentMethodIdParamSchema = z.object({
  paymentMethodId: z.string().check(z.uuid({ error: "Invalid payment method ID" })),
});

export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
