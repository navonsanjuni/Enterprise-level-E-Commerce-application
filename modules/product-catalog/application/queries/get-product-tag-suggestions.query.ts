import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductTagDTO } from "../../domain/entities/product-tag.entity";
import { ProductTagManagementService } from "../services/product-tag-management.service";

export interface GetProductTagSuggestionsQuery extends IQuery {
  readonly query: string;
  readonly limit?: number;
}

export class GetProductTagSuggestionsHandler implements IQueryHandler<GetProductTagSuggestionsQuery, QueryResult<ProductTagDTO[]>> {
  constructor(private readonly productTagManagementService: ProductTagManagementService) {}

  async handle(input: GetProductTagSuggestionsQuery): Promise<QueryResult<ProductTagDTO[]>> {
    try {
    return QueryResult.success(await this.productTagManagementService.getTagSuggestions(
      input.query.trim(),
      Math.min(50, Math.max(1, input.limit ?? 10)),
    ));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
