import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { MediaAssetDTO } from "../../domain/entities/media-asset.entity";
import { MediaManagementService } from "../services/media-management.service";

export interface GetMediaAssetQuery extends IQuery {
  readonly id: string;
}

export class GetMediaAssetHandler implements IQueryHandler<GetMediaAssetQuery, QueryResult<MediaAssetDTO>> {
  constructor(private readonly mediaManagementService: MediaManagementService) {}

  async handle(query: GetMediaAssetQuery): Promise<QueryResult<MediaAssetDTO>> {
    try {
    return QueryResult.success(await this.mediaManagementService.getAssetById(query.id));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
