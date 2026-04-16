import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { CategoryManagementService, CategoryTreeNode } from "../services/category-management.service";

export interface GetCategoryHierarchyQuery extends IQuery {}

export class GetCategoryHierarchyHandler implements IQueryHandler<GetCategoryHierarchyQuery, QueryResult<CategoryTreeNode[]>> {
  constructor(private readonly categoryManagementService: CategoryManagementService) {}

  async handle(_input: GetCategoryHierarchyQuery): Promise<QueryResult<CategoryTreeNode[]>> {
    try {
    return QueryResult.success(await this.categoryManagementService.getCategoryHierarchy());
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
