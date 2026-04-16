import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService, VariantMediaSummary } from "../services/variant-media-management.service";

export interface GetVariantMediaQuery extends IQuery {
  readonly variantId: string;
}

export class GetVariantMediaHandler implements IQueryHandler<GetVariantMediaQuery, QueryResult<VariantMediaSummary>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetVariantMediaQuery): Promise<QueryResult<VariantMediaSummary>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getVariantMedia(query.variantId));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
