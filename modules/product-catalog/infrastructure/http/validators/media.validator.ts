import { z } from "zod";

export const createMediaAssetSchema = z.object({
  storageKey: z
    .string()
    .min(1, "Storage key is required")
    .max(500, "Storage key cannot exceed 500 characters"),
  mime: z
    .string()
    .min(1, "MIME type is required")
    .max(100, "MIME type cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_.+]*$/, "Invalid MIME type format"),
  width: z
    .number()
    .int("Width must be an integer")
    .positive("Width must be positive")
    .optional(),
  height: z
    .number()
    .int("Height must be an integer")
    .positive("Height must be positive")
    .optional(),
  bytes: z.number().int("Bytes must be an integer").nonnegative("Bytes must be non-negative").optional(),
  altText: z
    .string()
    .max(300, "Alt text cannot exceed 300 characters")
    .optional(),
  focalX: z
    .number()
    .min(0, "Focal X must be between 0 and 1")
    .max(1, "Focal X must be between 0 and 1")
    .optional(),
  focalY: z
    .number()
    .min(0, "Focal Y must be between 0 and 1")
    .max(1, "Focal Y must be between 0 and 1")
    .optional(),
  renditions: z.record(z.string(), z.unknown()).optional(),
});

export const updateMediaAssetSchema = createMediaAssetSchema
  .omit({ storageKey: true })
  .partial();

export const listMediaAssetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  mimeType: z.string().optional(),
  isImage: z.coerce.boolean().optional(),
  isVideo: z.coerce.boolean().optional(),
  hasRenditions: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "bytes", "width", "height", "version"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minBytes: z.coerce.number().nonnegative().optional(),
  maxBytes: z.coerce.number().nonnegative().optional(),
  minWidth: z.coerce.number().int().positive().optional(),
  maxWidth: z.coerce.number().int().positive().optional(),
  minHeight: z.coerce.number().int().positive().optional(),
  maxHeight: z.coerce.number().int().positive().optional(),
});

export const mediaAssetIdParamSchema = z.object({
  id: z.string().min(1, "Media asset ID is required"),
});

export type CreateMediaAssetInput = z.infer<typeof createMediaAssetSchema>;
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetSchema>;
export type ListMediaAssetsQueryInput = z.infer<typeof listMediaAssetsQuerySchema>;
