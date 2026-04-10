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
import { CategoryManagementService } from "../../../application/services/category-management.service";
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
  sortBy?: "name" | "position" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export class CategoryController {
  private createCategoryHandler: CreateCategoryHandler;
  private updateCategoryHandler: UpdateCategoryHandler;
  private deleteCategoryHandler: DeleteCategoryHandler;
  private reorderCategoriesHandler: ReorderCategoriesHandler;
  private getCategoryHandler: GetCategoryHandler;
  private listCategoriesHandler: ListCategoriesHandler;
  private getCategoryHierarchyHandler: GetCategoryHierarchyHandler;

  constructor(categoryManagementService: CategoryManagementService) {
    this.createCategoryHandler = new CreateCategoryHandler(
      categoryManagementService,
    );
    this.updateCategoryHandler = new UpdateCategoryHandler(
      categoryManagementService,
    );
    this.deleteCategoryHandler = new DeleteCategoryHandler(
      categoryManagementService,
    );
    this.reorderCategoriesHandler = new ReorderCategoriesHandler(
      categoryManagementService,
    );
    this.getCategoryHandler = new GetCategoryHandler(categoryManagementService);
    this.listCategoriesHandler = new ListCategoriesHandler(
      categoryManagementService,
    );
    this.getCategoryHierarchyHandler = new GetCategoryHierarchyHandler(
      categoryManagementService,
    );
  }

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
      request.log.error(error, "Failed to get categories");
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
      request.log.error(error, "Failed to get category");
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
      request.log.error(error, "Failed to get category by slug");
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
      request.log.error(error, "Failed to create category");
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
      request.log.error(error, "Failed to update category");
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
      );
    } catch (error) {
      request.log.error(error, "Failed to delete category");
      return ResponseHelper.error(reply, error);
    }
  }

  async getCategoryHierarchy(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const query: GetCategoryHierarchyInput = {};
      const result = await this.getCategoryHierarchyHandler.handle(query);
      return ResponseHelper.ok(reply, "Category hierarchy retrieved successfully", result);
    } catch (error) {
      request.log.error(error, "Failed to get category hierarchy");
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
      );
    } catch (error) {
      request.log.error(error, "Failed to reorder categories");
      return ResponseHelper.error(reply, error);
    }
  }
}
