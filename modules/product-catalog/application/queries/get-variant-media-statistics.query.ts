import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService } from "../services/variant-media-management.service";

export interface GetVariantMediaStatisticsQuery extends IQuery {
  readonly variantId: string;
}

export interface VariantMediaStatisticsResult {
  readonly totalMedia: number;
  readonly imageCount: number;
  readonly videoCount: number;
  readonly otherCount: number;
  readonly totalSize: number;
  readonly averageFileSize: number;
}

export class GetVariantMediaStatisticsHandler implements IQueryHandler<GetVariantMediaStatisticsQuery, QueryResult<VariantMediaStatisticsResult>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetVariantMediaStatisticsQuery): Promise<QueryResult<VariantMediaStatisticsResult>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getVariantMediaStatistics(query.variantId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
