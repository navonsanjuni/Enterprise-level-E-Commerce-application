import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService } from "../services/variant-media-management.service";

export interface GetSizeVariantMediaQuery extends IQuery {
  readonly productId: string;
  readonly size: string;
}

export type SizeVariantMediaResult = Array<{
  readonly size: string;
  readonly variants: Array<{
    variantId: string;
    sku: string;
    color?: string;
    mediaAssets: Array<{ assetId: string; storageKey: string; mimeType: string }>;
  }>;
}>;

export class GetSizeVariantMediaHandler implements IQueryHandler<GetSizeVariantMediaQuery, QueryResult<SizeVariantMediaResult>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetSizeVariantMediaQuery): Promise<QueryResult<SizeVariantMediaResult>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getSizeVariantMedia(query.productId, decodeURIComponent(query.size)));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
