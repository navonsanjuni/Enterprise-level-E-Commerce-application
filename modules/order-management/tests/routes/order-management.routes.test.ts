import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import { registerOrderManagementRoutes } from "../../infra/http/routes/index";

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

describe("Order Management Module Routes", () => {
  let app: FastifyInstance;
  let mockControllers: any;

  beforeEach(async () => {
    app = fastify();

    mockControllers = {
      orderController: {
        createOrder: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        getOrder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listOrders: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        updateOrderStatus: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        updateOrderTotals: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markOrderPaid: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markOrderFulfilled: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        cancelOrder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteOrder: vi.fn(async (req, reply) => reply.code(204).send()),
        trackOrder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      orderAddressController: {
        setOrderAddresses: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        updateBillingAddress: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        updateShippingAddress: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        getOrderAddress: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      orderItemController: {
        addOrderItem: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateOrderItem: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        removeOrderItem: vi.fn(async (req, reply) => reply.code(204).send()),
        listOrderItems: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getOrderItem: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      orderShipmentController: {
        createShipment: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateShipmentTracking: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markShipmentShipped: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markShipmentDelivered: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listOrderShipments: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getShipment: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      orderStatusHistoryController: {
        logOrderStatusChange: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        getOrderStatusHistory: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      orderEventController: {
        logOrderEvent: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        listOrderEvents: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
        getOrderEvent: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
      },
      preorderController: {
        createPreorder: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updatePreorderReleaseDate: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markPreorderNotified: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deletePreorder: vi.fn(async (req, reply) => reply.code(204).send()),
        getPreorder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listPreorders: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
      backorderController: {
        createBackorder: vi.fn(async (req, reply) => reply.code(201).send({ success: true, data: {} })),
        updateBackorderEta: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        markBackorderNotified: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        deleteBackorder: vi.fn(async (req, reply) => reply.code(204).send()),
        getBackorder: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: {} })),
        listBackorders: vi.fn(async (req, reply) => reply.code(200).send({ success: true, data: [] })),
      },
    };

    await registerOrderManagementRoutes(app, mockControllers);
    await app.ready();
  });

  describe("Order Routes", () => {
    it("GET /api/v1/orders", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/orders" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.orderController.listOrders).toHaveBeenCalled();
    });

    it("POST /api/v1/orders", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/orders",
        payload: {
          customerId: "user-123",
          email: "customer@example.com",
          currency: "USD"
        }
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.orderController.createOrder).toHaveBeenCalled();
    });
  });

  describe("Order Address Routes", () => {
    it("GET /api/v1/orders/:orderId/addresses", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/orders/order-123/addresses" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.orderAddressController.getOrderAddress).toHaveBeenCalled();
    });
  });

  describe("Order Item Routes", () => {
    it("GET /api/v1/orders/:orderId/items", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/orders/order-123/items" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.orderItemController.listOrderItems).toHaveBeenCalled();
    });
  });
  
  describe("Order Shipment Routes", () => {
    it("GET /api/v1/orders/:orderId/shipments", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/orders/order-123/shipments" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.orderShipmentController.listOrderShipments).toHaveBeenCalled();
    });
  });
});
