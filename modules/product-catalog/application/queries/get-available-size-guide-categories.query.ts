import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { Region } from "../../domain/enums/product-catalog.enums";
import { SizeGuideManagementService } from "../services/size-guide-management.service";

export interface GetAvailableSizeGuideCategoriesQuery extends IQuery {
  readonly region?: Region;
}

export interface AvailableSizeGuideCategoriesResult {
  readonly categories: string[];
  readonly meta: { region: string };
}

export class GetAvailableSizeGuideCategoriesHandler implements IQueryHandler<GetAvailableSizeGuideCategoriesQuery, QueryResult<AvailableSizeGuideCategoriesResult>> {
  constructor(private readonly sizeGuideManagementService: SizeGuideManagementService) {}

  async handle(query: GetAvailableSizeGuideCategoriesQuery): Promise<QueryResult<AvailableSizeGuideCategoriesResult>> {
    try {
    const categories = await this.sizeGuideManagementService.getAvailableCategories(query.region);
    return QueryResult.success({ categories, meta: { region: query.region ?? "all" } });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
