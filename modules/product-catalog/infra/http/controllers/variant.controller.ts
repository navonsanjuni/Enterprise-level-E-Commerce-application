import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import {
  CreateProductVariantInput,
  CreateProductVariantHandler,
  UpdateProductVariantInput,
  UpdateProductVariantHandler,
  DeleteProductVariantInput,
  DeleteProductVariantHandler,
  ListVariantsInput,
  ListVariantsHandler,
  GetVariantInput,
  GetVariantHandler,
} from "../../../application";
import { ResponseHelper } from "@/api/src/shared/response.helper";

export interface CreateVariantRequest {
  sku: string;
  size?: string;
  color?: string;
  barcode?: string;
  weightG?: number;
  dims?: Record<string, any>;
  taxClass?: string;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  restockEta?: string;
}

export interface UpdateVariantRequest extends Partial<CreateVariantRequest> {}

export interface VariantQueryParams {
  page?: number;
  limit?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  sortBy?: "sku" | "createdAt" | "size" | "color";
  sortOrder?: "asc" | "desc";
}

export class VariantController {
  constructor(
    private readonly createVariantHandler: CreateProductVariantHandler,
    private readonly updateVariantHandler: UpdateProductVariantHandler,
    private readonly deleteVariantHandler: DeleteProductVariantHandler,
    private readonly listVariantsHandler: ListVariantsHandler,
    private readonly getVariantHandler: GetVariantHandler,
  ) {}


  async getVariants(
    request: AuthenticatedRequest<{
      Params: { productId: string };
      Querystring: VariantQueryParams;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const query: ListVariantsInput = {
        productId: request.params.productId,
        page: request.query.page,
        limit: request.query.limit,
        size: request.query.size,
        color: request.query.color,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder,
      };

      const result = await this.listVariantsHandler.handle(query);
      return ResponseHelper.ok(reply, "Variants retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getVariant(
    request: AuthenticatedRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const query: GetVariantInput = { variantId: request.params.variantId };
      const result = await this.getVariantHandler.handle(query);
      return ResponseHelper.ok(reply, "Variant retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async createVariant(
    request: AuthenticatedRequest<{
      Params: { productId: string };
      Body: CreateVariantRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { productId } = request.params;
      const body = request.body;

      const command: CreateProductVariantInput = {
        productId,
        sku: body.sku,
        size: body.size,
        color: body.color,
        barcode: body.barcode,
        weightG: body.weightG,
        dims: body.dims,
        taxClass: body.taxClass,
        allowBackorder: body.allowBackorder,
        allowPreorder: body.allowPreorder,
        restockEta: body.restockEta ? new Date(body.restockEta) : undefined,
      };

      const result = await this.createVariantHandler.handle(command);

      return ResponseHelper.fromCommand(reply, result, "Variant created successfully", 201);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async updateVariant(
    request: AuthenticatedRequest<{
      Params: { variantId: string };
      Body: UpdateVariantRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const body = request.body;

      const command: UpdateProductVariantInput = {
        variantId: request.params.variantId,
        sku: body.sku,
        size: body.size,
        color: body.color,
        barcode: body.barcode,
        weightG: body.weightG,
        dims: body.dims,
        taxClass: body.taxClass,
        allowBackorder: body.allowBackorder,
        allowPreorder: body.allowPreorder,
        restockEta: body.restockEta ? new Date(body.restockEta) : undefined,
      };

      const result = await this.updateVariantHandler.handle(command);

      return ResponseHelper.fromCommand(reply, result, "Variant updated successfully");
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async deleteVariant(
    request: AuthenticatedRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: DeleteProductVariantInput = { variantId: request.params.variantId };
      const result = await this.deleteVariantHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Variant deleted successfully", undefined, 204);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }
}
