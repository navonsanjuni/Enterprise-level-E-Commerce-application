import { z } from "zod";

// ── Request Schemas (Zod) ─────────────────────────────────────────────────────

export const productMediaParamsSchema = z.object({
  productId: z.uuid(),
});

export const productMediaAssetParamsSchema = z.object({
  productId: z.uuid(),
  assetId: z.uuid(),
});

export const productMediaIdParamsSchema = z.object({
  id: z.uuid(),
});

export const getProductMediaQuerySchema = z.object({
  includeAssetDetails: z.string().optional().transform((v) => v === undefined ? true : v === "true"),
  sortBy: z.enum(["position", "createdAt"]).optional().default("position"),
});

export const addMediaToProductSchema = z.object({
  assetId: z.uuid(),
  position: z.number().int().min(1).optional(),
  isCover: z.boolean().optional(),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
});

export const updateProductMediaSchema = z.object({
  position: z.number().int().min(1).optional(),
  isCover: z.boolean().optional(),
  alt: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
});

export const setProductCoverImageSchema = z.object({
  assetId: z.uuid(),
});

export const reorderProductMediaSchema = z.object({
  reorderData: z.array(
    z.object({
      assetId: z.uuid(),
      position: z.number().int().min(1),
    }),
  ).min(1),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type ProductMediaParams = z.infer<typeof productMediaParamsSchema>;
export type ProductMediaAssetParams = z.infer<typeof productMediaAssetParamsSchema>;
export type ProductMediaIdParams = z.infer<typeof productMediaIdParamsSchema>;
export type GetProductMediaQuery = z.infer<typeof getProductMediaQuerySchema>;
export type AddMediaToProductBody = z.infer<typeof addMediaToProductSchema>;
export type UpdateProductMediaBody = z.infer<typeof updateProductMediaSchema>;
export type SetProductCoverImageBody = z.infer<typeof setProductCoverImageSchema>;
export type ReorderProductMediaBody = z.infer<typeof reorderProductMediaSchema>;

// ── JSON Schema for Swagger docs ──────────────────────────────────────────────

export const productMediaResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    productId: { type: "string", format: "uuid" },
    assetId: { type: "string", format: "uuid" },
    displayOrder: { type: "integer" },
    isPrimary: { type: "boolean" },
    alt: { type: "string", nullable: true },
    caption: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const productMediaListResponseSchema = {
  type: "array",
  items: productMediaResponseSchema,
} as const;
