import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { ProductTagManagementService } from "../services/product-tag-management.service";

export interface ValidateProductTagQuery extends IQuery {
  readonly name: string;
}

export interface ProductTagValidationResult {
  readonly tagName: string;
  readonly isValid: boolean;
  readonly available: boolean;
}

export class ValidateProductTagHandler implements IQueryHandler<ValidateProductTagQuery, QueryResult<ProductTagValidationResult>> {
  constructor(private readonly productTagManagementService: ProductTagManagementService) {}

  async handle(query: ValidateProductTagQuery): Promise<QueryResult<ProductTagValidationResult>> {
    try {
    const isValid = await this.productTagManagementService.validateTag(decodeURIComponent(query.name));
    return QueryResult.success({ tagName: query.name, isValid, available: isValid });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
