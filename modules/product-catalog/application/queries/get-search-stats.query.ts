import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductSearchService, SearchStatistics } from "../services/product-search.service";

export interface GetSearchStatsQuery extends IQuery {}

export class GetSearchStatsHandler implements IQueryHandler<GetSearchStatsQuery, QueryResult<SearchStatistics>> {
  constructor(private readonly productSearchService: ProductSearchService) {}

  async handle(_input: GetSearchStatsQuery): Promise<QueryResult<SearchStatistics>> {
    try {
    return QueryResult.success(await this.productSearchService.getSearchStatistics());
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
