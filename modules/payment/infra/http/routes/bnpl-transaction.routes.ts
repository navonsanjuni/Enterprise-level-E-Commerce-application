import { FastifyInstance } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import { BnplTransactionController } from "../controllers/bnpl-transaction.controller";
import {
  RolePermissions,
  createRateLimiter,
  RateLimitPresets,
  userKeyGenerator,
} from "@/api/src/shared/middleware";
import { validateBody, validateParams, validateQuery } from "../validation/validator";
import {
  createBnplTransactionSchema,
  bnplParamsSchema,
  listBnplQuerySchema,
} from "../validation/bnpl.schema";

const writeRateLimiter = createRateLimiter({
  ...RateLimitPresets.writeOperations,
  keyGenerator: userKeyGenerator,
});

const bnplTransactionSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    intentId: { type: "string", format: "uuid" },
    provider: { type: "string" },
    plan: { type: "object", additionalProperties: true },
    status: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export async function registerBnplTransactionRoutes(
  fastify: FastifyInstance,
  controller: BnplTransactionController,
): Promise<void> {
  fastify.addHook("onRequest", async (request, reply) => {
    if (request.method !== "GET") {
      await writeRateLimiter(request, reply);
    }
  });

  // POST /bnpl
  fastify.post(
    "/bnpl",
    {
      preValidation: [validateBody(createBnplTransactionSchema)],
      preHandler: [RolePermissions.AUTHENTICATED],
      schema: {
        description: "Create a Buy Now Pay Later (BNPL) transaction.",
        tags: ["BNPL"],
        summary: "Create BNPL Transaction",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["intentId", "provider", "plan"],
          properties: {
            intentId: { type: "string", format: "uuid" },
            provider: { type: "string" },
            plan: { type: "object", additionalProperties: true },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: bnplTransactionSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.create(request as AuthenticatedRequest, reply),
  );

  // POST /bnpl/:bnplId/:action — Staff/Admin only
  fastify.post(
    "/bnpl/:bnplId/:action",
    {
      preValidation: [validateParams(bnplParamsSchema)],
      preHandler: [RolePermissions.STAFF_LEVEL],
      schema: {
        description: "Process a BNPL transaction (approve, reject, activate, complete, cancel) — Staff/Admin only.",
        tags: ["BNPL"],
        summary: "Process BNPL Transaction",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["bnplId", "action"],
          properties: {
            bnplId: { type: "string", format: "uuid" },
            action: {
              type: "string",
              enum: ["approve", "reject", "activate", "complete", "cancel"],
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              statusCode: { type: "number" },
              message: { type: "string" },
              data: bnplTransactionSchema,
            },
          },
        },
      },
    },
    (request, reply) => controller.process(request as AuthenticatedRequest, reply),
  );

  // GET /bnpl
  fastify.get(
    "/bnpl",
    {
      preValidation: [validateQuery(listBnplQuerySchema)],
      preHandler: [RolePermissions.AUTHENTICATED],
      schema: {
        description: "List BNPL transactions with optional filters.",
        tags: ["BNPL"],
        summary: "List BNPL Transactions",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            bnplId: { type: "string", format: "uuid" },
            intentId: { type: "string", format: "uuid" },
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
                items: bnplTransactionSchema,
              },
            },
          },
        },
      },
    },
    (request, reply) => controller.list(request as AuthenticatedRequest, reply),
  );
}
