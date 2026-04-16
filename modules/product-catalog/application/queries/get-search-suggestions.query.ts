import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductSearchService, SearchSuggestion } from "../services/product-search.service";

export interface GetSearchSuggestionsQuery extends IQuery {
  readonly searchTerm: string;
  readonly limit?: number;
  readonly type?: "products" | "categories" | "brands" | "all";
}

export interface GetSearchSuggestionsResult {
  readonly suggestions: SearchSuggestion[];
  readonly query: string;
  readonly type: string;
  readonly limit: number;
}

export class GetSearchSuggestionsHandler implements IQueryHandler<GetSearchSuggestionsQuery, QueryResult<GetSearchSuggestionsResult>> {
  constructor(private readonly productSearchService: ProductSearchService) {}

  async handle(input: GetSearchSuggestionsQuery): Promise<QueryResult<GetSearchSuggestionsResult>> {
    try {
    const limit = Math.min(50, Math.max(1, input.limit ?? 10));
    const type = input.type ?? "all";
    const searchTerm = input.searchTerm.trim();
    const suggestions = await this.productSearchService.getSearchSuggestions(searchTerm, { limit, type });
    return QueryResult.success({ suggestions, query: searchTerm, type, limit });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
