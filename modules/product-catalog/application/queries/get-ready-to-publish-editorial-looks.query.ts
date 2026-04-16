import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookDTO } from "../../domain/entities/editorial-look.entity";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetReadyToPublishEditorialLooksQuery extends IQuery {}

export class GetReadyToPublishEditorialLooksHandler implements IQueryHandler<GetReadyToPublishEditorialLooksQuery, QueryResult<EditorialLookDTO[]>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(_query: GetReadyToPublishEditorialLooksQuery): Promise<QueryResult<EditorialLookDTO[]>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.getReadyToPublishLooks());
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
