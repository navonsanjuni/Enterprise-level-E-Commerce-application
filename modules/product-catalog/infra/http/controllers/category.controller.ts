import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import {
  CreateCategoryInput,
  CreateCategoryHandler,
  UpdateCategoryInput,
  UpdateCategoryHandler,
  DeleteCategoryInput,
  DeleteCategoryHandler,
  ReorderCategoriesInput,
  ReorderCategoriesHandler,
  GetCategoryInput,
  GetCategoryHandler,
  ListCategoriesInput,
  ListCategoriesHandler,
  GetCategoryHierarchyInput,
  GetCategoryHierarchyHandler,
} from "../../../application";
import { ResponseHelper } from "@/api/src/shared/response.helper";

export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  position?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  parentId?: string;
  includeChildren?: boolean;
  sortBy?: "name" | "position";
  sortOrder?: "asc" | "desc";
}

export class CategoryController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryHandler,
    private readonly updateCategoryHandler: UpdateCategoryHandler,
    private readonly deleteCategoryHandler: DeleteCategoryHandler,
    private readonly reorderCategoriesHandler: ReorderCategoriesHandler,
    private readonly getCategoryHandler: GetCategoryHandler,
    private readonly listCategoriesHandler: ListCategoriesHandler,
    private readonly getCategoryHierarchyHandler: GetCategoryHierarchyHandler,
  ) {}


  async getCategories(
    request: AuthenticatedRequest<{ Querystring: CategoryQueryParams }>,
    reply: FastifyReply,
  ) {
    try {
      const query: ListCategoriesInput = {
        page: request.query.page,
        limit: request.query.limit,
        parentId: request.query.parentId,
        includeChildren: request.query.includeChildren,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder,
      };

      const result = await this.listCategoriesHandler.handle(query);
      return ResponseHelper.ok(reply, "Categories retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getCategory(
    request: AuthenticatedRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const query: GetCategoryInput = { categoryId: request.params.id };
      const result = await this.getCategoryHandler.handle(query);
      return ResponseHelper.ok(reply, "Category retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getCategoryBySlug(
    request: AuthenticatedRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const query: GetCategoryInput = { slug: request.params.slug };
      const result = await this.getCategoryHandler.handle(query);
      return ResponseHelper.ok(reply, "Category retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async createCategory(
    request: AuthenticatedRequest<{ Body: CreateCategoryRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const body = request.body;
      const command: CreateCategoryInput = {
        name: body.name,
        parentId: body.parentId,
        position: body.position,
      };

      const result = await this.createCategoryHandler.handle(command);

      return ResponseHelper.fromCommand(
        reply,
        result,
        "Category created successfully",
        201,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async updateCategory(
    request: AuthenticatedRequest<{
      Params: { id: string };
      Body: UpdateCategoryRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const body = request.body;
      const command: UpdateCategoryInput = {
        categoryId: id,
        name: body.name,
        parentId: body.parentId,
        position: body.position,
      };

      const result = await this.updateCategoryHandler.handle(command);

      return ResponseHelper.fromCommand(
        reply,
        result,
        "Category updated successfully",
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async deleteCategory(
    request: AuthenticatedRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: DeleteCategoryInput = { categoryId: request.params.id };
      const result = await this.deleteCategoryHandler.handle(command);
      return ResponseHelper.fromCommand(
        reply,
        result,
        "Category deleted successfully",
        undefined,
        204,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getCategoryHierarchy(_request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const query: GetCategoryHierarchyInput = {};
      const result = await this.getCategoryHierarchyHandler.handle(query);
      return ResponseHelper.ok(reply, "Category hierarchy retrieved successfully", result);
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async reorderCategories(
    request: AuthenticatedRequest<{
      Body: { categoryOrders: Array<{ id: string; position: number }> };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const command: ReorderCategoriesInput = {
        categoryOrders: request.body.categoryOrders,
      };
      const result = await this.reorderCategoriesHandler.handle(command);
      return ResponseHelper.fromCommand(
        reply,
        result,
        "Categories reordered successfully",
        undefined,
        204,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }
}
