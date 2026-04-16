import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { CategoryDTO } from "../../domain/entities/category.entity";
import { CategoryManagementService } from "../services/category-management.service";
import { DomainValidationError } from "../../domain/errors/product-catalog.errors";

export interface GetCategoryQuery extends IQuery {
  readonly categoryId?: string;
  readonly slug?: string;
}

export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery, QueryResult<CategoryDTO>> {
  constructor(private readonly categoryManagementService: CategoryManagementService) {}

  async handle(input: GetCategoryQuery): Promise<QueryResult<CategoryDTO>> {
    try {
    if (!input.categoryId && !input.slug) {
      throw new DomainValidationError("Either categoryId or slug is required");
    }
    if (input.categoryId) {
      return QueryResult.success(await this.categoryManagementService.getCategoryById(input.categoryId));
    }
    return QueryResult.success(await this.categoryManagementService.getCategoryBySlug(input.slug!));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
