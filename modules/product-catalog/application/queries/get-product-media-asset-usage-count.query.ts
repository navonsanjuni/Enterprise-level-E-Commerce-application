import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductMediaManagementService } from "../services/product-media-management.service";

export interface GetProductMediaAssetUsageCountQuery extends IQuery {
  readonly assetId: string;
}

export interface ProductMediaAssetUsageCountResult {
  readonly assetId: string;
  readonly usageCount: number;
}

export class GetProductMediaAssetUsageCountHandler implements IQueryHandler<GetProductMediaAssetUsageCountQuery, QueryResult<ProductMediaAssetUsageCountResult>> {
  constructor(private readonly productMediaManagementService: ProductMediaManagementService) {}

  async handle(query: GetProductMediaAssetUsageCountQuery): Promise<QueryResult<ProductMediaAssetUsageCountResult>> {
    try {
    const usageCount = await this.productMediaManagementService.getAssetUsageCount(query.assetId);
    return QueryResult.success({ assetId: query.assetId, usageCount });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
