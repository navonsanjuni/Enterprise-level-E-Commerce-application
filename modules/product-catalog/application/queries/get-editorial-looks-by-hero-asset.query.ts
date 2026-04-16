import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookDTO } from "../../domain/entities/editorial-look.entity";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetEditorialLooksByHeroAssetQuery extends IQuery {
  readonly assetId: string;
}

export class GetEditorialLooksByHeroAssetHandler implements IQueryHandler<GetEditorialLooksByHeroAssetQuery, QueryResult<EditorialLookDTO[]>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: GetEditorialLooksByHeroAssetQuery): Promise<QueryResult<EditorialLookDTO[]>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.getLooksByHeroAsset(query.assetId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
