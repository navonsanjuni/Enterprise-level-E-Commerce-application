import { FastifyInstance } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import { LoyaltyController } from "../../../../loyalty/infra/http/controllers/loyalty.controller";
import {
  RolePermissions,
  createRateLimiter,
  RateLimitPresets,
  userKeyGenerator,
} from "@/api/src/shared/middleware";
import { validateBody, validateQuery } from "../validation/validator";
import {
  createLoyaltyProgramSchema,
  awardPointsSchema,
  redeemPointsSchema,
  getLoyaltyAccountQuerySchema,
  listLoyaltyTransactionsQuerySchema,
} from "../validation/loyalty.schema";

const writeRateLimiter = createRateLimiter({
  ...RateLimitPresets.writeOperations,
  keyGenerator: userKeyGenerator,
});

const loyaltyProgramSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    earnRules: { type: "array", items: { type: "object", additionalProperties: true } },
    burnRules: { type: "array", items: { type: "object", additionalProperties: true } },
    tiers: { type: "array", items: { type: "object", additionalProperties: true } },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

const loyaltyAccountSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    currentBalance: { type: "number" },
    totalPointsEarned: { type: "number" },
    totalPointsRedeemed: { type: "number" },
    lifetimePoints: { type: "number" },
    tier: { type: "string" },
    tierMultiplier: { type: "number" },
    joinedAt: { type: "string", format: "date-time" },
    lastActivityAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

const loyaltyTransactionSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    accountId: { type: "string", format: "uuid" },
    type: { type: "string" },
    points: { type: "number" },
    reason: { type: "string" },
    description: { type: "string" },
    referenceId: { type: "string" },
    orderId: { type: "string", format: "uuid" },
    createdBy: { type: "string" },
    expiresAt: { type: "string", format: "date-time" },
    balanceAfter: { type: "number" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export async function registerLoyaltyRoutes(
  fastify: FastifyInstance,
  controller: LoyaltyController,
): Promise<void> {
  fastify.addHook("onRequest", async (request, reply) => {
    if (request.method !== "GET") {
      await writeRateLimiter(request, reply);
    }
  });

  // POST /loyalty/programs — Admin only
  fastify.post(
    "/loyalty/programs",
    {
      preValidation: [validateBody(createLoyaltyProgramSchema)],
      preHandler: [RolePermissions.ADMIN_ONLY],
      schema: {
        description: "Create a new loyalty program — Admin only.",
        tags: ["Loyalty Programs"],
        summary: "Create Loyalty Program",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "earnRules", "burnRules", "tiers"],
          properties: {
            name: { type: "string" },
            earnRules: { type: "array", items: { type: "object", additionalProperties: true } },
            burnRules: { type: "array", items: { type: "object", additionalProperties: true } },
            tiers: { type: "array", items: { type: "object", additionalProperties: true } },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: loyaltyProgramSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.createProgram(request as any, reply),
  );

  // GET /loyalty/programs — public
  fastify.get(
    "/loyalty/programs",
    {
      schema: {
        description: "List all available loyalty programs.",
        tags: ["Loyalty Programs"],
        summary: "List Loyalty Programs",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "array",
                items: loyaltyProgramSchema,
              },
            },
          },
        },
      },
    },
    (request, reply) => controller.listPrograms(request as any, reply),
  );

  // GET /loyalty/account — authenticated
  fastify.get(
    "/loyalty/account",
    {
      preValidation: [validateQuery(getLoyaltyAccountQuerySchema)],
      preHandler: [RolePermissions.AUTHENTICATED],
      schema: {
        description: "Get loyalty account details for a user.",
        tags: ["Loyalty Accounts"],
        summary: "Get Loyalty Account",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: loyaltyAccountSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.getAccount(request as AuthenticatedRequest, reply),
  );

  // POST /loyalty/points/award — Staff/Admin only
  fastify.post(
    "/loyalty/points/award",
    {
      preValidation: [validateBody(awardPointsSchema)],
      preHandler: [RolePermissions.STAFF_LEVEL],
      schema: {
        description: "Award loyalty points to a customer — Staff/Admin only.",
        tags: ["Loyalty Transactions"],
        summary: "Award Loyalty Points",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["userId", "points", "reason"],
          properties: {
            userId: { type: "string", format: "uuid" },
            points: { type: "number", minimum: 1 },
            reason: { type: "string" },
            orderId: { type: "string", format: "uuid" },
            description: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: loyaltyTransactionSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.awardPoints(request as any, reply),
  );

  // POST /loyalty/points/redeem — Staff/Admin only
  fastify.post(
    "/loyalty/points/redeem",
    {
      preValidation: [validateBody(redeemPointsSchema)],
      preHandler: [RolePermissions.STAFF_LEVEL],
      schema: {
        description: "Redeem loyalty points for a discount or reward — Staff/Admin only.",
        tags: ["Loyalty Transactions"],
        summary: "Redeem Loyalty Points",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["userId", "points", "orderId"],
          properties: {
            userId: { type: "string", format: "uuid" },
            points: { type: "number", minimum: 1 },
            orderId: { type: "string", format: "uuid" },
            reason: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: loyaltyTransactionSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.redeemPoints(request as any, reply),
  );

  // GET /loyalty/transactions — authenticated
  fastify.get(
    "/loyalty/transactions",
    {
      preValidation: [validateQuery(listLoyaltyTransactionsQuerySchema)],
      preHandler: [RolePermissions.AUTHENTICATED],
      schema: {
        description: "List loyalty transaction history filtered by account or order.",
        tags: ["Loyalty Transactions"],
        summary: "List Loyalty Transactions",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            accountId: { type: "string", format: "uuid" },
            orderId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "array",
                items: loyaltyTransactionSchema,
              },
            },
          },
        },
      },
    },
    (request, reply) => controller.listTransactions(request as AuthenticatedRequest, reply),
  );
}
