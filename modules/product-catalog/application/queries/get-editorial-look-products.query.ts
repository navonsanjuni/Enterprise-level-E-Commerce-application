import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetEditorialLookProductsQuery extends IQuery {
  readonly id: string;
}

export class GetEditorialLookProductsHandler implements IQueryHandler<GetEditorialLookProductsQuery, QueryResult<string[]>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: GetEditorialLookProductsQuery): Promise<QueryResult<string[]>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.getLookProducts(query.id));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
