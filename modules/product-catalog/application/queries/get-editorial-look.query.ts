import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookDTO } from "../../domain/entities/editorial-look.entity";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetEditorialLookQuery extends IQuery {
  readonly id: string;
}

export class GetEditorialLookHandler implements IQueryHandler<GetEditorialLookQuery, QueryResult<EditorialLookDTO>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: GetEditorialLookQuery): Promise<QueryResult<EditorialLookDTO>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.getEditorialLookById(query.id));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
