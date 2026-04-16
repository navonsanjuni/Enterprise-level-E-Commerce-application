import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetPopularEditorialLookProductsQuery extends IQuery {
  readonly limit?: number;
}

export class GetPopularEditorialLookProductsHandler implements IQueryHandler<GetPopularEditorialLookProductsQuery, QueryResult<Array<{ productId: string; appearanceCount: number }>>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: GetPopularEditorialLookProductsQuery): Promise<QueryResult<Array<> {
    try { productId: string; appearanceCount: number     } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }>> {
    return await this.editorialLookManagementService.getPopularProducts(
      Math.min(50, Math.max(1, query.limit ?? 10)),
    );
  }
}
