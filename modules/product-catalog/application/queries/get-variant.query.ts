import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductVariantDTO } from "../../domain/entities/product-variant.entity";
import { VariantManagementService } from "../services/variant-management.service";

export interface GetVariantQuery extends IQuery {
  readonly variantId: string;
}

export class GetVariantHandler implements IQueryHandler<GetVariantQuery, QueryResult<ProductVariantDTO>> {
  constructor(private readonly variantManagementService: VariantManagementService) {}

  async handle(input: GetVariantQuery): Promise<QueryResult<ProductVariantDTO>> {
    try {
    return QueryResult.success(await this.variantManagementService.getVariantById(input.variantId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
