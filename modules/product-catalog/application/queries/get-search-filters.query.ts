import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductSearchService, SearchFilter } from "../services/product-search.service";

export interface GetSearchFiltersQuery extends IQuery {
  readonly query?: string;
  readonly category?: string;
}

export class GetSearchFiltersHandler implements IQueryHandler<GetSearchFiltersQuery, QueryResult<SearchFilter[]>> {
  constructor(private readonly productSearchService: ProductSearchService) {}

  async handle(input: GetSearchFiltersQuery): Promise<QueryResult<SearchFilter[]>> {
    try {
    return QueryResult.success(await this.productSearchService.getAvailableFilters({ query: input.query, category: input.category }));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
