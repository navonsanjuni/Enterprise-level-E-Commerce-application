import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { createServer } from "../../../../apps/api/src/server";
import { PrismaClient } from "@prisma/client";
import { TokenBlacklistService } from "../../infra/http/security/token-blacklist";
import { UserRole } from "../../domain/value-objects/user-role.vo";
import { UserStatus } from "../../domain/value-objects/user-status.vo";

describe("User Management Module E2E - TRULY COMPREHENSIVE FLOW", () => {
  let app: FastifyInstance;
  const prisma = new PrismaClient();
  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let addressId: string;
  let paymentMethodId: string;

  const testUser = {
    email: "comprehensive-e2e@example.com",
    password: "StrongPassword123!",
    firstName: "Comprehensive",
    lastName: "Tester",
    phone: "+1987654321"
  };

  const secondUser = {
    email: "to-be-deleted@example.com",
    password: "Password123!",
    firstName: "Delete",
    lastName: "Me"
  };

  beforeAll(async () => {
    app = await createServer();
    await app.ready();
    
    // 1. WIPE ALL DATA for user management module
    await prisma.userProfile.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.socialLogin.deleteMany();
    await prisma.user.deleteMany();
    
    console.log("✓ Database wiped for User Management module");
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe("1. Authentication & Registration Lifecycle", () => {
    it("POST /api/v1/auth/register", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: testUser
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      userId = body.data.user.id;
    });

    it("POST /api/v1/auth/verify-email (via resend-verification & interception)", async () => {
      // 1. Trigger token generation
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/resend-verification",
        payload: { email: testUser.email }
      });

      // 2. Intercept token
      const tokens = TokenBlacklistService.__getVerificationTokens();
      let token: string | undefined;
      for (const [t, data] of tokens.entries()) {
        if (data.email === testUser.email) {
          token = t;
          break;
        }
      }

      expect(token).toBeDefined();

      // 3. Verify email
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/verify-email",
        payload: { token }
      });

      expect(res.statusCode).toBe(200);
      
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.emailVerified).toBe(true);
    });

    it("POST /api/v1/auth/login", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: testUser.email,
          password: testUser.password,
          rememberMe: true
        }
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
    });

    it("POST /api/v1/auth/refresh", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: { refreshToken }
      });

      expect(res.statusCode).toBe(200);
      accessToken = JSON.parse(res.body).data.accessToken;
    });

    it("GET /api/v1/auth/me", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
    });
  });

  describe("2. Profile & Detailed Identity Management", () => {
    it("PATCH /api/v1/users/me/profile (Update details & JSON)", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me/profile",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: {
          title: "Senior Tester",
          dateOfBirth: "1990-01-01",
          residentOf: "United Kingdom",
          nationality: "British",
          locale: "en-GB",
          currency: "GBP",
          prefs: { darkMode: true, newsletter: true },
          stylePreferences: { favoriteColors: ["green", "white"] },
          preferredSizes: { shoes: "10", shirt: "L" }
        }
      });

      expect(res.statusCode).toBe(200);
    });

    it("GET /api/v1/users/me/profile", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/users/me/profile", // Fixed URL
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      // Response schema uses 'preferences', not 'prefs'
      expect(body.data.preferences.darkMode).toBe(true);
    });
  });

  describe("3. Addresses Management Lifecycle", () => {
    it("POST /api/v1/users/me/addresses", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/users/me/addresses",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: {
          type: "shipping",
          isDefault: true,
          firstName: "E2E",
          lastName: "Tester",
          company: "Test Corp",
          addressLine1: "10 Downing St",
          addressLine2: "Apartment 1",
          city: "London",
          state: "London",
          postalCode: "SW1A 2AA",
          country: "GB",
          phone: "+442079250918"
        }
      });

      expect(res.statusCode).toBe(201);
      addressId = JSON.parse(res.body).data.id;
    });

    it("PATCH /api/v1/users/me/addresses/:addressId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/me/addresses/${addressId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: { addressLine2: "Suite 10" }
      });

      expect(res.statusCode).toBe(200);
    });

    it("PATCH /api/v1/users/me/addresses/:addressId/default", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/me/addresses/${addressId}/default`,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
    });

    it("GET /api/v1/users/me/addresses", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/users/me/addresses",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res.body).data;
      expect(data.items.length).toBeGreaterThan(0);
      const addr = data.items.find((a: any) => a.id === addressId);
      expect(addr.firstName).toBe("E2E");
      expect(addr.company).toBe("Test Corp");
      expect(addr.phone).toBe("+442079250918");
      expect(addr.isDefault).toBe(true);
    });
  });

  describe("4. Payment Methods Management Lifecycle", () => {
    it("POST /api/v1/users/me/payment-methods", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/users/me/payment-methods",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: {
          type: "card",
          brand: "Visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2030,
          billingAddressId: addressId,
          providerRef: "pm_tok_visa",
          isDefault: true
        }
      });

      expect(res.statusCode).toBe(201);
      paymentMethodId = JSON.parse(res.body).data.id;
    });

    it("PATCH /api/v1/users/me/payment-methods/:paymentMethodId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/me/payment-methods/${paymentMethodId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: { expYear: 2031 }
      });

      expect(res.statusCode).toBe(200);
    });

    it("PATCH /api/v1/users/me/payment-methods/:paymentMethodId/default", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/me/payment-methods/${paymentMethodId}/default`,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
    });

    it("GET /api/v1/users/me/payment-methods", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/users/me/payment-methods",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.items.length).toBeGreaterThan(0);
    });
  });

  describe("5. Account Security Flows", () => {
    it("POST /api/v1/auth/forgot-password & reset-password", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: { email: testUser.email }
      });

      const tokens = TokenBlacklistService.__getPasswordResetTokens();
      let token: string | undefined;
      for (const [t, data] of tokens.entries()) {
        if (data.email === testUser.email) {
          token = t;
          break;
        }
      }

      expect(token).toBeDefined();

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: { token, newPassword: "ResetPassword456!" }
      });

      expect(res.statusCode).toBe(200);

      const loginRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: testUser.email, password: "ResetPassword456!" }
      });
      accessToken = JSON.parse(loginRes.body).data.accessToken;
    });

    it("POST /api/v1/auth/change-password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/change-password",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: {
          currentPassword: "ResetPassword456!",
          newPassword: testUser.password
        }
      });

      expect(res.statusCode).toBe(200);
    });

    it("POST /api/v1/auth/change-email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/change-email",
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: { 
          newEmail: "new-comp-email@example.com",
          password: testUser.password
        }
      });

      expect(res.statusCode).toBe(200);
    });
  });

  describe("6. Admin Operations", () => {
    let adminToken: string;

    beforeAll(async () => {
      // Create second user for admin testing
      await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: secondUser });
      
      // Elevate first user to ADMIN (Note: email was changed to new-comp-email@example.com)
      await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
      
      // Relogin to get Admin token
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "new-comp-email@example.com", password: testUser.password }
      });
      adminToken = JSON.parse(res.body).data.accessToken;
    });

    it("GET /api/v1/admin/users", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/admin/users",
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.statusCode).toBe(200);
    });

    it("GET /api/v1/users/:userId (Admin)", async () => {
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/users/${userId}`,
          headers: { Authorization: `Bearer ${adminToken}` }
        });
  
        expect(res.statusCode).toBe(200);
      });

    it("PATCH /api/v1/users/:userId/status (Admin)", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/${userId}/status`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { status: UserStatus.ACTIVE }
      });

      expect(res.statusCode).toBe(200);
    });

    it("PATCH /api/v1/users/:userId/role (Admin)", async () => {
        const res = await app.inject({
          method: "PATCH",
          url: `/api/v1/users/${userId}/role`,
          headers: { Authorization: `Bearer ${adminToken}` },
          payload: { role: UserRole.ADMIN }
        });
  
        expect(res.statusCode).toBe(200);
      });

    it("PATCH /api/v1/users/:userId/email-verified (Admin)", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/users/${userId}/email-verified`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { isVerified: true }
      });

      expect(res.statusCode).toBe(200);
    });

    it("DELETE /api/v1/users/:userId (Admin)", async () => {
      const secondUserRow = await prisma.user.findUnique({ where: { email: secondUser.email } });
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/users/${secondUserRow?.id}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe("7. Final Cleanup Flow", () => {
    it("POST /api/v1/auth/logout", async () => {
      const loginRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "new-comp-email@example.com", password: testUser.password, rememberMe: true }
      });
      const { accessToken: at, refreshToken: rt } = JSON.parse(loginRes.body).data;

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
        headers: { Authorization: `Bearer ${at}` },
        payload: { refreshToken: rt }
      });

      expect(res.statusCode).toBe(200);
    });

    it("POST /api/v1/auth/delete-account", async () => {
        const loginRes = await app.inject({
            method: "POST",
            url: "/api/v1/auth/login",
            payload: { email: "new-comp-email@example.com", password: testUser.password }
        });
        const freshToken = JSON.parse(loginRes.body).data.accessToken;

        const res = await app.inject({
          method: "POST",
          url: "/api/v1/auth/delete-account",
          headers: { Authorization: `Bearer ${freshToken}` },
          payload: { password: testUser.password }
        });
  
        expect(res.statusCode).toBe(200);
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        expect(user).toBeNull();
      });
  });
});
