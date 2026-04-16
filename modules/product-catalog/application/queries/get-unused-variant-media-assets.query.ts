import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService } from "../services/variant-media-management.service";

export interface GetUnusedVariantMediaAssetsQuery extends IQuery {
  readonly productId?: string;
}

export interface UnusedVariantMediaAssetsResult {
  readonly assets: string[];
  readonly meta: { productId: string };
}

export class GetUnusedVariantMediaAssetsHandler implements IQueryHandler<GetUnusedVariantMediaAssetsQuery, QueryResult<UnusedVariantMediaAssetsResult>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetUnusedVariantMediaAssetsQuery): Promise<QueryResult<UnusedVariantMediaAssetsResult>> {
    try {
    const assets = await this.variantMediaManagementService.getUnusedAssets(query.productId);
    return QueryResult.success({ assets, meta: { productId: query.productId ?? "all" } });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
