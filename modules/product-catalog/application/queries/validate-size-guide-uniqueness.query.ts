import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { Region } from "../../domain/enums/product-catalog.enums";
import { SizeGuideManagementService } from "../services/size-guide-management.service";

export interface ValidateSizeGuideUniquenessQuery extends IQuery {
  readonly region: Region;
  readonly category?: string;
}

export interface SizeGuideUniquenessResult {
  readonly region: Region;
  readonly category: string | null;
  readonly isUnique: boolean;
  readonly available: boolean;
}

export class ValidateSizeGuideUniquenessHandler implements IQueryHandler<ValidateSizeGuideUniquenessQuery, QueryResult<SizeGuideUniquenessResult>> {
  constructor(private readonly sizeGuideManagementService: SizeGuideManagementService) {}

  async handle(query: ValidateSizeGuideUniquenessQuery): Promise<QueryResult<SizeGuideUniquenessResult>> {
    try {
    const category = query.category ?? null;
    const isUnique = await this.sizeGuideManagementService.validateSizeGuideUniqueness(query.region, category);
    return QueryResult.success({ region: query.region, category, isUnique, available: isUnique });
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
