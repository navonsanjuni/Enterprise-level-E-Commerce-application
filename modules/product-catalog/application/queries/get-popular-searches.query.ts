import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductSearchService } from "../services/product-search.service";

export interface GetPopularSearchesQuery extends IQuery {}

export interface PopularSearchResult {
  readonly term: string;
  readonly count: number;
}

export class GetPopularSearchesHandler implements IQueryHandler<GetPopularSearchesQuery, QueryResult<PopularSearchResult[]>> {
  constructor(private readonly productSearchService: ProductSearchService) {}

  async handle(_input: GetPopularSearchesQuery): Promise<QueryResult<PopularSearchResult[]>> {
    try {
    return QueryResult.success(await this.productSearchService.getPopularSearches());
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
