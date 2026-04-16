import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductTagDTO } from "../../domain/entities/product-tag.entity";
import { ProductTagManagementService } from "../services/product-tag-management.service";

export interface GetProductTagQuery extends IQuery {
  readonly id?: string;
  readonly name?: string;
}

export class GetProductTagHandler implements IQueryHandler<GetProductTagQuery, QueryResult<ProductTagDTO>> {
  constructor(private readonly productTagManagementService: ProductTagManagementService) {}

  async handle(query: GetProductTagQuery): Promise<QueryResult<ProductTagDTO>> {
    try {
    if (query.id) {
      return QueryResult.success(await this.productTagManagementService.getTagById(query.id));
    }
    return QueryResult.success(await this.productTagManagementService.getTagByName(query.name!));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
