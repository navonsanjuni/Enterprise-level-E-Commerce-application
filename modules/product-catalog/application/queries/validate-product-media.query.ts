import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductMediaManagementService } from "../services/product-media-management.service";

export interface ValidateProductMediaQuery extends IQuery {
  readonly productId: string;
}

export interface ProductMediaValidationResult {
  readonly isValid: boolean;
  readonly issues: string[];
}

export class ValidateProductMediaHandler implements IQueryHandler<ValidateProductMediaQuery, QueryResult<ProductMediaValidationResult>> {
  constructor(private readonly productMediaManagementService: ProductMediaManagementService) {}

  async handle(query: ValidateProductMediaQuery): Promise<QueryResult<ProductMediaValidationResult>> {
    try {
    return QueryResult.success(await this.productMediaManagementService.validateProductMedia(query.productId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
