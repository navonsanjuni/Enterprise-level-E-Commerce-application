import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface GetProductEditorialLooksQuery extends IQuery {
  readonly productId: string;
}

export class GetProductEditorialLooksHandler implements IQueryHandler<GetProductEditorialLooksQuery, QueryResult<string[]>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: GetProductEditorialLooksQuery): Promise<QueryResult<string[]>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.getProductLooks(query.productId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
