import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductTagDTO } from "../../domain/entities/product-tag.entity";
import { ProductTagManagementService } from "../services/product-tag-management.service";

export interface GetProductTagsQuery extends IQuery {
  readonly productId: string;
}

export class GetProductTagsHandler implements IQueryHandler<GetProductTagsQuery, QueryResult<ProductTagDTO[]>> {
  constructor(private readonly productTagManagementService: ProductTagManagementService) {}

  async handle(query: GetProductTagsQuery): Promise<QueryResult<ProductTagDTO[]>> {
    try {
    return QueryResult.success(await this.productTagManagementService.getProductTags(query.productId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
