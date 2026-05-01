import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import { registerProductCatalogRoutes } from "../../infra/http/routes/index";

// Mock Rate Limiter and Auth Middleware
vi.mock("@/api/src/shared/middleware/rate-limiter.middleware", () => ({
  createRateLimiter: () => async () => {},
  RateLimitPresets: {
    writeOperations: { max: 100, timeWindowMs: 60000 },
  },
  userKeyGenerator: (req: any) => req.user?.id || req.ip,
}));

vi.mock("@/api/src/shared/middleware/authenticate.middleware", () => ({
  authenticate: async (request: any, reply: any) => {
    request.user = { id: "test-user-id", role: "ADMIN" }; // Admin permissions to hit all routes
  },
}));

vi.mock("@/api/src/shared/middleware/role-authorization.middleware", () => ({
  RolePermissions: {
    AUTHENTICATED: async () => {},
    STAFF_LEVEL: async () => {},
    ADMIN_ONLY: async () => {},
  },
}));

describe("Product Catalog Module Routes", () => {
  let app: FastifyInstance;
  let mockControllers: any;

  beforeEach(async () => {
    app = fastify();

    mockControllers = {
      productController: {
        listProducts: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getProductBySlug: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getProduct: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        createProduct: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateProduct: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteProduct: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      categoryController: {
        getCategories: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getCategoryHierarchy: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getCategoryBySlug: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getCategory: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        reorderCategories: vi.fn(async (req, reply) => reply.code(204).send()),
        createCategory: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateCategory: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteCategory: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      variantController: {
        getVariants: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getVariant: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        createVariant: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateVariant: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteVariant: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      mediaController: {
        getMediaAssets: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getMediaAsset: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        createMediaAsset: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateMediaAsset: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteMediaAsset: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      productMediaController: {
        getProductMedia: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getProductMediaStatistics: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        validateProductMedia: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getProductsUsingAsset: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getAssetUsageCount: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        setProductCoverImage: vi.fn(async (req, reply) => reply.code(204).send()),
        reorderProductMedia: vi.fn(async (req, reply) => reply.code(204).send()),
        duplicateProductMedia: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        addMediaToProduct: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        setProductMedia: vi.fn(async (req, reply) => reply.code(204).send()),
        removeCoverImage: vi.fn(async (req, reply) => reply.code(204).send()),
        removeAllProductMedia: vi.fn(async (req, reply) => reply.code(204).send()),
        removeMediaFromProduct: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      productTagController: {},
      searchController: {},
      sizeGuideController: {},
      editorialLookController: {},
      variantMediaController: {},
    };

    // Replace the missing controllers with empty mocks just to satisfy the route register setup
    Object.keys(mockControllers).forEach(key => {
      if (Object.keys(mockControllers[key]).length === 0) {
         mockControllers[key] = new Proxy({}, { get: () => vi.fn((req, reply) => reply.code(200).send()) });
      }
    });

    await registerProductCatalogRoutes(app, mockControllers);
    await app.ready();
  });

  describe("Product Routes", () => {
    it("GET /api/v1/products", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/products" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.productController.listProducts).toHaveBeenCalled();
    });

    it("POST /api/v1/products", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/products",
        payload: {
          title: "New Product",
          slug: "new-product",
          description: "Test description",
          price: 199.99,
          currency: "USD",
          status: "DRAFT"
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.productController.createProduct).toHaveBeenCalled();
    });
  });

  describe("Category Routes", () => {
    it("GET /api/v1/categories", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/categories" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.categoryController.getCategories).toHaveBeenCalled();
    });

    it("POST /api/v1/categories", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/categories",
        payload: {
          name: "Shoes",
          slug: "shoes",
          description: "Footwear",
          isActive: true
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.categoryController.createCategory).toHaveBeenCalled();
    });
  });

  describe("Variant Routes", () => {
    it("GET /api/v1/products/:productId/variants", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/products/uuid-123/variants" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.variantController.getVariants).toHaveBeenCalled();
    });

    it("POST /api/v1/products/:productId/variants", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/products/uuid-123/variants",
        payload: {
          sku: "SHOE-123",
          price: 199.99,
          size: "10",
          color: "Black",
          isActive: true
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.variantController.createVariant).toHaveBeenCalled();
    });
  });

  describe("Media Routes", () => {
    it("GET /api/v1/media", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/media" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.mediaController.getMediaAssets).toHaveBeenCalled();
    });

    it("POST /api/v1/media", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/media",
        payload: {
          url: "https://example.com/image.jpg",
          storageKey: "image.jpg",
          type: "IMAGE",
          altText: "Test image"
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.mediaController.createMediaAsset).toHaveBeenCalled();
    });
  });
  
  describe("Product Media Routes", () => {
    it("GET /api/v1/products/:productId/media", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/products/uuid-123/media" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.productMediaController.getProductMedia).toHaveBeenCalled();
    });

    it("POST /api/v1/products/:productId/media", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/products/uuid-123/media",
        payload: { assetId: "uuid-456", isCover: true, displayOrder: 1 }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.productMediaController.addMediaToProduct).toHaveBeenCalled();
    });
  });
});
