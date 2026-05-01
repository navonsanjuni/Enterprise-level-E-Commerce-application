import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { createServer } from "../../../../apps/api/src/server";
import { PrismaClient } from "@prisma/client";

describe("User Management E2E - Auth Flow", () => {
  let app: FastifyInstance;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    app = await createServer();
    await app.ready();
    
    // Clean up test users before running
    await prisma.user.deleteMany({
      where: { email: "e2e-test@example.com" }
    });
  });

  afterAll(async () => {
    // Clean up test users after running
    // await prisma.user.deleteMany({
    //   where: { email: "e2e-test@example.com" }
    // });
    
    await prisma.$disconnect();
    await app.close();
  });

  it("should successfully register a new user, login, and fetch profile", async () => {
    // 1. Register User
    const registerRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "e2e-test@example.com",
        password: "StrongPassword123!",
        firstName: "Test",
        lastName: "User",
        phone: "+1234567890"
      }
    });

    expect(registerRes.statusCode).toBe(201);
    const registerBody = JSON.parse(registerRes.body);
    expect(registerBody.success).toBe(true);
    expect(registerBody.data.user.email).toBe("e2e-test@example.com");

    // 2. Login
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "e2e-test@example.com",
        password: "StrongPassword123!"
      }
    });

    expect(loginRes.statusCode).toBe(200);
    const loginBody = JSON.parse(loginRes.body);
    expect(loginBody.success).toBe(true);
    expect(loginBody.data.accessToken).toBeDefined();

    const token = loginBody.data.accessToken;

    // 3. Fetch current user profile (Me)
    const meRes = await app.inject({
      method: "GET",
      url: "/api/v1/users/me",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(meRes.statusCode).toBe(200);
    const meBody = JSON.parse(meRes.body);
    expect(meBody.success).toBe(true);
    expect(meBody.data.firstName).toBe("Test");
    expect(meBody.data.lastName).toBe("User");
    // 4. Update the User's Profile with additional fields
    const patchRes = await app.inject({
      method: "PATCH",
      url: "/api/v1/users/me/profile",
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        title: "Mr",
        phone: "+1234567890",
        dateOfBirth: "1990-01-01T00:00:00.000Z",
        residentOf: "United States",
        nationality: "American",
        locale: "en-US",
        currency: "USD"
      }
    });

    expect(patchRes.statusCode).toBe(200);
    const patchedBody = JSON.parse(patchRes.body);
    expect(patchedBody.success).toBe(true);
    expect(patchedBody.data.title).toBe("Mr");
    expect(patchedBody.data.residentOf).toBe("United States");
  });
});
