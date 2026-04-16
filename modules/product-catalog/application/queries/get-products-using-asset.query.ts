import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductMediaManagementService } from "../services/product-media-management.service";

export interface GetProductsUsingAssetQuery extends IQuery {
  readonly assetId: string;
}

export class GetProductsUsingAssetHandler implements IQueryHandler<GetProductsUsingAssetQuery, QueryResult<string[]>> {
  constructor(private readonly productMediaManagementService: ProductMediaManagementService) {}

  async handle(query: GetProductsUsingAssetQuery): Promise<QueryResult<string[]>> {
    try {
    return QueryResult.success(await this.productMediaManagementService.getProductsUsingAsset(query.assetId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
