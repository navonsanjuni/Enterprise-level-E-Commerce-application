import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService, VariantMediaServiceQueryOptions, ProductVariantMediaSummary } from "../services/variant-media-management.service";

export interface GetProductVariantMediaQuery extends IQuery {
  readonly productId: string;
  readonly options?: VariantMediaServiceQueryOptions;
}

export class GetProductVariantMediaHandler implements IQueryHandler<GetProductVariantMediaQuery, QueryResult<ProductVariantMediaSummary>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetProductVariantMediaQuery): Promise<QueryResult<ProductVariantMediaSummary>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getProductVariantMedia(query.productId, query.options));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
