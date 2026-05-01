import { describe, it, expect, vi, beforeEach } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import { registerUserManagementRoutes } from "../../infra/http/routes/index";


// Mock Rate Limiter and Auth Middleware
vi.mock("@/api/src/shared/middleware/rate-limiter.middleware", () => ({
  createRateLimiter: () => async () => {},
  RateLimitPresets: {
    auth: { max: 100, timeWindowMs: 60000 },
    writeOperations: { max: 100, timeWindowMs: 60000 },
    api: { max: 100, timeWindowMs: 60000 },
    readOperations: { max: 100, timeWindowMs: 60000 },
  },
  userKeyGenerator: (req: any) => req.user?.id || req.ip,
}));

vi.mock("@/api/src/shared/middleware/authenticate.middleware", () => ({
  authenticate: async (request: any, reply: any) => {
    request.user = { id: "test-user-id", role: "ADMIN" }; // Defaulting to ADMIN so we can test admin routes too
  },
}));

// Mock Role Permissions
vi.mock("@/api/src/shared/middleware/role-authorization.middleware", () => ({
  RolePermissions: {
    AUTHENTICATED: async () => {},
    ADMIN_ONLY: async () => {},
    STAFF_LEVEL: async () => {},
  },
}));

describe("User Management Module Routes", () => {
  let app: FastifyInstance;
  let mockControllers: any;

  beforeEach(async () => {
    app = fastify();

    // Setup mocks for all controllers
    const mockUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      role: "ADMIN",
      isGuest: false,
      emailVerified: true,
      phoneVerified: true,
    };

    mockControllers = {
      authController: {
        register: vi.fn(async (req, reply) => reply.code(201).send({ success: true, statusCode: 201, message: "Created", data: { user: mockUser } })),
        login: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { user: mockUser } })),
        refreshToken: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: {} })),
        logout: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK" })),
        me: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { user: mockUser } })),
        changePassword: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "changePassword" } })),
        forgotPassword: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "forgotPassword" } })),
        resetPassword: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "resetPassword" } })),
        verifyEmail: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "verifyEmail" } })),
        resendVerification: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "resendVerification" } })),
        changeEmail: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { action: "changeEmail" } })),
        deleteAccount: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK" })),
      },
      profileController: {
        getCurrentUserProfile: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: mockUser })),
        updateCurrentUserProfile: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: mockUser })),
      },
      addressesController: {
        getCurrentUserAddresses: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { items: [], total: 0, limit: 10, offset: 0, hasMore: false } })),
        addCurrentUserAddress: vi.fn(async (req, reply) => reply.code(201).send({ success: true, statusCode: 201, message: "Created", data: { id: mockUser.id } })),
        updateCurrentUserAddress: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { id: mockUser.id } })),
        setDefaultAddress: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { id: mockUser.id } })),
        deleteCurrentUserAddress: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      paymentMethodsController: {
        getCurrentUserPaymentMethods: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { items: [], total: 0, limit: 10, offset: 0, hasMore: false } })),
        addCurrentUserPaymentMethod: vi.fn(async (req, reply) => reply.code(201).send({ success: true, statusCode: 201, message: "Created", data: { id: mockUser.id } })),
        updateCurrentUserPaymentMethod: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { id: mockUser.id } })),
        setDefaultCurrentUserPaymentMethod: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { id: mockUser.id } })),
        deleteCurrentUserPaymentMethod: vi.fn(async (req, reply) => reply.code(204).send()),
      },
      usersController: {
        getCurrentUser: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: mockUser })),
        listUsers: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { items: [], total: 0, limit: 10, offset: 0, hasMore: false } })),
        getUser: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: mockUser })),
        updateStatus: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { userId: mockUser.id } })),
        updateRole: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { userId: mockUser.id } })),
        toggleEmailVerification: vi.fn(async (req, reply) => reply.code(200).send({ success: true, statusCode: 200, message: "OK", data: { userId: mockUser.id } })),
        deleteUser: vi.fn(async (req, reply) => reply.code(204).send()),
      },
    };

    // Register all user-management routes (this includes all 5 route files)
    await registerUserManagementRoutes(app, mockControllers);
    await app.ready();
  });

  describe("Auth Routes (auth.routes.ts)", () => {
    it("POST /api/v1/auth/register", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: { email: "test@ex.com", password: "Password123!", firstName: "T", lastName: "U" },
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.authController.register).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/login", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "test@ex.com", password: "Password123!" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.login).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/refresh", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken: "some-token" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.refreshToken).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/logout", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
        payload: { refreshToken: "some-token" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.logout).toHaveBeenCalled();
    });

    it("GET /api/v1/auth/me", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/auth/me" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.me).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/change-password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/change-password",
        payload: { currentPassword: "OldPassword1!", newPassword: "NewPassword1!" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.changePassword).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/forgot-password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: { email: "test@ex.com" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.forgotPassword).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/reset-password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: { token: "token123", newPassword: "NewPassword1!" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.resetPassword).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/verify-email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/verify-email",
        payload: { token: "token123" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.verifyEmail).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/resend-verification", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/resend-verification",
        payload: { email: "test@ex.com" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.resendVerification).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/change-email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/change-email",
        payload: { newEmail: "new@ex.com", password: "Password123!" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.changeEmail).toHaveBeenCalled();
    });

    it("POST /api/v1/auth/delete-account", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/delete-account",
        payload: { password: "Password123!" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.authController.deleteAccount).toHaveBeenCalled();
    });
  });

  describe("Profile Routes (profile.routes.ts)", () => {
    it("GET /api/v1/users/me/profile", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/users/me/profile" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.profileController.getCurrentUserProfile).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/me/profile", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me/profile",
        payload: { firstName: "Updated" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.profileController.updateCurrentUserProfile).toHaveBeenCalled();
    });
  });

  describe("Addresses Routes (addresses.routes.ts)", () => {
    it("GET /api/v1/users/me/addresses", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/users/me/addresses" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.addressesController.getCurrentUserAddresses).toHaveBeenCalled();
    });

    it("POST /api/v1/users/me/addresses", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/users/me/addresses",
        payload: {
          type: "shipping",
          addressLine1: "123 Main St",
          city: "Metropolis",
          country: "US",
        },
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.addressesController.addCurrentUserAddress).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/me/addresses/:addressId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me/addresses/123e4567-e89b-12d3-a456-426614174000",
        payload: { city: "Gotham" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.addressesController.updateCurrentUserAddress).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/me/addresses/:addressId/default", async () => {
      const res = await app.inject({ method: "PATCH", url: "/api/v1/users/me/addresses/123e4567-e89b-12d3-a456-426614174000/default" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.addressesController.setDefaultAddress).toHaveBeenCalled();
    });

    it("DELETE /api/v1/users/me/addresses/:addressId", async () => {
      const res = await app.inject({ method: "DELETE", url: "/api/v1/users/me/addresses/123e4567-e89b-12d3-a456-426614174000" });
      expect(res.statusCode).toBe(204);
      expect(mockControllers.addressesController.deleteCurrentUserAddress).toHaveBeenCalled();
    });
  });

  describe("Payment Methods Routes (payment-methods.routes.ts)", () => {
    it("GET /api/v1/users/me/payment-methods", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/users/me/payment-methods" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.paymentMethodsController.getCurrentUserPaymentMethods).toHaveBeenCalled();
    });

    it("POST /api/v1/users/me/payment-methods", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/users/me/payment-methods",
        payload: {
          type: "card",
          brand: "Visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2030,
        },
      });
      expect(res.statusCode).toBe(201);
      expect(mockControllers.paymentMethodsController.addCurrentUserPaymentMethod).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/me/payment-methods/:paymentMethodId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me/payment-methods/123e4567-e89b-12d3-a456-426614174000",
        payload: { last4: "1234" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.paymentMethodsController.updateCurrentUserPaymentMethod).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/me/payment-methods/:paymentMethodId/default", async () => {
      const res = await app.inject({ method: "PATCH", url: "/api/v1/users/me/payment-methods/123e4567-e89b-12d3-a456-426614174000/default" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.paymentMethodsController.setDefaultCurrentUserPaymentMethod).toHaveBeenCalled();
    });

    it("DELETE /api/v1/users/me/payment-methods/:paymentMethodId", async () => {
      const res = await app.inject({ method: "DELETE", url: "/api/v1/users/me/payment-methods/123e4567-e89b-12d3-a456-426614174000" });
      expect(res.statusCode).toBe(204);
      expect(mockControllers.paymentMethodsController.deleteCurrentUserPaymentMethod).toHaveBeenCalled();
    });
  });

  describe("Users Routes (users.routes.ts)", () => {
    it("GET /api/v1/users/me", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/users/me" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.getCurrentUser).toHaveBeenCalled();
    });

    it("GET /api/v1/admin/users", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/admin/users" });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.listUsers).toHaveBeenCalled();
    });

    it("GET /api/v1/users/:userId", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000" });
      if (res.statusCode !== 200) console.error("GET /users/:userId failed:", res.body);
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.getUser).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/:userId/status", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/status",
        payload: { status: "active" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.updateStatus).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/:userId/role", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/role",
        payload: { role: "ADMIN" },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.updateRole).toHaveBeenCalled();
    });

    it("PATCH /api/v1/users/:userId/email-verified", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000/email-verified",
        payload: { isVerified: true },
      });
      expect(res.statusCode).toBe(200);
      expect(mockControllers.usersController.toggleEmailVerification).toHaveBeenCalled();
    });

    it("DELETE /api/v1/users/:userId", async () => {
      const res = await app.inject({ method: "DELETE", url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000" });
      expect(res.statusCode).toBe(204);
      expect(mockControllers.usersController.deleteUser).toHaveBeenCalled();
    });
  });
});
