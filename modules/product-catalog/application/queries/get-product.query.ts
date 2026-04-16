import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductDTO } from "../../domain/entities/product.entity";
import { ProductManagementService } from "../services/product-management.service";
import { DomainValidationError } from "../../domain/errors/product-catalog.errors";

export interface GetProductQuery extends IQuery {
  readonly productId?: string;
  readonly slug?: string;
}

export class GetProductHandler implements IQueryHandler<GetProductQuery, QueryResult<ProductDTO>> {
  constructor(private readonly productManagementService: ProductManagementService) {}

  async handle(input: GetProductQuery): Promise<QueryResult<ProductDTO>> {
    try {
    if (!input.productId && !input.slug) {
      throw new DomainValidationError("Either productId or slug is required");
    }
    if (input.productId) {
      return QueryResult.success(await this.productManagementService.getProductById(input.productId));
    }
    return QueryResult.success(await this.productManagementService.getProductBySlug(input.slug!));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
