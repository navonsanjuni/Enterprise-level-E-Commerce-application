import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductMediaManagementService, ProductMediaServiceQueryOptions, ProductMediaSummary } from "../services/product-media-management.service";

export interface GetProductMediaQuery extends IQuery {
  readonly productId: string;
  readonly options?: ProductMediaServiceQueryOptions;
}

export class GetProductMediaHandler implements IQueryHandler<GetProductMediaQuery, QueryResult<ProductMediaSummary>> {
  constructor(private readonly productMediaManagementService: ProductMediaManagementService) {}

  async handle(query: GetProductMediaQuery): Promise<QueryResult<ProductMediaSummary>> {
    try {
    return QueryResult.success(await this.productMediaManagementService.getProductMedia(query.productId, query.options));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
