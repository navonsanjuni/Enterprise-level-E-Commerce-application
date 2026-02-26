import { IQuery, IQueryHandler } from "@/api/src/shared/application";
import { StockManagementService } from "../../services/stock-management.service";

export class GetStockStatsQuery implements IQuery {}

export class GetStockStatsQueryHandler implements IQueryHandler<GetStockStatsQuery> {
  constructor(private readonly stockService: StockManagementService) {}

  async handle(query: GetStockStatsQuery): Promise<any> {
    return this.stockService.getStats();
  }
}
