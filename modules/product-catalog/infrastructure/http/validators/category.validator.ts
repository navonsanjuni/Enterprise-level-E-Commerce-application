import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(200, "Category name cannot exceed 200 characters"),
  parentId: z.uuid("Parent ID must be a valid UUID").optional(),
  position: z
    .number()
    .int("Position must be an integer")
    .nonnegative("Position must be a non-negative integer")
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  parentId: z.uuid("parentId must be a valid UUID").optional(),
  includeChildren: z.coerce.boolean().default(false),
  sortBy: z.enum(["name", "position", "createdAt"]).default("position"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const categoryIdParamSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export const categorySlugParamSchema = z.object({
  slug: z.string().min(1, "Category slug is required"),
});

export const reorderCategoriesSchema = z.object({
  categoryOrders: z
    .array(
      z.object({
        id: z.string().min(1, "Category ID is required"),
        position: z
          .number()
          .int("Position must be an integer")
          .nonnegative("Position must be non-negative"),
      }),
    )
    .min(1, "categoryOrders must contain at least one item"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQueryInput = z.infer<typeof listCategoriesQuerySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
