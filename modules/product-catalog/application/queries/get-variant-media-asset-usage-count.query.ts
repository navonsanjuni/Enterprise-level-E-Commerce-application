import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService } from "../services/variant-media-management.service";

export interface GetVariantMediaAssetUsageCountQuery extends IQuery {
  readonly assetId: string;
}

export interface VariantMediaAssetUsageCountResult {
  readonly assetId: string;
  readonly usageCount: number;
}

export class GetVariantMediaAssetUsageCountHandler implements IQueryHandler<GetVariantMediaAssetUsageCountQuery, QueryResult<VariantMediaAssetUsageCountResult>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetVariantMediaAssetUsageCountQuery): Promise<QueryResult<VariantMediaAssetUsageCountResult>> {
    try {
    const usageCount = await this.variantMediaManagementService.getAssetUsageCount(query.assetId);
    return QueryResult.success({ assetId: query.assetId, usageCount });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
