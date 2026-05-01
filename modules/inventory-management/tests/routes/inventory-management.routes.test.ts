import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import { registerInventoryManagementRoutes } from "../../infra/http/routes/index";

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

describe("Inventory Management Module Routes", () => {
  let app: FastifyInstance;
  let mockControllers: any;

  beforeEach(async () => {
    app = fastify();

    mockControllers = {
      stockController: {
        addStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        adjustStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        transferStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        reserveStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        fulfillReservation: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        setStockThresholds: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getStockByVariant: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getStockStats: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getTotalAvailableStock: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listStocks: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getLowStockItems: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getOutOfStockItems: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      locationController: {
        createLocation: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateLocation: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteLocation: vi.fn(async (req, reply) => reply.code(204).send()),
        getLocation: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listLocations: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      supplierController: {
        createSupplier: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateSupplier: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteSupplier: vi.fn(async (req, reply) => reply.code(204).send()),
        getSupplier: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listSuppliers: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      poController: {
        createPurchaseOrder: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        createPurchaseOrderWithItems: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updatePOStatus: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        receivePOItems: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deletePurchaseOrder: vi.fn(async (req, reply) => reply.code(204).send()),
        getPurchaseOrder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listPurchaseOrders: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getOverduePurchaseOrders: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getPendingReceival: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        updatePOEta: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      poItemController: {
        addPOItem: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updatePOItem: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        removePOItem: vi.fn(async (req, reply) => reply.code(204).send()),
        getPOItems: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      alertController: {
        createStockAlert: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        resolveStockAlert: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteStockAlert: vi.fn(async (req, reply) => reply.code(204).send()),
        getStockAlert: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getActiveAlerts: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        listStockAlerts: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      pickupReservationController: {
        createPickupReservation: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        cancelPickupReservation: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getPickupReservation: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listPickupReservations: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      inventoryTransactionController: {
        getTransactionsByVariant: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        listTransactions: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getTransaction: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
    };

    await registerInventoryManagementRoutes(app, mockControllers);
    await app.ready();
  });

  describe("Stock Routes", () => {
    it("GET /api/v1/stock", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/stock" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.stockController.listStocks).toHaveBeenCalled();
    });

    it("POST /api/v1/stock/add", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/stock/add",
        payload: {
          variantId: "variant-123",
          locationId: "loc-123",
          quantity: 10,
          reason: "INITIAL_STOCK"
        }
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.stockController.addStock).toHaveBeenCalled();
    });
  });

  describe("Location Routes", () => {
    it("GET /api/v1/locations", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/locations" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.locationController.listLocations).toHaveBeenCalled();
    });

    it("POST /api/v1/locations", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/locations",
        payload: {
          name: "Main Warehouse",
          code: "WH-MAIN",
          type: "WAREHOUSE",
          address: { line1: "123 St", city: "City", state: "State", postalCode: "12345", country: "US" },
          isActive: true
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.locationController.createLocation).toHaveBeenCalled();
    });
  });

  describe("Supplier Routes", () => {
    it("GET /api/v1/suppliers", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/suppliers" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.supplierController.listSuppliers).toHaveBeenCalled();
    });

    it("POST /api/v1/suppliers", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/suppliers",
        payload: {
          name: "Shoe Supplier Co",
          code: "SUP-001",
          contactInfo: { name: "John Doe", email: "john@shoes.com" },
          isActive: true
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.supplierController.createSupplier).toHaveBeenCalled();
    });
  });
});
