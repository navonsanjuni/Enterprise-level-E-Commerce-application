import {
  IQuery,
  IQueryHandler,
} from '../../../../packages/core/src/application/cqrs';
import { PromotionService, PromotionUsageDto } from '../services/promotion.service';

export interface GetPromotionUsageQuery extends IQuery {
  readonly promoId: string;
}

export class GetPromotionUsageHandler implements IQueryHandler<
  GetPromotionUsageQuery,
  PromotionUsageDto[]
> {
  constructor(private readonly promotionService: PromotionService) {}

  async handle(query: GetPromotionUsageQuery): Promise<PromotionUsageDto[]> {
    return this.promotionService.getPromotionUsage(query.promoId);
  }
}
