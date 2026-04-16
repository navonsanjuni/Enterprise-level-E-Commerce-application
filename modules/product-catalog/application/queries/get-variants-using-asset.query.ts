import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService } from "../services/variant-media-management.service";

export interface GetVariantsUsingAssetQuery extends IQuery {
  readonly assetId: string;
}

export class GetVariantsUsingAssetHandler implements IQueryHandler<GetVariantsUsingAssetQuery, QueryResult<string[]>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetVariantsUsingAssetQuery): Promise<QueryResult<string[]>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getVariantsUsingAsset(query.assetId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
