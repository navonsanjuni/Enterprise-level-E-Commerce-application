import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { SizeGuideDTO } from "../../domain/entities/size-guide.entity";
import { Region } from "../../domain/enums/product-catalog.enums";
import { SizeGuideManagementService } from "../services/size-guide-management.service";

export interface GetGeneralSizeGuidesQuery extends IQuery {
  readonly region: Region;
}

export interface GeneralSizeGuidesResult {
  readonly guides: SizeGuideDTO[];
  readonly meta: { region: Region; count: number };
}

export class GetGeneralSizeGuidesHandler implements IQueryHandler<GetGeneralSizeGuidesQuery, QueryResult<GeneralSizeGuidesResult>> {
  constructor(private readonly sizeGuideManagementService: SizeGuideManagementService) {}

  async handle(query: GetGeneralSizeGuidesQuery): Promise<QueryResult<GeneralSizeGuidesResult>> {
    try {
    const guides = await this.sizeGuideManagementService.getGeneralSizeGuides(query.region);
    return QueryResult.success({ guides, meta: { region: query.region, count: guides.length } });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
