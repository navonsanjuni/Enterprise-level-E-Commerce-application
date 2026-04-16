import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { StockAlertResult } from "./get-stock-alert.query";
import { StockAlertService } from "../services/stock-alert.service";

export interface ListStockAlertsQuery extends IQuery {
  readonly limit?: number;
  readonly offset?: number;
  readonly includeResolved?: boolean;
}

export interface ListStockAlertsResult {
  readonly alerts: StockAlertResult[];
  readonly total: number;
}

export class ListStockAlertsHandler implements IQueryHandler<
  ListStockAlertsQuery,
  QueryResult<ListStockAlertsResult>
> {
  constructor(private readonly stockAlertService: StockAlertService) {}

  async handle(query: ListStockAlertsQuery): Promise<QueryResult<ListStockAlertsResult>> {
    const result = await this.stockAlertService.listStockAlerts({
      limit: query.limit,
      offset: query.offset,
      includeResolved: query.includeResolved,
    });
    return QueryResult.success({ alerts: result.alerts, total: result.total });
  }
}
