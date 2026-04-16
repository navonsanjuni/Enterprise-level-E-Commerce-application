import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { VariantMediaManagementService, ColorVariantMedia } from "../services/variant-media-management.service";

export interface GetColorVariantMediaQuery extends IQuery {
  readonly productId: string;
  readonly color: string;
}

export class GetColorVariantMediaHandler implements IQueryHandler<GetColorVariantMediaQuery, QueryResult<ColorVariantMedia>> {
  constructor(private readonly variantMediaManagementService: VariantMediaManagementService) {}

  async handle(query: GetColorVariantMediaQuery): Promise<QueryResult<ColorVariantMedia>> {
    try {
    return QueryResult.success(await this.variantMediaManagementService.getColorVariantMedia(query.productId, decodeURIComponent(query.color)));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
