import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { Region } from "../../domain/enums/product-catalog.enums";
import { SizeGuideManagementService } from "../services/size-guide-management.service";

export interface GetAvailableSizeGuideRegionsQuery extends IQuery {}

export class GetAvailableSizeGuideRegionsHandler implements IQueryHandler<GetAvailableSizeGuideRegionsQuery, QueryResult<Region[]>> {
  constructor(private readonly sizeGuideManagementService: SizeGuideManagementService) {}

  async handle(_query: GetAvailableSizeGuideRegionsQuery): Promise<QueryResult<Region[]>> {
    try {
    return QueryResult.success(await this.sizeGuideManagementService.getAvailableRegions());
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
